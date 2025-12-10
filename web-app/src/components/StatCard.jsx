import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

export default function StatCard({ title, value, trend, trendValue, icon: Icon, color }) {
    const theme = useTheme();

    // Define icon colors based on title for visual distinction
    const getIconColor = () => {
        if (color) return color;
        switch (title) {
            case 'Total Students': return '#6366f1';  // Indigo
            case 'Avg. GPA': return '#10b981';        // Green
            case 'Avg. AI Usage (Hrs)': return '#8b5cf6';  // Purple
            case 'Study Hours/Week': return '#f59e0b';     // Amber
            case 'Most Popular Tool': return '#ec4899';    // Pink
            default: return theme.palette.primary.main;
        }
    };

    const iconColor = getIconColor();

    return (
        <MotionPaper
            sx={{
                p: 3,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{
                y: -6,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                transition: { duration: 0.2 }
            }}
        >
            {/* Background Icon */}
            <MotionBox
                sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, transform: 'rotate(15deg)' }}
                animate={{
                    rotate: [15, 20, 15],
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                {Icon && <Icon size={120} color={iconColor} />}
            </MotionBox>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {Icon && (
                    <MotionBox
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${iconColor}20`,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        whileHover={{
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                        }}
                    >
                        <Icon size={22} color={iconColor} />
                    </MotionBox>
                )}
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {title}
                </Typography>
            </Box>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                    {value}
                </Typography>
            </motion.div>

            {trend && (
                <MotionBox
                    sx={{ display: 'flex', alignItems: 'center' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    {trend === 'up' ? (
                        <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <TrendingUp size={16} color={theme.palette.success.main} />
                        </motion.div>
                    ) : (
                        <motion.div
                            animate={{ y: [0, 2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <TrendingDown size={16} color={theme.palette.error.main} />
                        </motion.div>
                    )}
                    <Typography
                        variant="body2"
                        color={trend === 'up' ? 'success.main' : 'error.main'}
                        sx={{ ml: 0.5, fontWeight: 600 }}
                    >
                        {trendValue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        vs last month
                    </Typography>
                </MotionBox>
            )}
        </MotionPaper>
    );
}
