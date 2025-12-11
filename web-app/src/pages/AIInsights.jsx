import React, { useState, useMemo } from 'react';
import { Typography, Box, Grid, Paper, useTheme, MenuItem, Select, FormControl, InputLabel, Chip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import { X, TrendingUp } from 'lucide-react';
import { extractAIToolsUnique } from '../utils/dataUtils';

// Tool normalization map
const TOOL_ALIASES = {
    'chatgpt': 'ChatGPT', 'chat gpt': 'ChatGPT', 'chat-gpt': 'ChatGPT', 'chat_gpt': 'ChatGPT',
    'claude': 'Claude', 'claude ai': 'Claude', 'anthropic claude': 'Claude',
    'gemini': 'Gemini', 'bard': 'Gemini', 'google bard': 'Gemini',
    'copilot': 'Copilot', 'co-pilot': 'Copilot', 'co pilot': 'Copilot', 'bing chat': 'Copilot', 'bingchat': 'Copilot',
    'perplexity': 'Perplexity', 'perplexity ai': 'Perplexity',
    "google's ai studio models": 'Google AI Studio', 'googlesaistudiomodels': 'Google AI Studio',
    'grok': 'Grok', 'grok beta': 'Grok',
    'black box': 'Black Box', 'blackbox': 'Black Box',
};

const normalizeTool = (tool) => {
    if (!tool || tool === 'None') return null;
    const cleaned = String(tool).trim();
    if (!cleaned) return null;
    const lower = cleaned.toLowerCase();
    if (TOOL_ALIASES[lower]) return TOOL_ALIASES[lower];
    const sortedEntries = Object.entries(TOOL_ALIASES).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sortedEntries) {
        if (lower.includes(key)) return value;
    }
    if (cleaned === cleaned.toLowerCase() || cleaned === cleaned.toUpperCase()) {
        return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return cleaned;
};

// Helper: Aggregate data by tool
const aggregateByTool = (students, selectedTool, getValue, filterValue = () => true) => {
    const result = {};
    students.forEach(s => {
        if (!s.ai_tools || !Array.isArray(s.ai_tools) || s.ai_tools.length === 0) return;
        s.ai_tools.forEach(tool => {
            const normalized = normalizeTool(tool);
            if (normalized && (selectedTool === 'all' || normalized === selectedTool) && filterValue(s)) {
                if (!result[normalized]) result[normalized] = [];
                result[normalized].push(getValue(s));
            }
        });
    });
    return result;
};

// Helper: Calculate average
const calculateAverage = (values) => {
    const valid = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    return valid.length > 0 ? valid.reduce((sum, v) => sum + v, 0) / valid.length : 0;
};

// Chart component
const ChartCard = ({ title, children, delay = 0.1 }) => {
    const theme = useTheme();
    const cardVariants = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };
    return (
        <motion.div variants={cardVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3, delay }}>
            <Paper sx={{
                p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)',
                height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%', mx: 'auto',
                transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>{title}</Typography>
                {children}
            </Paper>
        </motion.div>
    );
};

// Empty state component
const EmptyState = ({ message }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{message}</Typography>
    </Box>
);

