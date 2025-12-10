import React from 'react';
import { Box, Paper, Typography, Stack, Alert } from '@mui/material';
import { AlertCircle, TrendingUp, Info } from 'lucide-react';

/**
 * InsightBadge - Displays an insight or alert with icon, title, and description
 * @param {string} type - Badge type: 'warning' | 'info' | 'success'
 * @param {string} title - Badge title
 * @param {string} description - Badge description text
 * @param {function} onAction - Optional click handler for CTA
 * @param {string} actionLabel - Optional CTA button label
 */
export default function InsightBadge({
    type = 'info',
    title,
    description,
    onAction,
    actionLabel = 'Learn More'
}) {
    const config = {
        warning: {
            icon: <AlertCircle size={20} />,
            severity: 'warning',
            color: '#f59e0b',
        },
        info: {
            icon: <Info size={20} />,
            severity: 'info',
            color: '#3b82f6',
        },
        success: {
            icon: <TrendingUp size={20} />,
            severity: 'success',
            color: '#10b981',
        },
    };

    const { icon, severity, color } = config[type] || config.info;

    return (
        <Alert
            severity={severity}
            icon={icon}
            sx={{
                borderRadius: 2,
                '& .MuiAlert-message': {
                    width: '100%',
                },
            }}
        >
            <Stack spacing={1}>
                {title && (
                    <Typography variant="subtitle2" fontWeight={600}>
                        {title}
                    </Typography>
                )}
                {description && (
                    <Typography variant="body2">
                        {description}
                    </Typography>
                )}
                {onAction && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: color,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            '&:hover': {
                                opacity: 0.8,
                            },
                        }}
                        onClick={onAction}
                    >
                        {actionLabel} →
                    </Typography>
                )}
            </Stack>
        </Alert>
    );
}
