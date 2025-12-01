import React, { useState } from 'react';
import { Typography, Box, Paper, Grid, useTheme, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';


export default function GlobalAnalysis() {
    const { data, loading } = useData();
    const theme = useTheme();
    const [metric, setMetric] = useState('avg_gpa');

    if (loading || !data) return <Typography>Loading...</Typography>;

    const countryNames = data.country_summary.map(c => c.country);
    const metricValues = data.country_summary.map(c => c[metric]);

    const metricLabels = {
        avg_gpa: 'Average GPA',
        avg_ai_usage: 'Avg AI Usage (Hours)',
        student_count: 'Student Count'
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Global Analysis</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                        value={metric}
                        label="Metric"
                        onChange={(e) => setMetric(e.target.value)}
                    >
                        <MenuItem value="avg_gpa">Average GPA</MenuItem>
                        <MenuItem value="avg_ai_usage">AI Usage</MenuItem>
                        <MenuItem value="student_count">Student Count</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '600px' }}>
                <Plot
                    data={[{
                        type: 'choropleth',
                        locationmode: 'country names',
                        locations: countryNames,
                        z: metricValues,
                        text: countryNames,
                        colorscale: metric === 'avg_gpa' ? 'Viridis' : 'Plasma',
                        autocolorscale: false,
                        reversescale: true,
                        marker: {
                            line: {
                                color: 'rgb(180,180,180)',
                                width: 0.5
                            }
                        },
                        colorbar: {
                            title: metricLabels[metric],
                            thickness: 20
                        }
                    }]}
                    layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        geo: {
                            showframe: false,
                            showcoastlines: true,
                            projection: {
                                type: 'mercator'
                            },
                            bgcolor: 'transparent',
                            lakecolor: theme.palette.background.paper,
                            landcolor: '#2d3748',
                            showland: true,
                            showcountries: true,
                            countrycolor: '#4a5568'
                        },
                        font: { color: theme.palette.text.secondary },
                        margin: { t: 0, r: 0, l: 0, b: 0 }
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                />
            </Paper>
        </Box>
    );
}
