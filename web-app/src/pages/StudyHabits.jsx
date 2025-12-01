import React, { useMemo } from 'react';
import { Typography, Box, Grid, Paper, useTheme, Chip } from '@mui/material';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';

export default function StudyHabits() {
    const { data, loading } = useData();
    const theme = useTheme();

    if (loading || !data) return <Typography>Loading...</Typography>;

    // Existing: Majors distribution
    const majors = {};
    data.students.forEach(s => {
        majors[s.major] = (majors[s.major] || 0) + 1;
    });

    // Existing: Study hours histogram
    const studyHours = data.students.map(s => s.study_hours_per_week);

    // Data processing for charts
    const studentData = data.students;

    // 1. Study time breakdown (AI-assisted vs. Traditional)
    const aiStudyHours = studentData.map(s => s.ai_usage_hours);
    const traditionalStudyHours = studentData.map(s => Math.max(0, s.study_hours_per_week - s.ai_usage_hours)); // Assuming traditional = total - AI
    // For "other" activities, we don't have explicit data, so we'll assume it's 0 for now.

    const studyTimeBreakdown = useMemo(() => {
        const totalAI = aiStudyHours.reduce((sum, hours) => sum + hours, 0);
        const totalTraditional = traditionalStudyHours.reduce((sum, hours) => sum + hours, 0);
        const totalStudy = totalAI + totalTraditional;

        return {
            labels: ['AI-Assisted Study', 'Traditional Study'],
            values: [totalAI, totalTraditional],
            total: totalStudy
        };
    }, [aiStudyHours, traditionalStudyHours]);

    // 2. Resource types used (AI tools vs. non-AI tools)
    const aiToolCounts = {};
    const nonAiToolCount = 0; // Assuming 'None' in ai_tool implies non-AI usage for categorization

    studentData.forEach(s => {
        if (s.ai_tool && s.ai_tool !== 'None') {
            aiToolCounts[s.ai_tool] = (aiToolCounts[s.ai_tool] || 0) + 1;
        }
    });

    const resourceTypeBreakdown = useMemo(() => {
        const labels = Object.keys(aiToolCounts);
        const values = Object.values(aiToolCounts);
        // Add a 'Non-AI' category if relevant, but based on current data, 'ai_tool' 'None' is the only indicator.
        // For simplicity, we'll only show explicit AI tools if 'ai_tool_usage' is > 0.
        // Or if we need a 'Non-AI' category, we need to define it better.
        // For now, let's just focus on AI tools identified.
        return {
            labels: labels,
            values: values
        };
    }, [aiToolCounts]);


    // 3. AI tool usage frequency against academic performance over time (simulated)
    // Since we don't have time-series data, we'll create a scatter plot with a trend line
    // or group by a simulated 'time' aspect (e.g., student ID as a proxy for progression if sorted).
    // For a dual-axis line chart "over time", we'll simulate a time progression.
    // Let's sort students by ID to give a sense of progression.
    const sortedStudents = [...studentData].sort((a, b) => parseInt(a.id.substring(3)) - parseInt(b.id.substring(3)));

    const aiUsagePerformanceData = useMemo(() => {
        const aiUsage = sortedStudents.map(s => s.ai_usage_hours);
        const gpa = sortedStudents.map(s => s.gpa);
        const studentIds = sortedStudents.map(s => s.id); // Proxy for 'time'

        return { aiUsage, gpa, studentIds };
    }, [sortedStudents]);

    // 4. Comparison Dashboard: AI-Integrated Learners vs. Traditional Learners
    const aiIntegratedLearners = studentData.filter(s => s.ai_tool && s.ai_tool !== 'None');
    const traditionalLearners = studentData.filter(s => s.ai_tool === 'None');

    const calculateGroupStats = (group) => {
        if (group.length === 0) {
            return {
                avgStudyTime: 0,
                avgAiUsage: 0,
                avgGpa: 0,
                count: 0
            };
        }
        const totalStudyTime = group.reduce((sum, s) => sum + s.study_hours_per_week, 0);
        const totalAiUsage = group.reduce((sum, s) => sum + s.ai_usage_hours, 0);
        const totalGpa = group.reduce((sum, s) => sum + s.gpa, 0);

        return {
            avgStudyTime: (totalStudyTime / group.length).toFixed(2),
            avgAiUsage: (totalAiUsage / group.length).toFixed(2),
            avgGpa: (totalGpa / group.length).toFixed(2),
            count: group.length
        };
    };

    const aiLearnerStats = useMemo(() => calculateGroupStats(aiIntegratedLearners), [aiIntegratedLearners]);
    const traditionalLearnerStats = useMemo(() => calculateGroupStats(traditionalLearners), [traditionalLearners]);

    // New: 1. AI-Driven Study Efficiency: GPA per Study Hour
    const aiGpaPerStudyHour = aiLearnerStats.avgStudyTime > 0 ? (aiLearnerStats.avgGpa / parseFloat(aiLearnerStats.avgStudyTime)).toFixed(3) : 0;
    const traditionalGpaPerStudyHour = traditionalLearnerStats.avgStudyTime > 0 ? (traditionalLearnerStats.avgGpa / parseFloat(traditionalLearnerStats.avgStudyTime)).toFixed(3) : 0;

    // New: 2. AI Usage Patterns: AI Tool Preference
    const aiToolPreference = useMemo(() => {
        const counts = {};
        studentData.forEach(s => {
            if (s.ai_tool && s.ai_tool !== 'None') {
                counts[s.ai_tool] = (counts[s.ai_tool] || 0) + 1;
            }
        });
        const labels = Object.keys(counts);
        const values = Object.values(counts);
        return { labels, values };
    }, [studentData]);

    // New: 3. The AI Buffer: AI Usage and Stress/Satisfaction Levels
    const aiStressSatisfactionData = useMemo(() => {
        const aiUsageHours = studentData.map(s => s.ai_usage_hours);
        const stressLevels = studentData.map(s => s.stress_level);
        const satisfactionScores = studentData.map(s => s.satisfaction_score);
        return { aiUsageHours, stressLevels, satisfactionScores };
    }, [studentData]);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Study Habits</Typography>

            <Grid container spacing={3}>
                {/* Existing Major Distribution Chart */}
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
                {/* Existing Study Hours Distribution */}
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

                {/* New: Stacked Bar Chart - Study Time Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Study Time Breakdown (AI vs. Traditional)</Typography>
                        <Plot
                            data={[
                                {
                                    x: studyTimeBreakdown.labels,
                                    y: studyTimeBreakdown.values,
                                    type: 'bar',
                                    marker: {
                                        color: [theme.palette.success.main, theme.palette.warning.main]
                                    }
                                }
                            ]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                xaxis: { title: 'Study Type' },
                                yaxis: { title: 'Total Hours' }
                            }}
                            useResizeHandler
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </Paper>
                </Grid>

                {/* New: Stacked Bar Chart - Resource Types Used */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>AI Tool Usage by Type</Typography>
                        <Plot
                            data={[
                                {
                                    x: resourceTypeBreakdown.labels,
                                    y: resourceTypeBreakdown.values,
                                    type: 'bar',
                                    marker: {
                                        color: theme.palette.info.main
                                    }
                                }
                            ]}
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

                {/* New: Dual-Axis Line Chart - AI Usage vs. GPA */}
                <Grid item xs={12} md={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>AI Tool Usage vs. Academic Performance (Simulated Progression)</Typography>
                        <Plot
                            data={[
                                {
                                    x: aiUsagePerformanceData.studentIds,
                                    y: aiUsagePerformanceData.aiUsage,
                                    name: 'AI Usage Hours',
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    marker: { color: theme.palette.primary.main },
                                    line: { width: 2 }
                                },
                                {
                                    x: aiUsagePerformanceData.studentIds,
                                    y: aiUsagePerformanceData.gpa,
                                    name: 'GPA',
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    yaxis: 'y2',
                                    marker: { color: theme.palette.secondary.main },
                                    line: { width: 2 }
                                }
                            ]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                xaxis: { title: 'Student ID (Simulated Progression)' },
                                yaxis: { title: 'AI Usage Hours', color: theme.palette.primary.main },
                                yaxis2: {
                                    title: 'GPA',
                                    overlaying: 'y',
                                    side: 'right',
                                    color: theme.palette.secondary.main
                                },
                                legend: { orientation: 'h', y: -0.1 }
                            }}
                            useResizeHandler
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                        />
                    </Paper>
                </Grid>

                {/* New: Comparison Dashboard */}
                <Grid item xs={12} md={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Learner Group Comparison</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <Typography variant="h6" color="primary">AI-Integrated Learners</Typography>
                                    <Chip label={`Students: ${aiLearnerStats.count}`} color="primary" sx={{ mb: 1 }} />
                                    <Typography>Avg. Study Time: {aiLearnerStats.avgStudyTime} hrs/week</Typography>
                                    <Typography>Avg. AI Usage: {aiLearnerStats.avgAiUsage} hrs/week</Typography>
                                    <Typography>Avg. GPA: {aiLearnerStats.avgGpa}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <Typography variant="h6" color="secondary">Traditional Learners</Typography>
                                    <Chip label={`Students: ${traditionalLearnerStats.count}`} color="secondary" sx={{ mb: 1 }} />
                                    <Typography>Avg. Study Time: {traditionalLearnerStats.avgStudyTime} hrs/week</Typography>
                                    <Typography>Avg. AI Usage: {traditionalLearnerStats.avgAiUsage} hrs/week</Typography>
                                    <Typography>Avg. GPA: {traditionalLearnerStats.avgGpa}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 4 }}>
                {/* New: AI-Driven Study Efficiency: GPA per Study Hour */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Study Efficiency (GPA per Study Hour)</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <Typography variant="h6" color="primary">AI-Integrated Learners</Typography>
                                    <Typography>GPA/Study Hr: {aiGpaPerStudyHour}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <Typography variant="h6" color="secondary">Traditional Learners</Typography>
                                    <Typography>GPA/Study Hr: {traditionalGpaPerStudyHour}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* New: AI Usage Patterns: AI Tool Preference Bar Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Preferred AI Tools</Typography>
                        <Plot
                            data={[
                                {
                                    x: aiToolPreference.labels,
                                    y: aiToolPreference.values,
                                    type: 'bar',
                                    marker: { color: theme.palette.success.light }
                                }
                            ]}
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

                {/* New: The AI Buffer: AI Usage and Stress/Satisfaction Levels Scatter Plot */}
                <Grid item xs={12} md={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>AI Usage vs. Stress & Satisfaction</Typography>
                        <Plot
                            data={[
                                {
                                    x: aiStressSatisfactionData.aiUsageHours,
                                    y: aiStressSatisfactionData.stressLevels,
                                    name: 'Stress Level',
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: { color: theme.palette.error.main, size: 8, opacity: 0.6 },
                                    yaxis: 'y1'
                                },
                                {
                                    x: aiStressSatisfactionData.aiUsageHours,
                                    y: aiStressSatisfactionData.satisfactionScores,
                                    name: 'Satisfaction Score',
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: { color: theme.palette.info.main, size: 8, opacity: 0.6 },
                                    yaxis: 'y2'
                                }
                            ]}
                            layout={{
                                autosize: true,
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { color: theme.palette.text.secondary },
                                xaxis: { title: 'AI Usage Hours per Week' },
                                yaxis: { title: 'Stress Level (1-10)', color: theme.palette.error.main },
                                yaxis2: {
                                    title: 'Satisfaction Score (1-10)',
                                    overlaying: 'y',
                                    side: 'right',
                                    color: theme.palette.info.main
                                },
                                legend: { orientation: 'h', y: -0.2 }
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
