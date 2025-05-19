import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Header: React.FC = () => {
    return (
        <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
                <Box display="flex" alignItems="center">
                    <CloudUploadIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div">
                        ISendToU-我发俾你
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
