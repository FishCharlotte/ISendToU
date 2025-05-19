import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, CssBaseline, Grid, TextField, Button, Paper, Typography, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import FileUploadArea from './components/FileUploadArea';
import FileReceiver from './components/FileReceiver';
import Header from './components/Header';
import { checkRoomStatusApi } from './api';
import ClearIcon from '@mui/icons-material/Clear';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f5f5f5',
        },
    },
});

const RoomInput: React.FC<{ onJoin: (roomId: string) => void }> = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClear = () => {
        setRoomId('');
        setError(null);
    };

    const checkAndJoinRoom = async (id: string) => {
        if (id.length !== 7) return;
        
        setIsChecking(true);
        setError(null);
        
        try {
            const status = await checkRoomStatusApi(id);
            if (status.error) {
                setError(status.error);
                return;
            }
            onJoin(id);
        } catch (err) {
            setError('检查房间状态失败');
        } finally {
            setIsChecking(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7);
        setRoomId(value);
        setError(null);
        if (value.length === 7) {
            checkAndJoinRoom(value);
        }
    };

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                加入房间
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        fullWidth
                        label="房间号"
                        value={roomId}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        error={!!error}
                        disabled={isChecking}
                        InputProps={{
                            endAdornment: roomId && (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="清除输入"
                                        onClick={handleClear}
                                        edge="end"
                                        size="small"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            inputProps: {
                                maxLength: 7,
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => checkAndJoinRoom(roomId)}
                        disabled={roomId.length !== 7 || isChecking}
                        sx={{ minWidth: { xs: '100%', sm: '100px' } }}
                    >
                        {isChecking ? <CircularProgress size={24} /> : '进入'}
                    </Button>
                </Box>
                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Paper>
    );
};

const App: React.FC = () => {
    const [isReceiver, setIsReceiver] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        // 检查URL是否包含room参数
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromUrl = urlParams.get('room');
        if (roomIdFromUrl) {
            setRoomId(roomIdFromUrl);
            setIsReceiver(true);
        }
    }, []);

    const handleJoinRoom = (newRoomId: string) => {
        setRoomId(newRoomId);
        setIsReceiver(true);
        // 更新URL，但不刷新页面
        window.history.pushState({}, '', `?room=${newRoomId}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
                    {isReceiver ? (
                        <FileReceiver />
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FileUploadArea />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <RoomInput onJoin={handleJoinRoom} />
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App;
