import React, { useState, useMemo } from 'react';
import { Typography, Box, Grid, Paper, useTheme, MenuItem, Select, FormControl, InputLabel, Chip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

export default function AIInsights() {
    const { data, loading } = useData();
    const theme = useTheme();
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedTool, setSelectedTool] = useState('all');

    if (loading || !data) return <Typography>Loading...</Typography>;

    // Get unique countries and tools
    const uniqueCountries = useMemo(() => {
        const countries = new Set(data.students.map(s => s.country));
        return Array.from(countries).sort();
    }, [data]);

    const uniqueTools = useMemo(() => {
        const tools = new Set(data.students.map(s => s.ai_tool));
        return Array.from(tools).sort();
    }, [data]);

    // Filter students based on selected filters
    const filteredStudents = useMemo(() => {
        return data.students.filter(s => {
            const countryMatch = selectedCountry === 'all' || s.country === selectedCountry;
            const toolMatch = selectedTool === 'all' || s.ai_tool === selectedTool;
            return countryMatch && toolMatch;
        });
    }, [data.students, selectedCountry, selectedTool]);

    // Clear filters function
    const clearFilters = () => {
        setSelectedCountry('all');
        setSelectedTool('all');
    };

    const hasActiveFilters = selectedCountry !== 'all' || selectedTool !== 'all';

    // AI Tool Popularity
    const tools = {};
    filteredStudents.forEach(s => {
        tools[s.ai_tool] = (tools[s.ai_tool] || 0) + 1;
    });

    // Sort tools
    const sortedTools = Object.entries(tools).sort((a, b) => b[1] - a[1]);

    // GPA Distribution by AI Tool
    const gpaByTool = {};
    filteredStudents.forEach(s => {
        if (!gpaByTool[s.ai_tool]) {
            gpaByTool[s.ai_tool] = [];
        }
        gpaByTool[s.ai_tool].push(s.gpa);
    });

    // Prepare scatter plot data showing correlation between GPA and AI tools
    const toolNames = Object.keys(gpaByTool);
    const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main
    ];
    const scatterPlotData = toolNames.map((tool, index) => {
        const gpaValues = gpaByTool[tool];
        return {
            x: Array(gpaValues.length).fill(tool),
            y: gpaValues,
            type: 'scatter',
            mode: 'markers',
            name: tool,
            marker: {
                color: colors[index % colors.length],
                size: 8,
                opacity: 0.7,
                line: {
                    width: 1,
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        };
    });

    // AI Usage Hours by Tool
    const usageByTool = {};
    filteredStudents.forEach(s => {
        if (!usageByTool[s.ai_tool]) {
            usageByTool[s.ai_tool] = [];
        }
        usageByTool[s.ai_tool].push(s.ai_usage_hours);
    });

    // Calculate average usage hours per tool
    const avgUsageByTool = Object.entries(usageByTool).map(([tool, hours]) => {
        const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
        return { tool, avgHours: parseFloat(avg.toFixed(2)), hours };
    });

    // Sort by average hours
    avgUsageByTool.sort((a, b) => b.avgHours - a.avgHours);

    // Page animation variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    // Card animation variants
    const cardVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.4 }}
        >
            <Box>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 70, textAlign: 'center' }}>
                    Overview of how students use different AI tools to help
                </Typography>

                {/* Filters Section */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
                    }}
                >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Country</InputLabel>
                            <Select
                                value={selectedCountry}
                                label="Country"
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                sx={{ transition: 'all 0.3s ease' }}
                            >
                                <MenuItem value="all">All Countries</MenuItem>
                                {uniqueCountries.map(country => (
                                    <MenuItem key={country} value={country}>{country}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>AI Tool</InputLabel>
                            <Select
                                value={selectedTool}
                                label="AI Tool"
                                onChange={(e) => setSelectedTool(e.target.value)}
                                sx={{ transition: 'all 0.3s ease' }}
                            >
                                <MenuItem value="all">All Tools</MenuItem>
                                {uniqueTools.map(tool => (
                                    <MenuItem key={tool} value={tool}>{tool}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {hasActiveFilters && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    onClick={clearFilters}
                                    startIcon={<X size={16} />}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </motion.div>
                        )}

                        {/* Active Filter Chips */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
                            {selectedCountry !== 'all' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Chip
                                        label={`Country: ${selectedCountry}`}
                                        onDelete={() => setSelectedCountry('all')}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </motion.div>
                            )}
                            {selectedTool !== 'all' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Chip
                                        label={`Tool: ${selectedTool}`}
                                        onDelete={() => setSelectedTool('all')}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </motion.div>
                            )}
                        </Box>
                    </Box>

                    {/* Results Count */}
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        Showing {filteredStudents.length} of {data.students.length} students
                    </Typography>
                </Paper>

                {/* Charts Grid */}
                <AnimatePresence mode="wait">
                    <Grid container spacing={3} key={`${selectedCountry}-${selectedTool}`} justifyContent="center">
                        <Grid item xs={12} md={10} lg={5}>
                            <motion.div
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <Paper sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '100%',
                                    mx: 'auto',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                                        Most Popular AI Tools
                                    </Typography>
                                    <Box sx={{ flex: 1, minHeight: '400px' }}>
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
                                                xaxis: {
                                                    title: {
                                                        text: 'AI Tool',
                                                        standoff: 15
                                                    }
                                                },
                                                yaxis: { title: { text: 'Number of Users' } },
                                                margin: { t: 10, r: 20, l: 60, b: 80 },
                                                transition: {
                                                    duration: 500,
                                                    easing: 'cubic-in-out'
                                                }
                                            }}
                                            useResizeHandler
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false }}
                                        />
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={10} lg={5}>
                            <motion.div
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <Paper sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '100%',
                                    mx: 'auto',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                                        AI Usage Hours by Tool
                                    </Typography>
                                    <Box sx={{ flex: 1, minHeight: '400px' }}>
                                        <Plot
                                            data={[{
                                                x: avgUsageByTool.map(t => t.tool),
                                                y: avgUsageByTool.map(t => t.avgHours),
                                                type: 'bar',
                                                marker: {
                                                    color: theme.palette.secondary.main
                                                },
                                                text: avgUsageByTool.map(t => `${t.avgHours} hrs`),
                                                textposition: 'outside'
                                            }]}
                                            layout={{
                                                autosize: true,
                                                paper_bgcolor: 'transparent',
                                                plot_bgcolor: 'transparent',
                                                font: { color: theme.palette.text.secondary },
                                                xaxis: {
                                                    title: {
                                                        text: 'AI Tool',
                                                        standoff: 15
                                                    }
                                                },
                                                yaxis: { title: { text: 'Average Usage Hours per Week' } },
                                                margin: { t: 10, r: 20, l: 60, b: 80 },
                                                transition: {
                                                    duration: 500,
                                                    easing: 'cubic-in-out'
                                                }
                                            }}
                                            useResizeHandler
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false }}
                                        />
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={10} lg={10}>
                            <motion.div
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                <Paper sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '100%',
                                    mx: 'auto',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
                                        Correlation Between GPA and AI Tools
                                    </Typography>
                                    <Box sx={{ minHeight: '450px' }}>
                                        <Plot
                                            data={scatterPlotData}
                                            layout={{
                                                autosize: true,
                                                paper_bgcolor: 'transparent',
                                                plot_bgcolor: 'transparent',
                                                font: { color: theme.palette.text.secondary },
                                                xaxis: {
                                                    title: { text: 'AI Tool' },
                                                    type: 'category'
                                                },
                                                yaxis: {
                                                    title: { text: 'GPA' },
                                                    range: [0, 4]
                                                },
                                                showlegend: false,

                                                margin: { t: 10, r: 20, l: 60, b: 80 },
                                                transition: {
                                                    duration: 500,
                                                    easing: 'cubic-in-out'
                                                }
                                            }}
                                            useResizeHandler
                                            style={{ width: '100%', height: '100%' }}
                                            config={{ displayModeBar: false }}
                                        />
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                </AnimatePresence>

                {/* Interpretations Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <Paper sx={{
                        p: 4,
                        mt: 3,
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
                    }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                            Insights & Interpretations
                        </Typography>
                        <Box sx={{
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2
                        }}>
                            <Typography variant="body1" sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                Interpretations will be integrated here
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                opacity: 0.7
                            }}>
                                This section will contain detailed analysis and insights based on the filtered data
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Box>
        </motion.div>
    );
}
