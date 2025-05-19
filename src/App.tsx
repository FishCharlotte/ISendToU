import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, CssBaseline } from '@mui/material';
import FileUploadArea from './components/FileUploadArea';
import FileReceiver from './components/FileReceiver';
import Header from './components/Header';

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

const App: React.FC = () => {
    const [isReceiver, setIsReceiver] = useState(false);

    useEffect(() => {
        // 检查URL是否包含room参数
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        setIsReceiver(!!roomId);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
                    {isReceiver ? <FileReceiver /> : <FileUploadArea />}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App;
