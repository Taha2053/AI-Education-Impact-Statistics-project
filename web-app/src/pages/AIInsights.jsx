import React from 'react';
import { Typography, Box, Grid, Paper, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';

export default function AIInsights() {
    const { data, loading } = useData();
    const theme = useTheme();

    if (loading || !data) return <Typography>Loading...</Typography>;

    // AI Tool Popularity
    const tools = {};
    data.students.forEach(s => {
        tools[s.ai_tool] = (tools[s.ai_tool] || 0) + 1;
    });

    // Sort tools
    const sortedTools = Object.entries(tools).sort((a, b) => b[1] - a[1]);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>AI Insights</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Most Popular AI Tools</Typography>
                        <Plot
                            data={[{
                                x: sortedTools.map(t => t[0]),
                                y: sortedTools.map(t => t[1]),
                                type: 'bar',
                                marker: {
                                    color: sortedTools.map((_, i) =>
                                        i === 0 ? theme.palette.primary.main : theme.palette.primary.dark
                                    )
                                }
                            }]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                xaxis: { title: 'AI Tool' },
                                yaxis: { title: 'Number of Users' }
                            }}
                            useResizeHandler
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
