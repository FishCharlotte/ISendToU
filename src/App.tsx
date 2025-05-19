import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, CssBaseline, Grid } from '@mui/material';
import FileUploadArea from './components/FileUploadArea';
import FileReceiver from './components/FileReceiver';
import Header from './components/Header';
import Footer from './components/Footer';
import RoomInput from './components/RoomInput';

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
    const [roomId, setRoomId] = useState<string | null>(null);
    const [hasUploadedFile, setHasUploadedFile] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromUrl = urlParams.get('room');
        if (roomIdFromUrl) {
            setRoomId(roomIdFromUrl);
        }
    }, []);

    const handleJoinRoom = (newRoomId: string) => {
        setRoomId(newRoomId);
        window.history.pushState({}, '', `?room=${newRoomId}`);
    };

    const handleFileUpload = () => setHasUploadedFile(true);
    const handleTimeout = () => setHasUploadedFile(false);

    const renderContent = () => {
        if (roomId) {
            return <FileReceiver />;
        }

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={hasUploadedFile ? 12 : 6}>
                    <FileUploadArea 
                        onFileUpload={handleFileUpload} 
                        onTimeout={handleTimeout} 
                    />
                </Grid>
                {!hasUploadedFile && (
                    <Grid item xs={12} md={6}>
                        <RoomInput onJoin={handleJoinRoom} />
                    </Grid>
                )}
            </Grid>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
                    {renderContent()}
                </Container>
                <Footer />
            </Box>
        </ThemeProvider>
    );
};

export default App;
