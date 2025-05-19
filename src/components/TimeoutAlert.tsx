import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const AlertPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: '#fff3e0',
    border: `1px solid ${theme.palette.warning.main}`,
    maxWidth: 500,
    margin: '0 auto',
}));

interface TimeoutAlertProps {
    onReset: () => void;
}

const TimeoutAlert: React.FC<TimeoutAlertProps> = ({ onReset }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '400px'
        }}>
            <AlertPaper elevation={3}>
                <Typography variant="h5" color="warning.main" gutterBottom>
                    连接超时
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    很抱歉，接收方未在规定时间内加入房间。
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    房间已自动关闭，您可以重新开始传输。
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onReset}
                    sx={{ mt: 2 }}
                >
                    返回首页
                </Button>
            </AlertPaper>
        </Box>
    );
};

export default TimeoutAlert; 