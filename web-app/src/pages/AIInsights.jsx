import React, { useState, useMemo } from 'react';
import { Typography, Box, Grid, useTheme, MenuItem, Select, FormControl, InputLabel, Button, Alert, Chip, Stack } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { useData } from '../context/DataContext';
import { X, TrendingUp, Brain, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { normalizeTool, extractAIToolsUnique } from '../utils/dataUtils';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

// --- Helper function for Donut Chart Colors (Simplified to 3 Categories) ---
const getImpactColor = (label) => {
    if (label === 'Positive') return "#4caf50";    // Primary Green (Positive)
    if (label === 'Negative') return "#b71c1c";    // Primary Red (Negative)
    if (label === 'No Impact') return "#9e9e9e";   // Neutral Grey (No Impact)
    return "#90caf9"; // fallback 
};

// --- Custom Legend Data (Simplified to 3 Categories) ---
const SIMPLIFIED_SENTIMENT_LABELS = [
    { name: 'Positive', label: 'Positive Impact' },
    { name: 'Negative', label: 'Negative Impact' },
    { name: 'No Impact', label: 'No Impact' },
];

// --- Custom Legend Component for Simple Horizontal Layout (3 Categories) ---
const SimplifiedCustomSentimentLegend = ({ labels, getImpactColor, data }) => {
    // Filter labels to only include those present in the actual data
    const filteredLabels = labels.filter(item =>
        data.some(d => d.name === item.name)
    );

    return (
        <Stack
            direction="row"
            flexWrap="wrap"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 2, px: 2, maxWidth: '100%' }}
        >
            {filteredLabels.map((entry) => (
                <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            bgcolor: getImpactColor(entry.name),
                            mr: 1,
                            borderRadius: '2px',
                            flexShrink: 0
                        }}
                    />
                    <Typography variant="caption" sx={{ color: 'white', lineHeight: 1.2 }}>
                        {entry.label}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
};

export default function AIInsights() {
    const { data, loading } = useData();
    const theme = useTheme();
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedTool, setSelectedTool] = useState('all');
    const [selectedMajor, setSelectedMajor] = useState('all');

    if (loading || !data) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading Insights...</Typography></Box>;

    // --- Data Preparation ---
    const filteredStudents = useMemo(() => {
        if (!data?.students) return [];
        return data.students.filter(s => {
            const countryMatch = selectedCountry === 'all' || s.country === selectedCountry;
            const majorMatch = selectedMajor === 'all' || (s.major || s.field_of_study) === selectedMajor;

            let toolMatch = true;
            if (selectedTool !== 'all') {
                if (!s.ai_tools || !Array.isArray(s.ai_tools) || s.ai_tools.length === 0) {
                    toolMatch = false;
                } else {
                    toolMatch = s.ai_tools.some(tool => normalizeTool(tool) === selectedTool);
                }
            }
            return countryMatch && majorMatch && toolMatch;
        });
    }, [data, selectedCountry, selectedTool, selectedMajor]);

    const { countries, majors, toolsList } = useMemo(() => ({
        countries: Array.from(new Set(data.students?.map(s => s.country))).filter(Boolean).sort(),
        majors: Array.from(new Set(data.students?.map(s => s.major || s.field_of_study))).filter(Boolean).sort(),
        toolsList: extractAIToolsUnique(data.students)
    }), [data]);

    // Data for Recharts
    const toolUsageData = useMemo(() => {
        const counts = {};
        filteredStudents.forEach(s => {
            if (s.ai_tools && Array.isArray(s.ai_tools)) {
                s.ai_tools.forEach(t => {
                    const norm = normalizeTool(t);
                    if (norm) counts[norm] = (counts[norm] || 0) + 1;
                });
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [filteredStudents]);

    const concernData = useMemo(() => {
        const counts = {};
        filteredStudents.forEach(s => {
            if (s.concerns) counts[s.concerns] = (counts[s.concerns] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [filteredStudents]);

    // FIX: Aggregate impact data into Positive, Negative, and No Impact
    const impactData = useMemo(() => {
        const counts = { 'Positive': 0, 'No Impact': 0, 'Negative': 0 };

        filteredStudents.forEach(s => {
            // NOTE: Assuming the correct key for impact data is 'ai_impact' as used in prior context, 
            // but accommodating for 'ai_usage.impact_on_grades' if that was intended.
            // Using a fallback structure to handle both number/string data types for aggregation.
            const impactRawValue = s.ai_impact !== undefined && s.ai_impact !== null 
                ? s.ai_impact 
                : (s.ai_usage?.impact_on_grades !== undefined && s.ai_usage?.impact_on_grades !== null 
                    ? s.ai_usage.impact_on_grades 
                    : null
                );
            
            if (impactRawValue !== null) {
                let category;
                const value = typeof impactRawValue === 'string' ? impactRawValue.toLowerCase() : impactRawValue;

                if (typeof value === 'number') {
                    if (value > 0) category = 'Positive';
                    else if (value < 0) category = 'Negative';
                    else category = 'No Impact';
                } else if (typeof value === 'string') {
                    if (value.includes('positive') || Number(value) > 0) category = 'Positive';
                    else if (value.includes('negative') || Number(value) < 0) category = 'Negative';
                    else category = 'No Impact';
                }
                
                if (category) counts[category] += 1;
            }
        });

        // Convert counts to array format required by Recharts
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);
    }, [filteredStudents]);

    // Update keymetrics to use aggregated impact data
    const keymetrics = useMemo(() => {
        // Find the positive count directly from the new aggregated data structure
        const positiveImpactCount = impactData.find(item => item.name === 'Positive')?.value || 0;

        const totalStudents = filteredStudents.length;

        return {
            totalStudents: totalStudents,
            topTool: toolUsageData.length > 0 ? toolUsageData[0].name : 'N/A',
            dominantConcern: concernData.length > 0 ? concernData[0].name : 'None',
            // Use the positive count directly for the percentage calculation
            positiveImpactPercentage: totalStudents > 0 ? (positiveImpactCount / totalStudents * 100) : 0
        }
    }, [filteredStudents, toolUsageData, concernData, impactData]);

    const clearFilters = () => {
        setSelectedCountry('all');
        setSelectedTool('all');
        setSelectedMajor('all');
    };

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    fontWeight={800}
                    gutterBottom
                    sx={{
                        color: "#FFFFFF",
                        mb: 1,
                        textAlign: "left"
                    }}
                >
                    AI Adoption Landscape
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'text.secondary',
                        maxWidth: 600,
                        textAlign: "left"
                    }}
                >
                    Deep dive into how specialized tools are reshaping the academic experience for {filteredStudents.length} students.
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{
                p: 2,
                mb: 4,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}>
                {[
                    { label: 'Country', val: selectedCountry, set: setSelectedCountry, opts: countries },
                    { label: 'Major', val: selectedMajor, set: setSelectedMajor, opts: majors },
                    { label: 'Tool', val: selectedTool, set: setSelectedTool, opts: toolsList }
                ].map((f, i) => (
                    <FormControl key={i} size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>{f.label}</InputLabel>
                        <Select value={f.val} label={f.label} onChange={e => f.set(e.target.value)}>
                            <MenuItem value="all">All</MenuItem>
                            {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </Select>
                    </FormControl>
                ))}
                {(selectedCountry !== 'all' || selectedMajor !== 'all' || selectedTool !== 'all') && (
                    <Button variant="outlined" color="error" startIcon={<X size={16} />} onClick={clearFilters}>
                        Clear
                    </Button>
                )}
            </Box>

            {/* Quick Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Top AI Tool"
                        value={keymetrics.topTool}
                        icon={Brain}
                        color={theme.palette.primary.main}
                        delay={0}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Students"
                        value={keymetrics.totalStudents.toLocaleString()}
                        icon={Zap}
                        color={theme.palette.secondary.main}
                        delay={0.1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Top Concern"
                        value={keymetrics.dominantConcern.substring(0, 15) + (keymetrics.dominantConcern.length > 15 ? '...' : '')}
                        icon={AlertTriangle}
                        color={theme.palette.warning.main}
                        delay={0.2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Positive Impact"
                        value={`${keymetrics.positiveImpactPercentage.toFixed(0)}%`}
                        icon={TrendingUp}
                        color={theme.palette.success.main}
                        subtext="Sentiment"
                        delay={0.3}
                    />
                </Grid>
            </Grid>

            {/* Visuals */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* 1. Market Share (Vertical Bar) */}
                <Grid item xs={12} md={8}>
                    <ChartCard title="Market Share: AI Tools" subtitle="Adoption by Tool Name">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={toolUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip contentStyle={{ borderRadius: 12, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                    {toolUsageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.primary.main : theme.palette.primary.dark} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* 2. Sentiment (Donut) - Simplified Data and Legend */}
                <Grid item xs={12} md={4}>
                    <ChartCard title="Student Sentiment" subtitle="Perceived Impact (Aggregated)">
                        <Box sx={{ position: 'relative', width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={impactData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name" // Use the category name for slices
                                        animationDuration={1500}
                                    >
                                        {/* Cell mapping uses the simplified getImpactColor */}
                                        {impactData.map((entry, index) => (
                                            <Cell key={index} fill={getImpactColor(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 12, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    pointerEvents: 'none'
                                }}
                            >
                                <Typography variant="h4" fontWeight={700}>
                                    {keymetrics.totalStudents}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    Total Students
                                </Typography>
                            </Box>
                        </Box>

                        {/* SIMPLIFIED CUSTOM LEGEND */}
                        <SimplifiedCustomSentimentLegend
                            labels={SIMPLIFIED_SENTIMENT_LABELS}
                            getImpactColor={getImpactColor}
                            data={impactData}
                        />

                    </ChartCard>
                </Grid>

                {/* 3. Concerns (Text List) */}
                <Grid item xs={12}>
                    <ChartCard title="Primary Concerns" subtitle="Barriers to adoption" height="auto">
                        <Stack spacing={2}>
                            {concernData.map((item, index) => (
                                <Box key={index} sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid',
                                    borderColor: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: theme.palette.primary.main }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                                        <Box sx={{
                                            minWidth: 32, height: 32, borderRadius: '50%',
                                            bgcolor: index === 0 ? theme.palette.error.main : 'rgba(255,255,255,0.1)',
                                            color: index === 0 ? 'white' : theme.palette.text.secondary,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '0.9rem',
                                            boxShadow: index === 0 ? `0 0 10px ${theme.palette.error.main}80` : 'none'
                                        }}>
                                            {index + 1}
                                        </Box>
                                        <Typography variant="body1" sx={{
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            maxWidth: '100%',
                                            fontWeight: 500
                                        }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${item.value} students`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary' }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </ChartCard>
                </Grid>

                {/* 4. Strategic Text */}
                <Grid item xs={12}>
                    <ChartCard title="Strategic Takeaway" height="auto">
                        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
                            The data indicates a massive convergence towards <strong style={{ color: theme.palette.primary.main }}>{keymetrics.topTool}</strong>.
                            However, <strong style={{ color: theme.palette.warning.main }}>{keymetrics.dominantConcern}</strong> remains a significant barrier for {((concernData[0]?.value || 0) / keymetrics.totalStudents * 100).toFixed(0)}% of students.
                        </Typography>
                        <Alert
                            severity="info"
                            icon={<CheckCircle color={theme.palette.secondary.main} />}
                            sx={{
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'text.primary',
                                '& .MuiAlert-message': { width: '100%' }
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.secondary.main }}>Recommendation</Typography>
                            <Typography variant="body2">Address {keymetrics.dominantConcern} through targeted workshops and guideline clarification.</Typography>
                        </Alert>
                    </ChartCard>
                </Grid>
            </Grid>
        </Box>
    );
}