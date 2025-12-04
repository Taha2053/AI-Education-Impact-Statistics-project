import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box, Tooltip } from '@mui/material';
import { LayoutDashboard, Table, BookOpen } from 'lucide-react';

/**
 * ViewModeSwitcher - Toggle between dashboard view modes
 * @param {string} value - Current view mode ('executive' | 'analyst' | 'story')
 * @param {function} onChange - Callback when view mode changes
 */
export default function ViewModeSwitcher({ value, onChange }) {
    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            onChange(newValue);
        }
    };

    return (
        <Box>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                aria-label="dashboard view mode"
                size="small"
                sx={{
                    backgroundColor: 'background.paper',
                    '& .MuiToggleButton-root': {
                        px: 2,
                        py: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                <Tooltip title="Quick summary for executives" placement="bottom">
                    <ToggleButton value="executive" aria-label="executive view">
                        <LayoutDashboard size={18} style={{ marginRight: 8 }} />
                        Executive
                    </ToggleButton>
                </Tooltip>

                <Tooltip title="Data-dense view for analysts" placement="bottom">
                    <ToggleButton value="analyst" aria-label="analyst view">
                        <Table size={18} style={{ marginRight: 8 }} />
                        Analyst
                    </ToggleButton>
                </Tooltip>

                <Tooltip title="Story-driven narrative view" placement="bottom">
                    <ToggleButton value="story" aria-label="story view">
                        <BookOpen size={18} style={{ marginRight: 8 }} />
                        Story
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
        </Box>
    );
}
