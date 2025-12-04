import React from 'react';
import { Box, Paper, Typography, Stack, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';
import { MoreVertical, Maximize2, Download, Info } from 'lucide-react';

/**
 * ChartCard - Wrapper component for charts with consistent styling
 * @param {string} title - Chart title
 * @param {React.Node} children - Chart content (usually a Plot component)
 * @param {string} insight - Optional bottom insight text
 * @param {string} interactionHint - Optional hint text (e.g., "Click to filter")
 * @param {boolean} loading - Whether to show loading skeleton
 * @param {number} height - Chart height in pixels (default: 350)
 * @param {function} onExport - Optional export handler
 * @param {function} onInfo - Optional info handler
 */
export default function ChartCard({
    title,
    children,
    insight,
    interactionHint,
    loading = false,
    height = 350,
    onExport,
    onInfo
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExport = () => {
        if (onExport) onExport();
        handleMenuClose();
    };

    const handleInfo = () => {
        if (onInfo) onInfo();
        handleMenuClose();
    };

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Typography variant="h6" fontWeight={600}>
                    {title}
                </Typography>

                {(onExport || onInfo) && (
                    <>
                        <IconButton
                            size="small"
                            onClick={handleMenuClick}
                            aria-label="chart options"
                        >
                            <MoreVertical size={18} />
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                        >
                            {onInfo && (
                                <MenuItem onClick={handleInfo}>
                                    <ListItemIcon><Info size={18} /></ListItemIcon>
                                    <ListItemText>About this chart</ListItemText>
                                </MenuItem>
                            )}
                            {onExport && (
                                <MenuItem onClick={handleExport}>
                                    <ListItemIcon><Download size={18} /></ListItemIcon>
                                    <ListItemText>Export data</ListItemText>
                                </MenuItem>
                            )}
                        </Menu>
                    </>
                )}
            </Stack>

            {/* Chart Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    minHeight: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {loading ? (
                    <Skeleton
                        variant="rounded"
                        width="100%"
                        height={height}
                        animation="wave"
                    />
                ) : (
                    children
                )}
            </Box>

            {/* Bottom Insight/Hint */}
            {(insight || interactionHint) && (
                <Box
                    sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {insight && (
                        <Stack direction="row" spacing={1} alignItems="start" sx={{ mb: 1 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                            >
                                📌 {insight}
                            </Typography>
                        </Stack>
                    )}
                    {interactionHint && (
                        <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontStyle: 'italic' }}
                        >
                            👆 {interactionHint}
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
}
