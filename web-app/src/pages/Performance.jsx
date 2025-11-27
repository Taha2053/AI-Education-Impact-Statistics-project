import React from 'react';
import { Typography, Box, Paper, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';

export default function Performance() {
    const { data, loading } = useData();
    const theme = useTheme();

    if (loading || !data) return <Typography>Loading...</Typography>;

    // Prepare scatter data
    // Group by country for coloring
    const traces = data.country_summary.map(country => {
        const countryStudents = data.students.filter(s => s.country === country.country);
        return {
            x: countryStudents.map(s => s.ai_usage_hours),
            y: countryStudents.map(s => s.gpa),
            mode: 'markers',
            type: 'scatter',
            name: country.country,
            text: countryStudents.map(s => `Major: ${s.major}<br>Study: ${s.study_hours_per_week}h`),
            marker: { size: 8, opacity: 0.7 }
        };
    });

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Performance Analysis</Typography>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '600px' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>GPA vs AI Usage Correlation</Typography>
                <Plot
                    data={traces}
                    layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: theme.palette.text.secondary },
                        xaxis: {
                            title: 'AI Usage (Hours/Week)',
                            gridcolor: 'rgba(255,255,255,0.1)',
                            zerolinecolor: 'rgba(255,255,255,0.1)'
                        },
                        yaxis: {
                            title: 'GPA',
                            gridcolor: 'rgba(255,255,255,0.1)',
                            zerolinecolor: 'rgba(255,255,255,0.1)',
                            range: [0, 4.2]
                        },
                        hovermode: 'closest',
                        legend: { orientation: 'h', y: 1.05 }
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: true }}
                />
            </Paper>
        </Box>
    );
}
