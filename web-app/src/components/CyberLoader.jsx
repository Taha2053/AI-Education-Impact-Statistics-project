import React from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

export default function CyberLoader({ message = "Initializing analytics core..." }) {
    const theme = useTheme();

    return (
        <Box sx={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3
        }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress
                    size={80}
                    thickness={2}
                    sx={{ color: theme.palette.primary.main, opacity: 0.5 }}
                />
                <CircularProgress
                    size={80}
                    thickness={2}
                    sx={{
                        color: theme.palette.secondary.main,
                        position: 'absolute',
                        left: 0,
                        animationDuration: '1.5s',
                        [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' }
                    }}
                />
                <Box sx={{ position: 'absolute' }}>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Box sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 0 15px ${theme.palette.primary.main}`
                        }} />
                    </motion.div>
                </Box>
            </Box>
            <Typography
                variant="h6"
                sx={{
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, #fff, ${theme.palette.secondary.main})`,
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradient 3s linear infinite',
                    fontSize: '1rem',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    '@keyframes gradient': {
                        '0%': { backgroundPosition: '0% center' },
                        '100%': { backgroundPosition: '200% center' }
                    }
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
