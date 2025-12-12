import React from 'react';
import { Paper, Typography, Box, useTheme, IconButton } from '@mui/material';
import { MoreHorizontal, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function ChartCard({ title, subtitle, children, height, action }) {
    const theme = useTheme();

    return (
        <MotionPaper
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            sx={{
                p: 0,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: typeof height === 'number' ? height : 'auto',
                minHeight: typeof height === 'number' ? height : 300,
                minWidth: 400,
            }}
        >
            <Box sx={{
                p: 3,
                pb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.01) 0%, transparent 100%)'
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.01em', color: '#fff' }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action || (
                    <IconButton size="small" sx={{ color: 'text.disabled', '&:hover': { color: theme.palette.primary.main } }}>
                        <MoreHorizontal size={20} />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ flex: 1, p: 3, position: 'relative', minHeight: 0 }}>
                {children}
            </Box>
        </MotionPaper>
    );
}
