import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { checkRoomStatusApi } from '../api';

interface RoomInputProps {
    onJoin: (roomId: string) => void;
}

const RoomInput: React.FC<RoomInputProps> = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7);
        setRoomId(value);
        setError(null);
    };

    const handleJoin = async () => {
        if (roomId.length !== 7) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const status = await checkRoomStatusApi(roomId);
            if (status.error) {
                setError(status.error);
                return;
            }
            onJoin(roomId);
        } catch {
            setError('检查房间状态失败');
        } finally {
            setIsLoading(false);
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
                        disabled={isLoading}
                        InputProps={{
                            endAdornment: roomId && (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="清除输入"
                                        onClick={() => setRoomId('')}
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
                        onClick={handleJoin}
                        disabled={roomId.length !== 7 || isLoading}
                        sx={{ minWidth: { xs: '100%', sm: '100px' } }}
                    >
                        {isLoading ? <CircularProgress size={24} /> : '进入'}
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

export default RoomInput; 