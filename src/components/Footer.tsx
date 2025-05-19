import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) => theme.palette.grey[100],
                textAlign: 'center',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} 超小号鱼 |{' '}
                <Link href="https://xxsfish.com" target="_blank" rel="noopener noreferrer" color="inherit">
                    xxsfish.com
                </Link>
            </Typography>
        </Box>
    );
};

export default Footer; 