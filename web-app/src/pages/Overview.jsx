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
  Button,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Users,
  GraduationCap,
  BrainCircuit,
  X,
  Filter,
  BarChart2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeTool, calculateAverage, formatGPA } from '../utils/dataUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function Overview() {
  const { data, loading } = useData();
  const theme = useTheme();

  // Filters state
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState('all');

  // Memoized unique filter values
  const uniqueCountries = useMemo(() => {
    if (!data?.students) return [];
    return [...new Set(data.students.map(s => s.country).filter(Boolean))].sort();
  }, [data]);

  const uniqueFields = useMemo(() => {
    if (!data?.students) return [];
    return [...new Set(data.students.map(s => s.field_of_study || s.major).filter(Boolean))].sort();
  }, [data]);

  // Filtered Data
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter(student => {
      const countryMatch = selectedCountry === 'all' || student.country === selectedCountry;
      const fieldMatch = selectedFieldOfStudy === 'all' || (student.field_of_study || student.major) === selectedFieldOfStudy;
      return countryMatch && fieldMatch;
    });
  }, [data, selectedCountry, selectedFieldOfStudy]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) return { total: 0, avgGPA: 0, aiAdoption: 0, topTool: 'N/A' };

    const gpas = filteredStudents.map(s => s.gpa).filter(val => val != null);
    const avgGPA = calculateAverage(gpas);

    const aiUsers = filteredStudents.filter(s =>
      (s.ai_usage_hours > 0) ||
      (s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.length > 0 && !s.ai_tools.every(t => t === 'None'))
    ).length;
    const aiAdoption = (aiUsers / total) * 100;

    // Correct Tool Counting
    const toolCounts = {};
    filteredStudents.forEach(s => {
      if (s.ai_tools && Array.isArray(s.ai_tools)) {
        s.ai_tools.forEach(rawTool => {
          const tool = normalizeTool(rawTool);
          if (tool) {
            toolCounts[tool] = (toolCounts[tool] || 0) + 1;
          }
        });
      }
    });

    const sortedTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
    const topTool = sortedTools.length > 0 ? sortedTools[0][0] : 'None';

    return { total, avgGPA, aiAdoption, topTool, sortedTools };
  }, [filteredStudents]);

  // Chart Data: GPA Distribution
  const gpaData = useMemo(() => {
    const buckets = [
      { name: '< 2.0', min: 0, max: 2.0, count: 0 },
      { name: '2.0-2.5', min: 2.0, max: 2.5, count: 0 },
      { name: '2.5-3.0', min: 2.5, max: 3.0, count: 0 },
      { name: '3.0-3.5', min: 3.0, max: 3.5, count: 0 },
      { name: '3.5-4.0', min: 3.5, max: 4.0, count: 0 },
    ];
    filteredStudents.forEach(s => {
      if (s.gpa != null) {
        const bucket = buckets.find(b => s.gpa >= b.min && s.gpa < b.max) || (s.gpa === 4.0 ? buckets[4] : null);
        if (bucket) bucket.count++;
      }
    });
    return buckets;
  }, [filteredStudents]);

  // Chart Data: Top 5 Tools
  const topToolsData = useMemo(() => {
    return (stats?.sortedTools || []).slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [stats]);


  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading Data...</Typography></Box>;

  const clearFilters = () => {
    setSelectedCountry('all');
    setSelectedFieldOfStudy('all');
  };

  return (
    <Box sx={{ pb: 5, maxWidth: '100%', width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Academic & AI Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time analysis of student performance and technology adoption.
        </Typography>
      </Box>

      {/* Filters Bar */}
      <Box sx={{
        mb: 4,
        p: 2,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main, mr: 2 }}>
          <Filter size={20} />
          <Typography variant="button" fontWeight={700}>FILTERS</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Country</InputLabel>
          <Select value={selectedCountry} label="Country" onChange={e => setSelectedCountry(e.target.value)}>
            <MenuItem value="all">Global (All)</MenuItem>
            {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Major</InputLabel>
          <Select value={selectedFieldOfStudy} label="Major" onChange={e => setSelectedFieldOfStudy(e.target.value)}>
            <MenuItem value="all">All Majors</MenuItem>
            {uniqueFields.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        </FormControl>
        {(selectedCountry !== 'all' || selectedFieldOfStudy !== 'all') && (
          <Button startIcon={<X size={16} />} onClick={clearFilters} variant="outlined" size="small" color="secondary">
            Clear
          </Button>
        )}
        <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary', fontFamily: 'monospace' }}>
          Query: {stats.total.toLocaleString()} records
        </Typography>
      </Box>

      {/* Metric Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.total.toLocaleString()}
            icon={Users}
            color={theme.palette.primary.main}
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average GPA"
            value={formatGPA(stats.avgGPA)}
            icon={GraduationCap}
            color={theme.palette.success.main}
            subtext="on 4.0 scale"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Adoption Rate"
            value={`${stats.aiAdoption.toFixed(1)}%`}
            icon={BrainCircuit}
            color={theme.palette.secondary.main}
            subtext="active usage"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dominant Tool"
            value={stats.topTool}
            icon={BarChart2}
            color={theme.palette.warning.main}
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* Row 2: GPA Distribution and Top Tools side by side */}
      <Grid container spacing={6} sx={{ mb: 4 }}>
        {/* GPA Distribution - Takes half the width */}
        <Grid item xs={12} md={6}>
          <ChartCard title="GPA Distribution" subtitle="Frequency of GPA ranges across the population">
            <Box sx={{ height: 550 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                  itemStyle={{ color: theme.palette.primary.main }}
                />
                <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]} fill="url(#colorGpa)" />
              </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Top Tools Bar Chart - Takes half the width */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Top 5 AI Tools" subtitle="Most frequently cited tools">
            <Box sx={{ height: 550, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={3} mt={1}>
                {topToolsData.map((item, index) => (
                  <Box key={item.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: index === 0 ? theme.palette.primary.main : 'text.primary' }}>
                        {index + 1}. {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / stats.total) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& .MuiLinearProgress-bar': {
                          background: index === 0
                            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            : theme.palette.text.secondary,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Row 3: Correlation Analysis - Full Width */}
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <ChartCard title="Correlation Analysis" subtitle="GPA vs. Weekly AI Usage Hours">
            <Box sx={{ height: 600 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="AI Usage"
                    unit="h"
                    stroke="rgba(255,255,255,0.5)"
                    label={{ value: 'AI Hours/Week', position: 'insideBottom', offset: -20, fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="GPA"
                    domain={[0, 4.2]}
                    stroke="rgba(255,255,255,0.5)"
                    label={{ value: 'GPA', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: 600 }}
                    itemStyle={{ color: theme.palette.secondary.main }}
                  />
                  <Scatter
                    name="Students"
                    data={filteredStudents.filter(s => s.ai_usage_hours > 0 && s.gpa > 0).map(s => ({ x: s.ai_usage_hours, y: s.gpa }))}
                    fill={theme.palette.secondary.main}
                    opacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}