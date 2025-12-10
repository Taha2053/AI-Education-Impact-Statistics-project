import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * TrendIndicator - Shows trend direction and percentage change
 * @param {number} value - The trend value (e.g., 12 for +12%)
 * @param {string} label - Optional label (e.g., "vs last period")
 * @param {boolean} showPercentage - Whether to show % symbol (default: true)
 * @param {boolean} inverse - Whether lower is better (default: false)
 */
export default function TrendIndicator({
    value,
    label,
    showPercentage = true,
    inverse = false
}) {
    if (value === 0 || value === null || value === undefined) {
        return (
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Minus size={14} color="#6b7280" />
                <Typography variant="caption" color="text.secondary">
                    No change
                </Typography>
            </Stack>
        );
    }

    const isPositive = inverse ? value < 0 : value > 0;
    const color = isPositive ? '#10b981' : '#ef4444';
    const Icon = value > 0 ? ArrowUp : ArrowDown;
    const displayValue = Math.abs(value);

    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Icon size={14} color={color} />
            <Typography
                variant="caption"
                sx={{
                    color,
                    fontWeight: 600,
                }}
            >
                {displayValue}{showPercentage ? '%' : ''}
                {label && ` ${label}`}
            </Typography>
        </Stack>
    );
}
