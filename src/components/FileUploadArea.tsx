import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, LinearProgress, Link } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import SimplePeer from 'simple-peer';

const UploadBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    border: `2px dashed ${theme.palette.primary.main}`,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const FileUploadArea: React.FC = () => {
    const [transferProgress, setTransferProgress] = useState<number>(0);
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [shareLink, setShareLink] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');

    const createRoom = async (file: File) => {
        try {
            // 创建 WebRTC 连接
            const peer = new SimplePeer({
                initiator: true,
                trickle: false // enable/disable trickle ICE and get a single 'signal' event (slower)
            });

            // 等待获取信令数据
            const signalData = await new Promise((resolve) => {
                peer.on('signal', resolve);
            });

            // 创建房间并发送信令数据
            const response = await fetch('http://localhost:3001/create-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signal: signalData,
                    fileName: file.name,
                    fileSize: file.size
                })
            });

            if (!response.ok) {
                throw new Error('创建房间失败');
            }

            const data = await response.json();
            setRoomId(data.roomId);
            setShareLink(data.shareLink);

            // 创建房间后，等待设备 B 加入
            console.log('房间已创建，等待接收方加入');

            // 开始轮询接收方加入状态
            await waitForReceiverToJoin(data.roomId, peer);

            // 当连接建立时
            peer.on('connect', () => {
                console.log('连接已建立');
                // sendFile(file, peer);
            });

            // 处理错误
            peer.on('error', err => {
                console.error('Peer connection error:', err);
                setIsTransferring(false);
            });

        } catch (error) {
            console.error('Error in createRoom:', error);
            setIsTransferring(false);
        }
    };

    const waitForReceiverToJoin = async (roomId: string, peer: SimplePeer.Instance): Promise<void> => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`http://localhost:3001/room/${roomId}/status`);
                    if (!response.ok) {
                        throw new Error('获取房间状态失败');
                    }
                    const status = await response.json();
                    console.log('房间状态:', status);

                    // 判断是否有接收方信令数据
                    if (status.receiverSignal) {
                        console.log('接收方已加入，开始创建 WebRTC 连接');
                        peer.signal(status.receiverSignal);
                        clearInterval(interval);
                        clearTimeout(timeout);
                        resolve();
                    }
                } catch (error) {
                    console.error('轮询接收方状态失败:', error);
                }
            }, 1000);

            const timeout = setTimeout(() => {
                clearInterval(interval);
                reject(new Error('接收方未在规定时间内加入'));
            }, 60000);
        });
    };


    const sendFile = (file: File, peer: SimplePeer.Instance) => {
        const chunkSize = 16384; // 16KB chunks
        let offset = 0;

        // 首先发送文件信息
        peer.send(JSON.stringify({
            type: 'file-info',
            name: file.name,
            size: file.size
        }));

        // 分块读取并发送文件
        const reader = new FileReader();

        reader.onload = (e) => {
            const chunk = e.target?.result;
            if (chunk) {
                peer.send(chunk);
                offset += chunkSize;

                // 更新进度
                const progress = Math.min(100, (offset / file.size) * 100);
                setTransferProgress(progress);

                // 继续读取下一块
                if (offset < file.size) {
                    readNextChunk();
                } else {
                    // 传输完成
                    setIsTransferring(false);
                    setSelectedFile(null);
                }
            }
        };

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        // 开始传输
        readNextChunk();
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setSelectedFile(file);
        setIsTransferring(true);
        createRoom(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false
    });

    return (
        <Box sx={{ width: '100%' }}>
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
                    {shareLink && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary">
                                分享链接：
                            </Typography>
                            <Link href={shareLink} target="_blank" sx={{ wordBreak: 'break-all' }}>
                                {shareLink}
                            </Link>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                将此链接发送给接收方以开始传输
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default FileUploadArea;