export default function AIInsights() {
    const { data, loading } = useData();
    const theme = useTheme();
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedTool, setSelectedTool] = useState('all');
    const [selectedMajor, setSelectedMajor] = useState('all');

    if (loading || !data) return <Typography>Loading...</Typography>;

    // Get unique values
    const uniqueCountries = useMemo(() => {
        if (!data?.students) return [];
        return Array.from(new Set(data.students.map(s => s.country).filter(Boolean))).sort();
    }, [data]);

    const uniqueTools = useMemo(() => {
        if (!data?.students) return [];
        const toolsSet = new Set();
        data.students.forEach(s => {
            if (s.ai_tools && Array.isArray(s.ai_tools)) {
                s.ai_tools.forEach(tool => {
                    const normalized = normalizeTool(tool);
                    if (normalized) toolsSet.add(normalized);
                });
            }
        });
        return Array.from(toolsSet).sort();
    }, [data]);

    const uniqueMajors = useMemo(() => {
        if (!data?.students) return [];
        return Array.from(new Set(data.students.map(s => s.major).filter(Boolean))).sort();
    }, [data]);

    // Filter students
    const filteredStudents = useMemo(() => {
        if (!data?.students) return [];
        return data.students.filter(s => {
            const countryMatch = selectedCountry === 'all' || s.country === selectedCountry;
            const majorMatch = selectedMajor === 'all' || s.major === selectedMajor;
            let toolMatch = true;
            if (selectedTool !== 'all') {
                if (!s.ai_tools || !Array.isArray(s.ai_tools) || s.ai_tools.length === 0) {
                    toolMatch = false;
                } else {
                    toolMatch = s.ai_tools.some(tool => normalizeTool(tool) === selectedTool);
                }
            }
            return countryMatch && toolMatch && majorMatch;
        });
    }, [data?.students, selectedCountry, selectedTool, selectedMajor]);

    // Aggregate data
    const tools = useMemo(() => {
        const result = {};
        filteredStudents.forEach(s => {
            if (!s.ai_tools || !Array.isArray(s.ai_tools) || s.ai_tools.length === 0) return;
            s.ai_tools.forEach(tool => {
                const normalized = normalizeTool(tool);
                if (normalized && (selectedTool === 'all' || normalized === selectedTool)) {
                    result[normalized] = (result[normalized] || 0) + 1;
                }
            });
        });
        return Object.entries(result).sort((a, b) => b[1] - a[1]);
    }, [filteredStudents, selectedTool]);

    const gpaByTool = useMemo(() => 
        aggregateByTool(filteredStudents, selectedTool, s => s.gpa, s => s.gpa !== null && s.gpa !== undefined),
        [filteredStudents, selectedTool]
    );

    const usageByTool = useMemo(() => 
        aggregateByTool(filteredStudents, selectedTool, s => s.ai_usage_hours, s => s.ai_usage_hours !== null && s.ai_usage_hours !== undefined),
        [filteredStudents, selectedTool]
    );

    const avgUsageByTool = useMemo(() => {
        return Object.entries(usageByTool)
            .map(([tool, hours]) => ({ tool, avgHours: parseFloat(calculateAverage(hours).toFixed(2)) }))
            .filter(item => item.avgHours > 0)
            .sort((a, b) => b.avgHours - a.avgHours);
    }, [usageByTool]);

    // Scatter plot data
    const scatterPlotData = useMemo(() => {
        const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, 
                       theme.palette.warning.main, theme.palette.error.main, theme.palette.info.main];
        return Object.entries(gpaByTool).map(([tool, gpas], index) => {
            const validGPAs = gpas.filter(g => g !== null && g !== undefined && !isNaN(g));
            if (validGPAs.length === 0) return null;
            return {
                x: Array(validGPAs.length).fill(tool),
                y: validGPAs,
                type: 'scatter',
                mode: 'markers',
                name: tool,
                marker: { color: colors[index % colors.length], size: 8, opacity: 0.7, line: { width: 1, color: 'rgba(255, 255, 255, 0.2)' } }
            };
        }).filter(Boolean);
    }, [gpaByTool, theme]);

    // Insights
    const insights = useMemo(() => {
        const insightsList = [];
        if (tools.length === 0) return [{ title: 'Info', text: 'No AI tool data available for the selected filters.' }];

        if (tools.length > 0) {
            const [tool, count] = tools[0];
            const total = tools.reduce((sum, [, c]) => sum + c, 0);
            insightsList.push({
                title: 'Most Popular AI Tool',
                text: `${tool} is the most widely used AI tool among the filtered students, with ${count} users (${((count / total) * 100).toFixed(1)}% of total).`
            });
        }

        const toolGPAs = Object.entries(gpaByTool)
            .map(([tool, gpas]) => {
                const avg = calculateAverage(gpas);
                return avg > 0 ? { tool, avgGPA: avg, count: gpas.length } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.avgGPA - a.avgGPA);

        if (toolGPAs.length > 0) {
            const { tool, avgGPA, count } = toolGPAs[0];
            insightsList.push({
                title: 'Highest Average GPA',
                text: `Students using ${tool} have the highest average GPA of ${avgGPA.toFixed(2)} (based on ${count} students).`
            });
        }

        if (avgUsageByTool.length > 0) {
            const { tool, avgHours } = avgUsageByTool[0];
            insightsList.push({
                title: 'Highest Usage Hours',
                text: `${tool} users spend the most time with AI tools, averaging ${avgHours} hours per week.`
            });
        }

        const multiToolCount = filteredStudents.filter(s => s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.length > 1).length;
        if (multiToolCount > 0) {
            const percentage = ((multiToolCount / filteredStudents.length) * 100).toFixed(1);
            insightsList.push({
                title: 'Multi-Tool Usage',
                text: `${multiToolCount} students (${percentage}%) use multiple AI tools, indicating diverse tool adoption strategies.`
            });
        }

        if (toolGPAs.length > 1) {
            const gpaRange = toolGPAs.map(t => t.avgGPA);
            const spread = (Math.max(...gpaRange) - Math.min(...gpaRange)).toFixed(2);
            insightsList.push({
                title: parseFloat(spread) > 0.1 ? 'GPA Variation Across Tools' : 'Consistent Academic Performance',
                text: parseFloat(spread) > 0.1
                    ? `There is a ${spread} point difference in average GPA between different AI tools, suggesting varying effectiveness or user demographics.`
                    : `Students using different AI tools show similar average GPAs, indicating that tool choice may not significantly impact academic performance.`
            });
        }

        if (avgUsageByTool.length > 1) {
            const usageRange = avgUsageByTool.map(t => t.avgHours);
            const spread = (Math.max(...usageRange) - Math.min(...usageRange)).toFixed(1);
            if (parseFloat(spread) > 5) {
                insightsList.push({
                    title: 'Varied Usage Patterns',
                    text: `Usage hours vary significantly across tools (${Math.min(...usageRange).toFixed(1)} to ${Math.max(...usageRange).toFixed(1)} hours/week), reflecting different use cases and integration levels.`
                });
            }
        }

        if (selectedTool !== 'all') {
            const toolData = tools.find(t => t[0] === selectedTool);
            if (toolData) {
                const usage = avgUsageByTool.find(t => t.tool === selectedTool);
                insightsList.push({
                    title: 'Selected Tool Analysis',
                    text: `Focusing on ${selectedTool}: ${toolData[1]} students use this tool.${usage ? ` Average usage: ${usage.avgHours} hours/week.` : ''}`
                });
            }
        }

        if (selectedCountry !== 'all') {
            insightsList.push({
                title: 'Geographic Context',
                text: `Analysis focused on students from ${selectedCountry}, providing region-specific insights into AI tool adoption patterns.`
            });
        }

        return insightsList;
    }, [tools, gpaByTool, avgUsageByTool, filteredStudents, selectedTool, selectedCountry]);

    const clearFilters = () => {
        setSelectedCountry('all');
        setSelectedTool('all');
        setSelectedMajor('all');
    };

    const hasActiveFilters = selectedCountry !== 'all' || selectedTool !== 'all' || selectedMajor !== 'all';
    const commonLayout = { autosize: true, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: theme.palette.text.secondary } };
    const commonXAxis = { title: { text: 'AI Tool', standoff: 15 }, tickangle: -45 };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Typography variant="h3" sx={{
                    mb: 4, fontWeight: 800, textAlign: 'center', maxWidth: 700, mx: 'auto',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Overview of how students use different AI tools
                </Typography>

                {/* Filters */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        {[
                            { value: selectedCountry, onChange: setSelectedCountry, label: 'Country', options: uniqueCountries },
                            { value: selectedMajor, onChange: setSelectedMajor, label: 'Major', options: uniqueMajors },
                            { value: selectedTool, onChange: setSelectedTool, label: 'AI Tool', options: uniqueTools }
                        ].map(({ value, onChange, label, options }) => (
                            <FormControl key={label} sx={{ minWidth: 200 }}>
                                <InputLabel>{label}</InputLabel>
                                <Select value={value} label={label} onChange={(e) => onChange(e.target.value)} sx={{ transition: 'all 0.3s ease' }}>
                                    <MenuItem value="all">All {label}s</MenuItem>
                                    {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                </Select>
                            </FormControl>
                        ))}

                        {hasActiveFilters && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                                <Button onClick={clearFilters} startIcon={<X size={16} />} variant="outlined" size="small"
                                    sx={{ textTransform: 'none', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 } }}>
                                    Clear Filters
                                </Button>
                            </motion.div>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
                            {[
                                { value: selectedCountry, setter: setSelectedCountry, label: 'Country', color: 'primary' },
                                { value: selectedMajor, setter: setSelectedMajor, label: 'Major', color: 'success' },
                                { value: selectedTool, setter: setSelectedTool, label: 'Tool', color: undefined }
                            ].map(({ value, setter, label, color }) => value !== 'all' && (
                                <motion.div key={label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                                    <Chip label={`${label}: ${value}`} onDelete={() => setter('all')} color={color} variant="outlined"
                                        sx={!color ? { color: '#ffffff', borderColor: '#ffffff', '& .MuiChip-deleteIcon': { color: '#ffffff' }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } } : {}} />
                                </motion.div>
                            ))}
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        Showing {filteredStudents.length} of {data?.students?.length || 0} students
                    </Typography>
                </Box>

                {/* Charts */}
                <AnimatePresence mode="wait">
                    <Grid container spacing={3} key={`${selectedCountry}-${selectedTool}-${selectedMajor}`} justifyContent="center">
                        <Grid item xs={12} md={10} lg={5}>
                            <ChartCard title="Most Popular AI Tools" delay={0.1}>
                                <Box sx={{ flex: 1, minHeight: '400px' }}>
                                    {tools.length > 0 ? (
                                        <Plot data={[{
                                            x: tools.map(t => t[0]),
                                            y: tools.map(t => t[1]),
                                            type: 'bar',
                                            marker: { color: tools.map((_, i) => i === 0 ? theme.palette.primary.main : theme.palette.primary.dark) }
                                        }]} layout={{ ...commonLayout, xaxis: commonXAxis, yaxis: { title: { text: 'Number of Users' } },
                                            margin: { t: 10, r: 20, l: 60, b: 100 }, transition: { duration: 500, easing: 'cubic-in-out' } }}
                                            useResizeHandler style={{ width: '100%', height: '100%' }} config={{ displayModeBar: false }} />
                                    ) : <EmptyState message="No AI tools data available for the selected filters" />}
                                </Box>
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={10} lg={5}>
                            <ChartCard title="AI Usage Hours by Tool" delay={0.2}>
                                <Box sx={{ flex: 1, minHeight: '400px' }}>
                                    {avgUsageByTool.length > 0 ? (
                                        <Plot data={[{
                                            x: avgUsageByTool.map(t => t.tool),
                                            y: avgUsageByTool.map(t => t.avgHours),
                                            type: 'bar',
                                            marker: { color: '#ffffff' },
                                            text: avgUsageByTool.map(t => `${t.avgHours} hrs`),
                                            textposition: 'outside'
                                        }]} layout={{ ...commonLayout, xaxis: commonXAxis, yaxis: { title: { text: 'Average Usage Hours per Week' } },
                                            margin: { t: 10, r: 20, l: 60, b: 100 }, transition: { duration: 500, easing: 'cubic-in-out' } }}
                                            useResizeHandler style={{ width: '100%', height: '100%' }} config={{ displayModeBar: false }} />
                                    ) : <EmptyState message="No usage hours data available for the selected filters" />}
                                </Box>
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={10} lg={10}>
                            <ChartCard title="Correlation Between GPA and AI Tools" delay={0.3}>
                                <Box sx={{ minHeight: '450px' }}>
                                    {scatterPlotData.length > 0 ? (
                                        <Plot data={scatterPlotData} layout={{ ...commonLayout, xaxis: { ...commonXAxis, type: 'category' },
                                            yaxis: { title: { text: 'GPA' }, range: [0, 4] }, showlegend: false,
                                            margin: { t: 10, r: 20, l: 60, b: 100 }, transition: { duration: 500, easing: 'cubic-in-out' } }}
                                            useResizeHandler style={{ width: '100%', height: '100%' }} config={{ displayModeBar: false }} />
                                    ) : <EmptyState message="No GPA data available for the selected filters" />}
                                </Box>
                            </ChartCard>
                        </Grid>
                    </Grid>
                </AnimatePresence>

                {/* Insights */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <Paper sx={{ p: 4, mt: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <TrendingUp size={28} color={theme.palette.primary.main} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>Key Insights & Interpretations</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {insights.length > 0 ? insights.map((insight, index) => (
                                <Box key={index} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    borderRadius: 2, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                        <Box component="span" sx={{ fontWeight: 600, color: theme.palette.primary.light }}>{insight.title}:</Box> {insight.text}
                                    </Typography>
                                </Box>
                            )) : (
                                <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic', py: 4, opacity: 0.7 }}>
                                    No insights available for the selected filters. Try adjusting your filters to see insights.
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </motion.div>
            </Box>
        </motion.div>
    );
}