import React, { useState, useMemo } from 'react';
import { Typography, Box, Grid, Paper, useTheme, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import Plot from 'react-plotly.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { extractAIToolsUnique } from '../utils/dataUtils';

export default function StudyHabits() {
    const { data, loading } = useData();
    const theme = useTheme();

    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedMajor, setSelectedMajor] = useState('All');
    const [selectedAITool, setSelectedAITool] = useState('All');

    if (loading || !data) return <Typography>Loading...</Typography>;

    const { countries, majors, aiTools } = useMemo(() => {
        if (!data?.students) return { countries: [], majors: [], aiTools: [] };
        return {
            countries: [...new Set(data.students.map((s) => s.country).filter(Boolean))].sort(),
            majors: [...new Set(data.students.map((s) => s.field_of_study || s.major).filter(Boolean))].sort(),
            aiTools: extractAIToolsUnique(data.students),
        };
    }, [data]);

    const studentData = data.students;

    const filteredStudents = useMemo(() => {
        return studentData.filter((s) => {
            const countryMatch = selectedCountry === 'All' || s.country === selectedCountry;
            const studentMajor = s.field_of_study || s.major;
            const majorMatch = selectedMajor === 'All' || studentMajor === selectedMajor;
            // Handle ai_tools as array
            const toolMatch = selectedAITool === 'All' ||
                (s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.includes(selectedAITool));
            return countryMatch && majorMatch && toolMatch;
        });
    }, [studentData, selectedCountry, selectedMajor, selectedAITool]);

    const aiStudyHours = filteredStudents.map(s => s.ai_usage_hours || 0);
    const traditionalStudyHours = filteredStudents.map(s => Math.max(0, (s.study_hours_per_week || 0) - (s.ai_usage_hours || 0)));

    const studyTimeBreakdown = useMemo(() => {
        const totalAI = aiStudyHours.reduce((sum, hours) => sum + (hours || 0), 0);
        const totalTraditional = traditionalStudyHours.reduce((sum, hours) => sum + (hours || 0), 0);
        const totalStudy = totalAI + totalTraditional;

        return {
            labels: ['AI-Assisted Study', 'Traditional Study'],
            values: [totalAI, totalTraditional],
            total: totalStudy
        };
    }, [aiStudyHours, traditionalStudyHours]);

    const aiToolCounts = {};
    filteredStudents.forEach(s => {
        if (s.ai_tools && Array.isArray(s.ai_tools)) {
            s.ai_tools.forEach(tool => {
                if (tool && tool !== 'None') {
                    aiToolCounts[tool] = (aiToolCounts[tool] || 0) + 1;
                }
            });
        }
    });

    const resourceTypeBreakdown = useMemo(() => {
        const labels = Object.keys(aiToolCounts);
        const values = Object.values(aiToolCounts);
        return {
            labels: labels,
            values: values
        };
    }, [aiToolCounts]);

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        const getIdNumber = (id) => {
            if (!id || typeof id !== 'string') return 0;
            const match = id.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
        };
        return getIdNumber(a.id) - getIdNumber(b.id);
    });

    const aiUsagePerformanceData = useMemo(() => {
        const aiUsage = sortedStudents.map(s => s.ai_usage_hours || 0);
        const gpa = sortedStudents.map(s => s.gpa || 0);
        const studentIds = sortedStudents.map(s => s.id || '');

        return { aiUsage, gpa, studentIds };
    }, [sortedStudents]);

    const aiIntegratedLearners = filteredStudents.filter(s =>
        s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.length > 0 &&
        !s.ai_tools.every(tool => tool === 'None')
    );
    const traditionalLearners = filteredStudents.filter(s =>
        !s.ai_tools || !Array.isArray(s.ai_tools) || s.ai_tools.length === 0 ||
        s.ai_tools.every(tool => tool === 'None')
    );

    const calculateGroupStats = (group) => {
        if (group.length === 0) {
            return {
                avgStudyTime: 0,
                avgAiUsage: 0,
                avgGpa: 0,
                avgStress: 0,
                avgSatisfaction: 0,
                avgAiStudyProportion: 0,
                count: 0
            };
        }
        const totalStudyTime = group.reduce((sum, s) => sum + (s.study_hours_per_week || 0), 0);
        const totalAiUsage = group.reduce((sum, s) => sum + (s.ai_usage_hours || 0), 0);

        const validGpaStudents = group.filter(s => s.gpa != null && !isNaN(s.gpa));
        const totalGpa = validGpaStudents.reduce((sum, s) => sum + s.gpa, 0);

        const validStressStudents = group.filter(s => s.stress_level != null && !isNaN(s.stress_level));
        const totalStress = validStressStudents.reduce((sum, s) => sum + s.stress_level, 0);

        const validSatisfactionStudents = group.filter(s => s.satisfaction_score != null && !isNaN(s.satisfaction_score));
        const totalSatisfaction = validSatisfactionStudents.reduce((sum, s) => sum + s.satisfaction_score, 0);

        return {
            avgStudyTime: totalStudyTime / group.length,
            avgAiUsage: totalAiUsage / group.length,
            avgGpa: validGpaStudents.length > 0 ? totalGpa / validGpaStudents.length : 0,
            avgStress: validStressStudents.length > 0 ? totalStress / validStressStudents.length : 0,
            avgSatisfaction: validSatisfactionStudents.length > 0 ? totalSatisfaction / validSatisfactionStudents.length : 0,
            avgAiStudyProportion: totalStudyTime > 0 ? (totalAiUsage / totalStudyTime) : 0,
            count: group.length
        };
    };

    const aiLearnerStats = useMemo(() => calculateGroupStats(aiIntegratedLearners), [aiIntegratedLearners]);
    const traditionalLearnerStats = useMemo(() => calculateGroupStats(traditionalLearners), [traditionalLearners]);

    const aiGpaPerStudyHour = aiLearnerStats.avgStudyTime > 0 ? (aiLearnerStats.avgGpa / aiLearnerStats.avgStudyTime) : 0;
    const traditionalGpaPerStudyHour = traditionalLearnerStats.avgStudyTime > 0 ? (traditionalLearnerStats.avgGpa / traditionalLearnerStats.avgStudyTime) : 0;

    const aiToolPreference = useMemo(() => {
        const counts = {};
        filteredStudents.forEach(s => {
            if (s.ai_tools && Array.isArray(s.ai_tools)) {
                s.ai_tools.forEach(tool => {
                    if (tool && tool !== 'None') {
                        counts[tool] = (counts[tool] || 0) + 1;
                    }
                });
            }
        });
        const labels = Object.keys(counts);
        const values = Object.values(counts);
        return { labels, values };
    }, [filteredStudents]);

    const aiStressSatisfactionData = useMemo(() => {
        const bins = [0, 5, 10, 15, 20, 25];
        const binLabels = ['0-5h', '6-10h', '11-15h', '16-20h', '21+h'];

        const groupedAverages = binLabels.map(label => ({
            bin: label,
            stressScores: [],
            satisfactionScores: [],
            avgStress: 0,
            avgSatisfaction: 0,
        }));

        filteredStudents.forEach(s => {
            const hours = s.ai_usage_hours || 0;
            let binIndex = bins.findIndex((bin, i) => hours >= bin && (i === bins.length - 1 || hours < bins[i + 1]));
            if (binIndex === -1 || binIndex >= groupedAverages.length) binIndex = groupedAverages.length - 1;

            if (s.stress_level != null && !isNaN(s.stress_level)) {
                groupedAverages[binIndex].stressScores.push(s.stress_level);
            }
            if (s.satisfaction_score != null && !isNaN(s.satisfaction_score)) {
                groupedAverages[binIndex].satisfactionScores.push(s.satisfaction_score);
            }
        });

        groupedAverages.forEach(group => {
            group.avgStress = group.stressScores.length > 0 ? group.stressScores.reduce((sum, val) => sum + val, 0) / group.stressScores.length : 0;
            group.avgSatisfaction = group.satisfactionScores.length > 0 ? group.satisfactionScores.reduce((sum, val) => sum + val, 0) / group.satisfactionScores.length : 0;
        });

        return groupedAverages;
    }, [filteredStudents]);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#020617',
            color: theme.palette.text.primary,
            pt: 6,
            pb: 8,
            px: { xs: 2, md: 4 }
        }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, textAlign: 'center', margin: '0 auto', maxWidth: '700px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Study Habits Insights
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', margin: '0 auto', maxWidth: '700px', color: theme.palette.text.secondary, fontSize: 16 }}>
                        Analyze how AI integration impacts student performance and well-being across demographics
                    </Typography>
                </Box>

                {/* Filters */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {[{
                        label: 'Country',
                        value: selectedCountry,
                        onChange: setSelectedCountry,
                        options: countries
                    },
                    {
                        label: 'Major',
                        value: selectedMajor,
                        onChange: setSelectedMajor,
                        options: majors
                    },
                    {
                        label: 'AI Tool',
                        value: selectedAITool,
                        onChange: setSelectedAITool,
                        options: aiTools
                    }].map((filter, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: theme.palette.text.secondary }}>{filter.label}</InputLabel>
                                <Select
                                    value={filter.value}
                                    label={filter.label}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    sx={{
                                        color: theme.palette.text.primary,
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.light },
                                        '.MuiSvgIcon-root ': { color: theme.palette.text.secondary },
                                    }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` } } }}
                                >
                                    <MenuItem value="All" sx={{ color: theme.palette.text.primary }}>All {filter.label}</MenuItem>
                                    {filter.options.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}
                </Grid>

                {/* KPI Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(37, 99, 235, 0.3) 100%)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ fontSize: 28, color: theme.palette.primary.light }}>📈</Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        AI Learner GPA
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 1 }}>
                                        {aiLearnerStats?.avgGpa?.toFixed(2) || '0.00'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                                        vs {traditionalLearnerStats?.avgGpa?.toFixed(2) || '0.00'} traditional
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.6) 0%, rgba(16, 185, 129, 0.3) 100%)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ fontSize: 28, color: theme.palette.success.light }}>⏱️</Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        Avg Study Time
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 1 }}>
                                        {aiLearnerStats?.avgStudyTime?.toFixed(1) || '0.0'}h
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                                        vs {traditionalLearnerStats?.avgStudyTime?.toFixed(1) || '0.0'}h traditional
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            background: 'linear-gradient(135deg, rgba(55, 15, 75, 0.6) 0%, rgba(168, 85, 247, 0.3) 100%)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ fontSize: 28, color: theme.palette.secondary.light }}>🧠</Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        Satisfaction
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 1 }}>
                                        {aiLearnerStats?.avgSatisfaction?.toFixed(1) || '0.0'}/10
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                                        Stress: {aiLearnerStats?.avgStress?.toFixed(1) || '0.0'}/10
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            background: 'linear-gradient(135deg, rgba(78, 22, 6, 0.6) 0%, rgba(251, 191, 36, 0.3) 100%)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ fontSize: 28, color: theme.palette.warning.light }}>⚡</Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        Sample Size
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 1 }}>
                                        {filteredStudents?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                                        {aiLearnerStats?.count || 0} AI, {traditionalLearnerStats?.count || 0} traditional
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Comparison Dashboard */}
                    <Grid item xs={12} md={12}>
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
                            <Typography variant="h6" sx={{ mb: 4, color: theme.palette.primary.light, fontWeight: 600, fontSize: 18 }}>
                                Learner Group Comparison (Academic & AI Usage Metrics)
                            </Typography>

                            <Plot
                                data={[
                                    {
                                        x: ['Avg. GPA', 'Avg. Study Time', 'Avg. AI Usage', 'Avg. AI Study Proportion'],
                                        y: [
                                            aiLearnerStats.avgGpa,
                                            aiLearnerStats.avgStudyTime,
                                            aiLearnerStats.avgAiUsage,
                                            aiLearnerStats.avgAiStudyProportion
                                        ],
                                        name: 'AI-Integrated Learners',
                                        type: 'bar',
                                        text: [
                                            aiLearnerStats.avgGpa.toFixed(2),
                                            aiLearnerStats.avgStudyTime.toFixed(1),
                                            aiLearnerStats.avgAiUsage.toFixed(2),
                                            aiLearnerStats.avgAiStudyProportion.toFixed(2)
                                        ],
                                        textposition: 'auto',
                                        marker: { color: theme.palette.info.light }
                                    },
                                    {
                                        x: ['Avg. GPA', 'Avg. Study Time', 'Avg. AI Usage', 'Avg. AI Study Proportion'],
                                        y: [
                                            traditionalLearnerStats.avgGpa,
                                            traditionalLearnerStats.avgStudyTime,
                                            traditionalLearnerStats.avgAiUsage,
                                            traditionalLearnerStats.avgAiStudyProportion
                                        ],
                                        name: 'Traditional Learners',
                                        type: 'bar',
                                        text: [
                                            traditionalLearnerStats.avgGpa.toFixed(2),
                                            traditionalLearnerStats.avgStudyTime.toFixed(1),
                                            traditionalLearnerStats.avgAiUsage.toFixed(2),
                                            traditionalLearnerStats.avgAiStudyProportion.toFixed(2)
                                        ],
                                        textposition: 'auto',
                                        marker: { color: theme.palette.primary.dark }
                                    }
                                ]}
                                layout={{
                                    barmode: 'group',
                                    autosize: true,
                                    paper_bgcolor: 'transparent',
                                    plot_bgcolor: 'transparent',
                                    font: { color: theme.palette.text.primary },
                                    height: 500,
                                    margin: { t: 80, b: 60, l: 60, r: 60 },
                                    xaxis: {
                                        title: { text: 'Metric', font: { size: 14, weight: 600, color: theme.palette.text.primary } },
                                        tickfont: { color: theme.palette.text.secondary },
                                        gridcolor: 'rgba(255,255,255,0.1)',
                                        zerolinecolor: 'rgba(255,255,255,0.2)'
                                    },
                                    yaxis: {
                                        title: { text: 'Average Metric Value', font: { size: 14, weight: 600, color: theme.palette.text.primary } },
                                        tickfont: { color: theme.palette.text.secondary },
                                        gridcolor: 'rgba(255,255,255,0.1)',
                                        zerolinecolor: 'rgba(255,255,255,0.2)'
                                    },
                                    legend: { orientation: 'h', y: 1.1, x: 0, bgcolor: 'transparent', font: { color: theme.palette.text.primary } },
                                }}
                                config={{ displayModeBar: false }}
                                useResizeHandler
                                style={{ width: '100%', height: '500px' }}
                            />

                        </Paper>
                    </Grid>

                    {/* Stress & Satisfaction - Line Chart */}
                    <Grid item xs={12} md={12}>
                        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.light, fontWeight: 600 }}>AI Usage vs. Stress & Satisfaction</Typography>
                            <ResponsiveContainer width="100%" height={550}>
                                <LineChart data={aiStressSatisfactionData} margin={{ top: 30, right: 50, left: 20, bottom: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="bin"
                                        stroke={theme.palette.text.secondary}
                                        tick={{ fontSize: 13 }}
                                        label={{ value: 'AI Usage Hours per Week', position: 'insideBottom', offset: -20, fill: theme.palette.text.secondary, fontSize: 14, fontWeight: 600 }}
                                    />
                                    <YAxis
                                        stroke={theme.palette.text.secondary}
                                        tick={{ fontSize: 13 }}
                                        domain={[0, 10]}
                                        label={{ value: 'Average Score (1-10)', angle: -90, position: 'insideLeft', offset: 10, fill: theme.palette.text.secondary, fontSize: 14, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: '8px',
                                            padding: '10px'
                                        }}
                                        labelStyle={{ color: theme.palette.text.primary }}
                                        formatter={(value) => value.toFixed(2)}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '14px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="avgStress"
                                        stroke={theme.palette.error.main}
                                        strokeWidth={3}
                                        dot={{ fill: theme.palette.error.main, r: 7 }}
                                        activeDot={{ r: 9 }}
                                        name="Stress Level"
                                        isAnimationActive={true}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avgSatisfaction"
                                        stroke={theme.palette.info.light}
                                        strokeWidth={3}
                                        dot={{ fill: theme.palette.info.light, r: 7 }}
                                        activeDot={{ r: 9 }}
                                        name="Satisfaction Score"
                                        isAnimationActive={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Insights and Interpretations Box */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.light, fontSize: 18, textAlign: 'center' }}>Insights&Interpretations</Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                                Leveraging the interactive filters above, we can dive deep into how AI tool usage correlates with student study habits, stress levels, and satisfaction across different demographics. Here are some key interpretations:
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, color: theme.palette.info.light, fontWeight: 600 }}>
                                        📊 Learner Group Comparison
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, ml: 2 }}>
                                        This chart provides a direct, side-by-side comparison of AI-Integrated Learners versus Traditional Learners. Observe differences in average GPA, total study time, AI usage hours, and the proportion of study time dedicated to AI. For instance, do AI users achieve higher GPAs with less overall study time, suggesting increased efficiency?
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, color: theme.palette.error.light, fontWeight: 600 }}>
                                        🎯 AI Usage vs. Stress & Satisfaction
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, ml: 2 }}>
                                        This curve chart clearly illustrates how average stress levels and average satisfaction scores change across different brackets of AI Usage Hours per Week. Look for trends: Does moderate AI usage lead to higher satisfaction and lower stress, while very high usage potentially correlates with increased stress or diminished returns?
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: theme.palette.warning.light, fontWeight: 600 }}>
                                        💡 Explore the filters to uncover nuanced patterns across countries, majors, and specific AI tools.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}