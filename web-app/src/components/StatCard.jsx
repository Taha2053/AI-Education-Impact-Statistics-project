import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, trend, trendValue, icon: Icon, color }) {
    const theme = useTheme();

    return (
        <Paper sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, transform: 'rotate(15deg)' }}>
                {Icon && <Icon size={120} color={color || theme.palette.primary.main} />}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {Icon && (
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: color ? `${color}20` : 'primary.main',
                        color: color || 'primary.main',
                        mr: 2,
                        display: 'flex'
                    }}>
                        <Icon size={24} />
                    </Box>
                )}
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {title}
                </Typography>
            </Box>

            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {value}
            </Typography>

            {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {trend === 'up' ? (
                        <TrendingUp size={16} color={theme.palette.success.main} />
                    ) : (
                        <TrendingDown size={16} color={theme.palette.error.main} />
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
                </Box>
            )}
        </Paper>
    );
}
