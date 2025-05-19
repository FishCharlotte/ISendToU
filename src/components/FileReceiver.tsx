import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { styled } from '@mui/material/styles';
import SimplePeer from 'simple-peer';
import { FileInfo } from '../types';
import { saveFileToLocal } from "../utils";
import {CompletedFilesList} from "./CompletedFilesList";


const ReceiverBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    border: `2px dashed ${theme.palette.primary.main}`,
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
}));

const FileReceiver: React.FC = () => {
    const [isJoining, setIsJoining] = useState(false);
    const [canConnect, setCanConnect] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [transferProgress, setTransferProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const [senderSignal, setSenderSignal] = useState<string | null>(null);
    const [completedFiles, setCompletedFiles] = useState<Array<FileInfo>>([]);

    useEffect(() => {
        // 1. 从URL获取roomId
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromUrl = urlParams.get('room');

        if (!roomIdFromUrl) {
            setError('无效的房间ID');
            return;
        }

        setRoomId(roomIdFromUrl);
        setIsJoining(true);
        console.log('尝试加入房间:', roomIdFromUrl);
    }, []);

    useEffect(() => {
        if (!isJoining) return;

        // 2. 先检查房间状态
        fetch(`http://192.168.3.171:3001/room/${roomId}/status`)
            .then(statusResponse => {
                return statusResponse.json();
            })
            .then(status => {
                console.log('statusResponse', status);
                if (!status.exists || status.hasReceiver || !status.canJoin) {
                    console.log(status.exists, status.hasReceiver, status.canJoin);
                    const errorMessage = !status.exists ? '房间不存在' : '房间已满或已关闭';
                    throw new Error(errorMessage);
                }

                console.log("可以加入");

                // 接收后台服务器的信令数据
                return fetch(`http://192.168.3.171:3001/signal/${roomId}`);
            })
            .then(res => {
                return res.json();
            })
            .then(initiatorSignal => {
                if (!initiatorSignal || !initiatorSignal.signal) {
                    throw new Error('未能获取发送方信令数据');
                }

                setSenderSignal(initiatorSignal.signal);
                setCanConnect(true);
            })
            .catch(err => {
                console.error('加入房间错误:', error);
                setError(err.message);
                setIsJoining(false);
            })
    }, [isJoining]);

    useEffect(() => {
        if (!canConnect || !senderSignal) return;

        // 3. 创建WebRTC连接
        const peer = new SimplePeer({
            initiator: false,
            trickle: false
        });
        console.log("创建连接", peer);

        // 设置远端（发送方）信令数据
        peer.signal(senderSignal);

        // 处理连接建立
        peer.on('connect', () => {
            console.log('WebRTC连接已建立');
            setIsConnected(true);
            setIsJoining(false);
        });

        // 监听自身 signal 事件，生成接收方的信令数据
        peer.on('signal', async (receiverSignal) => {
            try {
                console.log('发送接收方信令数据');

                const joinResponse = await fetch(`http://192.168.3.171:3001/join/${roomId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        signal: receiverSignal,
                        role: 'receiver',
                    }),
                });

                if (!joinResponse.ok) {
                    const signalError = await joinResponse.json();
                    throw new Error(signalError.error || '发送信令数据失败');
                }

                console.log('接收方信令已成功发送');
                console.log("加入房间");
            } catch (error) {
                console.error('发送信令数据错误:', error);
                setError('连接失败');
            }
        });


        // 处理接收到的数据
        let fileInfo: FileInfo;
        let receivedSize = 0;
        let fileBuffer: Uint8Array[] = [];

        peer.on('data', data => {
            try {
                const jsonData = JSON.parse(data.toString());
                console.log('收到数据:', jsonData);
                if (jsonData.type === 'file-info') {
                    console.log('收到文件信息:', jsonData);
                    fileInfo = {
                        name: jsonData.name,
                        size: jsonData.size
                    };
                    return;
                } else if (jsonData.type === 'transfer-complete') {
                    console.log('transfer-complete: ', fileInfo);

                    // 添加到已完成文件列表
                    if (fileInfo) {
                        setCompletedFiles(prev => [...prev, fileInfo]);
                    }
                }
            } catch {
                // 如果不是JSON，则是文件数据
                if (fileInfo) {
                    fileBuffer.push(new Uint8Array(data));
                    receivedSize += data.length;

                    // 更新进度
                    const progress = Math.min(100, (receivedSize / fileInfo.size) * 100);
                    setTransferProgress(progress);

                    // 检查是否接收完成
                    if (receivedSize >= fileInfo.size) {
                        console.log('文件接收完成');

                        // 保存文件到本地
                        saveFileToLocal(fileBuffer, fileInfo.name);

                        fileBuffer = [];
                        receivedSize = 0;
                    }
                }
            }
        });

        // 处理错误
        peer.on('error', err => {
            console.error('WebRTC连接错误:', err);
            setError('连接出错');
            setIsJoining(false);
        });

        peerRef.current = peer;

        // 组件卸载时清理
        return () => {
            console.log('组件卸载，清理连接');
            peer.destroy();
        };
    }, [canConnect, senderSignal]);


    return (
        <Box sx={{ width: '100%' }}>
            <ReceiverBox>
                <CloudDownloadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {error ? '连接错误' : isJoining ? '正在加入房间...' : isConnected ? '已连接，等待文件传输' : '准备接收文件'}
                </Typography>
                {error && (
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                )}
                {roomId && !error && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        房间ID: {roomId}
                    </Typography>
                )}
                {isConnected && transferProgress > 0 && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress variant="determinate" value={transferProgress} />
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            接收进度: {transferProgress}%
                        </Typography>
                    </Box>
                )}
            </ReceiverBox>

            {completedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        已接收的文件
                    </Typography>
                    <CompletedFilesList data={completedFiles} />
                </Box>
            )}
        </Box>
    );
};

export default FileReceiver;
