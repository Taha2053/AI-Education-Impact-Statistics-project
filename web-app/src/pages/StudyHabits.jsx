import React, { useState, useMemo } from 'react';
import {
    Typography,
    Box,
    Grid,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter
} from 'recharts';
import { useData } from '../context/DataContext';
import { extractAIToolsUnique, normalizeTool } from '../utils/dataUtils';
import { Clock, Brain, Activity, Smile, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function StudyHabits() {
    const { data, loading } = useData();
    const theme = useTheme();

    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedMajor, setSelectedMajor] = useState('All');
    const [selectedAITool, setSelectedAITool] = useState('All');

    // --- Filters ---
    const { countries, majors, aiTools } = useMemo(() => {
        if (!data?.students) return { countries: [], majors: [], aiTools: [] };
        return {
            countries: [...new Set(data.students.map((s) => s.country).filter(Boolean))].sort(),
            majors: [...new Set(data.students.map((s) => s.field_of_study || s.major).filter(Boolean))].sort(),
            aiTools: extractAIToolsUnique(data.students),
        };
    }, [data]);

    const filteredStudents = useMemo(() => {
        if (!data?.students) return [];
        return data.students.filter((s) => {
            const countryMatch = selectedCountry === 'All' || s.country === selectedCountry;
            const studentMajor = s.field_of_study || s.major;
            const majorMatch = selectedMajor === 'All' || studentMajor === selectedMajor;
            const toolMatch = selectedAITool === 'All' ||
                (s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.some(t => normalizeTool(t) === selectedAITool));
            return countryMatch && majorMatch && toolMatch;
        });
    }, [data, selectedCountry, selectedMajor, selectedAITool]);

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        const count = filteredStudents.length;
        if (count === 0) return null;

        const totalStudy = filteredStudents.reduce((sum, s) => sum + (s.study_hours_per_week || 0), 0);
        const totalAI = filteredStudents.reduce((sum, s) => sum + (s.ai_usage_hours || 0), 0);
        const avgStudy = totalStudy / count;
        const avgAI = totalAI / count;
        const avgStress = filteredStudents.reduce((sum, s) => sum + (s.stress_level || 0), 0) / count;
        const avgSatisfaction = filteredStudents.reduce((sum, s) => sum + (s.satisfaction_score || 0), 0) / count;
        const aiRatio = (totalAI / totalStudy) * 100;

        return { avgStudy, avgAI, aiRatio, avgStress, avgSatisfaction, count };
    }, [filteredStudents]);

    // --- Chart Data ---
    const pieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Traditional Study', value: stats.avgStudy - stats.avgAI },
            { name: 'AI-Assisted Study', value: stats.avgAI }
        ];
    }, [stats]);

    const stressByLoad = useMemo(() => {
        const brackets = {
            low: { totalStress: 0, count: 0, name: '< 10 hrs' },
            med: { totalStress: 0, count: 0, name: '10-20 hrs' },
            high: { totalStress: 0, count: 0, name: '> 20 hrs' }
        };
        filteredStudents.forEach(s => {
            const hrs = s.study_hours_per_week || 0;
            const stress = s.stress_level || 0;
            if (hrs < 10) { brackets.low.totalStress += stress; brackets.low.count++; }
            else if (hrs <= 20) { brackets.med.totalStress += stress; brackets.med.count++; }
            else { brackets.high.totalStress += stress; brackets.high.count++; }
        });
        return Object.values(brackets).map(b => ({
            name: b.name,
            avgStress: b.count ? (b.totalStress / b.count).toFixed(2) : 0,
            count: b.count
        }));
    }, [filteredStudents]);

    const satisfactionScatter = useMemo(() => {
        return filteredStudents
            .filter(s => s.gpa && s.satisfaction_score)
            .reduce((acc, s, i) => {
                if (i % 5 === 0) acc.push({ x: s.gpa, y: s.satisfaction_score, country: s.country }); // Sample 20%
                return acc;
            }, []);
    }, [filteredStudents]);


    if (loading || !data) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading Data...</Typography></Box>;

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h2" gutterBottom>
                    Study Habits & Well-being
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                    Analyzing how study patterns impact stress and satisfaction.
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{
                mb: 4,
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Country</InputLabel>
                            <Select value={selectedCountry} label="Country" onChange={e => setSelectedCountry(e.target.value)}>
                                <MenuItem value="All">All Countries</MenuItem>
                                {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Major</InputLabel>
                            <Select value={selectedMajor} label="Major" onChange={e => setSelectedMajor(e.target.value)}>
                                <MenuItem value="All">All Majors</MenuItem>
                                {majors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>AI Tool</InputLabel>
                            <Select value={selectedAITool} label="AI Tool" onChange={e => setSelectedAITool(e.target.value)}>
                                <MenuItem value="All">All Tools</MenuItem>
                                {aiTools.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Metrics */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Avg Study Load" value={`${stats.avgStudy.toFixed(1)}h`}
                            subtext="Per Week" icon={Clock} color={theme.palette.primary.main} delay={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="AI Dependency" value={`${stats.aiRatio.toFixed(1)}%`}
                            subtext="of study time" icon={Brain} color={theme.palette.secondary.main} delay={0.1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Avg Stress" value={`${stats.avgStress.toFixed(1)}/10`}
                            subtext="Self-reported" icon={Activity} color={theme.palette.error.main} delay={0.2}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Satisfaction" value={`${stats.avgSatisfaction.toFixed(1)}/10`}
                            subtext="Student Happiness" icon={Smile} color={theme.palette.success.main} delay={0.3}
                        />
                    </Grid>
                </Grid>
            )}

            {/* Visuals */}
            <Grid container spacing={4}>
                {/* Time Split */}
                <Grid item xs={12} md={6}>
                    <ChartCard title="Time Allocation" subtitle="Traditional vs AI Study">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill={theme.palette.text.disabled} /> {/* Traditional */}
                                    <Cell fill={theme.palette.secondary.main} /> {/* AI */}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Stress Analysis */}
                <Grid item xs={12} md={6}>
                    <ChartCard title="Stress vs Workload" subtitle="Does studying longer increase stress?">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={stressByLoad}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Bar dataKey="avgStress" name="Avg Stress" radius={[8, 8, 0, 0]}>
                                    {stressByLoad.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avgStress > 7 ? theme.palette.error.main : theme.palette.warning.main} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Satisfaction vs GPA */}
                <Grid item xs={12} md={12}>
                    <ChartCard title="Happiness Driver" subtitle="GPA (X) vs Satisfaction (Y)">
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="x" name="GPA" domain={[2, 4]} stroke="rgba(255,255,255,0.5)" />
                                <YAxis type="number" dataKey="y" name="Satisfaction" domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Scatter name="Students" data={satisfactionScatter} fill={theme.palette.success.main} opacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>
            </Grid>

            {/* Smart Alert */}
            {stats && (
                <Alert
                    severity={stats.avgStress > 7 ? "warning" : "info"}
                    icon={stats.avgStress > 7 ? <AlertCircle /> : <Activity />}
                    sx={{
                        mt: 4,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'text.primary',
                        '& .MuiAlert-icon': { color: theme.palette.primary.main }
                    }}
                    variant="outlined"
                >
                    <Typography variant="subtitle1" fontWeight={700}>Well-being Analysis</Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Students responding to this filter report an average stress level of <strong>{stats.avgStress.toFixed(1)}/10</strong>.
                        {stats.avgStudy > 20 && stats.avgStress > 6
                            ? " High study usage (>20h) appears to correlate with elevated stress levels."
                            : " Current study loads appear manageable for the majority of students."}
                    </Typography>
                </Alert>
            )}
        </Box>
    );
}