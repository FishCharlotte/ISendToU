import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, LinearProgress, IconButton, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import SimplePeer, {SignalData} from 'simple-peer';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '../utils';
import { Snackbar, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CompletedFilesList } from "./CompletedFilesList";
import {checkRoomStatusApi, createRoomApi} from "../api";
import TimeoutAlert from './TimeoutAlert';

const UploadBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: '#ffffff',
    border: `2px dashed ${theme.palette.primary.main}`,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

interface FileUploadAreaProps {
    onFileUpload?: () => void;
    onTimeout?: () => void;
}

const WAIT_TIMEOUT = 60; // 等待接收方加入的超时时间（秒）

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFileUpload, onTimeout }) => {
    const [transferProgress, setTransferProgress] = useState<number>(0);
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [shareLink, setShareLink] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [completedFiles, setCompletedFiles] = useState<Array<{ name: string; size: number }>>([]);
    const [isTimeout, setIsTimeout] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(WAIT_TIMEOUT);
    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [copyMessage, setCopyMessage] = useState('');

    const resetState = () => {
        setTransferProgress(0);
        setIsWaiting(false);
        setIsTransferring(false);
        setSelectedFile(null);
        setShareLink('');
        setRoomId('');
        setIsTimeout(false);
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }

        onTimeout?.();
    };

    const createRoom = async (file: File) => {
        try {
            if (peerRef.current) {
                console.log('连接已存在，直接发送文件');
                sendFile(file, peerRef.current);
                return;
            }

            const peer = new SimplePeer({
                initiator: true,
                trickle: false,
            });

            peerRef.current = peer; // 存储 SimplePeer 实例

            const signalData: SignalData = await new Promise((resolve) => {
                peer.on('signal', resolve);
            });

            const data = await createRoomApi(signalData, file.name, file.size);

            setRoomId(data.roomId);
            setShareLink(data.shareLink);
            setIsWaiting(true);

            console.log('房间已创建，等待接收方加入');

            await waitForReceiverToJoin(data.roomId, peer);
            setIsWaiting(false);

            peer.on('connect', () => {
                console.log('连接已建立，文件开始传输');
                sendFile(file, peer);
            });

            peer.on('error', (err) => {
                console.error('Peer connection error:', err);
                setIsTransferring(false);
                setIsWaiting(false);
                peerRef.current = null; // 清除无效连接
            });
        } catch (error) {
            console.error('Error in createRoom:', error);
            setIsTransferring(false);
            setIsWaiting(false);
        }
    };

    const waitForReceiverToJoin = async (roomId: string, peer: SimplePeer.Instance): Promise<void> => {
        return new Promise((resolve, reject) => {
            setCountdown(WAIT_TIMEOUT); // 使用常量重置倒计时
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const interval = setInterval(async () => {
                try {
                    const status = await checkRoomStatusApi(roomId);
                    console.log('房间状态:', status);

                    if (status.receiverSignal) {
                        console.log('接收方已加入，开始创建 WebRTC 连接');
                        peer.signal(status.receiverSignal);
                        clearInterval(interval);
                        clearInterval(countdownInterval);
                        clearTimeout(timeout);
                        resolve();
                    }
                } catch (error) {
                    console.error('轮询接收方状态失败:', error);
                }
            }, 1000);

            const timeout = setTimeout(async () => {
                clearInterval(interval);
                clearInterval(countdownInterval);
                setIsTimeout(true);
                reject(new Error('接收方未在规定时间内加入，房间已关闭'));
            }, WAIT_TIMEOUT * 1000); // 使用常量设置超时时间
        });
    };

    const sendFile = (file: File, peer: SimplePeer.Instance) => {
        const chunkSize = 16384; // 16KB
        let offset = 0;
        let sending = false;

        const channel = (peer as any)._channel as RTCDataChannel;

        if (!channel) {
            console.error('无法访问底层 RTCDataChannel');
            return;
        }

        channel.bufferedAmountLowThreshold = 512 * 1024;

        peer.send(
            JSON.stringify({
                type: 'file-info',
                name: file.name,
                size: file.size,
            })
        );

        const reader = new FileReader();

        const readNextChunk = () => {
            if (offset >= file.size || sending) return;

            if (channel.bufferedAmount > 1 * 1024 * 1024) return;

            const slice = file.slice(offset, offset + chunkSize);
            sending = true;
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            const chunk = e.target?.result;
            if (chunk) {
                peer.send(chunk);
                offset += chunkSize;
                sending = false;

                const progress = Math.min(100, (offset / file.size) * 100);
                setTransferProgress(progress);

                if (offset < file.size) {
                    readNextChunk();
                } else {
                    peer.send(JSON.stringify({ type: 'transfer-complete' }));
                    setIsTransferring(false);
                    setSelectedFile(null);
                    setCompletedFiles((prev) => [...prev, { name: file.name, size: file.size }]);
                }
            }
        };

        channel.addEventListener('bufferedamountlow', () => {
            readNextChunk();
        });

        readNextChunk();
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setSelectedFile(file);
        setIsTransferring(true);
        createRoom(file);
        onFileUpload?.(); // 调用onFileUpload回调
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false
    });

    const handleCopyLink = async () => {
        const success = await copyToClipboard(shareLink);
        if (success) {
            setCopyMessage('链接已复制到剪贴板');
            setShowCopySuccess(true);
        }
    };

    const handleCopyRoomId = async () => {
        const success = await copyToClipboard(roomId);
        if (success) {
            setCopyMessage('房间号已复制到剪贴板');
            setShowCopySuccess(true);
        }
    };

    if (isTimeout) {
        return <TimeoutAlert onReset={resetState} />;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={isWaiting ? 6 : 12}>
                    <UploadBox {...getRootProps()}
                           sx={{
                               height: '400px',
                               display: 'flex',
                               flexDirection: 'column',
                               justifyContent: 'center',
                               alignItems: 'center',
                           }}>
                        <input {...getInputProps()} />
                        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            上传您的文件和文件夹
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            {isDragActive ? '放开以上传文件' : '点击或拖放文件到此处'}
                        </Typography>
                    </UploadBox>
                    {isTransferring && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress variant="determinate" value={transferProgress} />
                            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                                传输进度: {transferProgress}%
                            </Typography>
                        </Box>
                    )}
                </Grid>

                {isWaiting && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                邀请接收方
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        房间号：
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                            {roomId}
                                        </Typography>
                                        <IconButton onClick={handleCopyRoomId} size="small">
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        分享链接：
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                            {shareLink}
                                        </Typography>
                                        <IconButton onClick={handleCopyLink} size="small">
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <QRCodeSVG value={shareLink} size={200} />
                                </Box>

                                <Typography variant="body2" color="textSecondary" align="center">
                                    将此链接发送给接收方以开始传输
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                    mt: 1
                                }}>
                                    <Typography
                                        variant="body2"
                                        color={countdown <= 10 ? 'error' : 'textSecondary'}
                                        sx={{
                                            fontWeight: 'bold',
                                            transition: 'color 0.3s'
                                        }}
                                    >
                                        剩余时间：{countdown} 秒
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {completedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        已完成的传输
                    </Typography>
                    <CompletedFilesList data={completedFiles} />
                </Box>
            )}

            <Snackbar
                open={showCopySuccess}
                autoHideDuration={3000}
                onClose={() => setShowCopySuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
                    {copyMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FileUploadArea;
