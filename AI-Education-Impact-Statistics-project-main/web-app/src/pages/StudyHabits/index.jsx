import React from 'react';
import { Typography, Box, Grid, Paper, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';

export default function StudyHabits() {
    const { data, loading } = useData();
    const theme = useTheme();

    if (loading || !data) return <Typography>Loading...</Typography>;

    // Majors distribution
    const majors = {};
    data.students.forEach(s => {
        majors[s.major] = (majors[s.major] || 0) + 1;
    });

    // Study hours histogram
    const studyHours = data.students.map(s => s.study_hours_per_week);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Study Habits</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Major Distribution</Typography>
                        <Plot
                            data={[{
                                values: Object.values(majors),
                                labels: Object.keys(majors),
                                type: 'pie',
                                hole: 0.4,
                                marker: {
                                    colors: [
                                        theme.palette.primary.main,
                                        theme.palette.secondary.main,
                                        '#10b981',
                                        '#f59e0b',
                                        '#8b5cf6'
                                    ]
                                }
                            }]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                showlegend: true,
                                legend: { orientation: 'h', y: -0.1 }
                            }}
                            useResizeHandler
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Study Hours Distribution</Typography>
                        <Plot
                            data={[{
                                x: studyHours,
                                type: 'histogram',
                                marker: { color: theme.palette.primary.light },
                                opacity: 0.7
                            }]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                xaxis: { title: 'Hours per Week' },
                                yaxis: { title: 'Count' },
                                bargap: 0.05
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
