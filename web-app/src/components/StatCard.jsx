import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function StatCard({ title, value, subtext, trend, trendValue, icon: Icon, color, delay = 0 }) {
    const theme = useTheme();

    const activeColor = color || theme.palette.primary.main;

    return (
        <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay, ease: 'backOut' }}
            sx={{
                p: 3,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: activeColor,
                    boxShadow: `0 0 20px -5px ${activeColor}40`,
                    transform: 'translateY(-5px)',
                    background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, ${activeColor}10 100%)`
                }
            }}
        >
            {/* Background Decor */}
            <Box sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${activeColor}40 0%, transparent 70%)`,
                filter: 'blur(20px)',
                opacity: 0.5,
                pointerEvents: 'none'
            }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {title}
                    </Typography>
                </Box>
                {Icon && (
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${activeColor}20`,
                        color: activeColor,
                        boxShadow: `0 0 10px ${activeColor}40`
                    }}>
                        <Icon size={20} strokeWidth={2.5} />
                    </Box>
                )}
            </Box>

            <Box>
                <Typography variant="h3" sx={{
                    fontWeight: 800,
                    color: '#fff',
                    textShadow: `0 0 20px ${activeColor}40`,
                    mb: 0.5
                }}>
                    {value}
                </Typography>

                {subtext && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {subtext}
                    </Typography>
                )}

                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {trend === 'up' ? <TrendingUp size={14} color={theme.palette.success.main} /> : <TrendingDown size={14} color={theme.palette.error.main} />}
                        <Typography variant="body2" sx={{ color: trend === 'up' ? 'success.main' : 'error.main', fontWeight: 700 }}>
                            {trendValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">vs last month</Typography>
                    </Box>
                )}
            </Box>
        </MotionPaper>
    );
}
