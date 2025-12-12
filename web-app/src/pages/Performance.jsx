import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Stack
} from '@mui/material';
import { useData } from '../context/DataContext';
import { extractAIToolsUnique, normalizeTool, downsampleData } from '../utils/dataUtils';
import regression from 'regression';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, CheckCircle, Brain, GraduationCap } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

// Constants
const GPA_RANGE = [2.0, 4.2];

export default function Performance() {
  const { data, loading } = useData();
  const theme = useTheme();

  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [selectedAITool, setSelectedAITool] = useState('All');

  // unique values
  const { countries, majors, aiTools } = useMemo(() => {
    if (!data?.students) return { countries: [], majors: [], aiTools: [] };
    const allMajors = new Set(data.students.map((s) => s.field_of_study || s.major).filter(Boolean));
    const allCountries = new Set(data.students.map((s) => s.country).filter(Boolean));
    const allTools = extractAIToolsUnique(data.students);
    return {
      countries: Array.from(allCountries).sort(),
      majors: Array.from(allMajors).sort(),
      aiTools: allTools,
    };
  }, [data]);

  // Filter Data
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((s) => {
      const countryMatch = selectedCountry === 'All' || s.country === selectedCountry;
      const majorMatch = selectedMajor === 'All' || (s.field_of_study || s.major) === selectedMajor;
      const toolMatch = selectedAITool === 'All' || (s.ai_tools && Array.isArray(s.ai_tools) && s.ai_tools.some(t => normalizeTool(t) === selectedAITool));
      return countryMatch && majorMatch && toolMatch;
    });
  }, [data, selectedCountry, selectedMajor, selectedAITool]);

  // Calculations
  const stats = useMemo(() => {
    const valid = filteredStudents.filter(s => s.ai_usage_hours != null && s.gpa != null);
    if (!valid.length) return null;

    const x = valid.map(s => s.ai_usage_hours);
    const y = valid.map(s => s.gpa);

    // Regression
    const points = x.map((val, i) => [val, y[i]]);
    const result = regression.linear(points);
    const slope = result.equation[0];
    const correlation = result.r2;

    // Averages
    const avgGPA = y.reduce((a, b) => a + b, 0) / y.length;
    const avgUsage = x.reduce((a, b) => a + b, 0) / x.length;

    // Brackets
    const brackets = { low: [], medium: [], high: [] };
    valid.forEach(s => {
      if (s.ai_usage_hours < 5) brackets.low.push(s.gpa);
      else if (s.ai_usage_hours <= 15) brackets.medium.push(s.gpa);
      else brackets.high.push(s.gpa);
    });
    const bracketStats = [
      { name: 'Low (<5h)', gpa: brackets.low.length ? brackets.low.reduce((a, b) => a + b, 0) / brackets.low.length : 0, count: brackets.low.length },
      { name: 'Optimal (5-15h)', gpa: brackets.medium.length ? brackets.medium.reduce((a, b) => a + b, 0) / brackets.medium.length : 0, count: brackets.medium.length },
      { name: 'High (>15h)', gpa: brackets.high.length ? brackets.high.reduce((a, b) => a + b, 0) / brackets.high.length : 0, count: brackets.high.length },
    ];

    return { slope, correlation, avgGPA, avgUsage, bracketStats, equation: result.string };
  }, [filteredStudents]);

  if (loading || !stats) return <Box sx={{ p: 4 }}><Typography>Loading Performance Data...</Typography></Box>;

  // Scatter Plot Data
  const scatterPlotData = downsampleData(filteredStudents.filter(s => s.ai_usage_hours != null && s.gpa != null), 500).map(s => ({
    x: s.ai_usage_hours,
    y: s.gpa,
    country: s.country,
    major: s.field_of_study || s.major
  }));

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Performance Analysis
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Investigating the link between AI usage patterns and Academic Success.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{
        mb: 5,
        p: 2,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Grid container spacing={2}>
          {[
            { label: 'Country', val: selectedCountry, set: setSelectedCountry, opts: countries },
            { label: 'Major', val: selectedMajor, set: setSelectedMajor, opts: majors },
            { label: 'AI Tool', val: selectedAITool, set: setSelectedAITool, opts: aiTools },
          ].map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <FormControl fullWidth size="small">
                <InputLabel>{f.label}</InputLabel>
                <Select value={f.val} label={f.label} onChange={e => f.set(e.target.value)}>
                  <MenuItem value="All">All {f.label}s</MenuItem>
                  {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Hero Stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg GPA"
            value={stats.avgGPA.toFixed(2)}
            subtext="Visualized Population"
            icon={GraduationCap}
            color={theme.palette.success.main}
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Usage"
            value={`${stats.avgUsage.toFixed(1)}h`}
            subtext="Per Week"
            icon={Brain}
            color={theme.palette.primary.main}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Trend Impact"
            value={stats.slope > 0 ? `+${(stats.slope * 10).toFixed(2)}` : `${(stats.slope * 10).toFixed(2)}`}
            subtext="GPA change per 10h AI"
            icon={TrendingUp}
            color={stats.slope > 0 ? theme.palette.success.main : theme.palette.warning.main}
            trend={stats.slope > 0 ? 'up' : 'down'}
            trendValue={Math.abs(stats.slope * 10).toFixed(2)}
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Brackets Analysis */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={5}>
          <ChartCard title="Impact by Usage Level" subtitle="Does 'more AI' mean 'better grades'?">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.bracketStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                <YAxis domain={[3.0, 3.8]} stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Box sx={{ p: 2, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                          <Typography variant="subtitle2" color="white">{payload[0].payload.name}</Typography>
                          <Typography variant="h6" color={theme.palette.primary.main}>{payload[0].value.toFixed(2)} GPA</Typography>
                          <Typography variant="caption" color="text.secondary">{payload[0].payload.count} Students</Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="gpa" radius={[8, 8, 0, 0]} animationDuration={1500}>
                  {stats.bracketStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? theme.palette.success.main : theme.palette.primary.main} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={7}>
          <ChartCard title="Detailed Distribution" subtitle={`Scatter plot of ${filteredStudents.length} Students`}>
            <Box sx={{ flex: 1, overflow: 'hidden', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name="AI Usage" unit="h" stroke="rgba(255,255,255,0.5)" />
                  <YAxis type="number" dataKey="y" name="GPA" domain={GPA_RANGE} stroke="rgba(255,255,255,0.5)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Students" data={scatterPlotData} fill={theme.palette.primary.main} opacity={0.6} />
                  {/* Trend Line */}
                  <ReferenceLine
                    segment={[
                      { x: 0, y: stats.avgGPA - (stats.slope * stats.avgUsage) },
                      { x: 30, y: (stats.avgGPA - (stats.slope * stats.avgUsage)) + (stats.slope * 30) }
                    ]}
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Insight Alert */}
      <Alert
        severity={stats.avgGPA > 3.5 ? "success" : "info"}
        icon={stats.avgGPA > 3.5 ? <CheckCircle /> : <Brain />}
        sx={{
          borderRadius: 3,
          mb: 4,
          bgcolor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'text.primary',
          '& .MuiAlert-icon': { color: theme.palette.primary.main }
        }}
        variant="outlined"
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Analysis Conclusion
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.8)">
          Based on the current filter, students show a <strong>{stats.slope > 0 ? "positive" : "negative"}</strong> correlation between AI usage and GPA.
          The optimal usage bracket appears to be <strong>{stats.bracketStats.sort((a, b) => b.gpa - a.gpa)[0].name}</strong>, where students achieve the highest average GPA of {stats.bracketStats.sort((a, b) => b.gpa - a.gpa)[0].gpa.toFixed(2)}.
        </Typography>
      </Alert>
    </Box>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ p: 2, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
        <Typography variant="subtitle2" color="white">{data.country}</Typography>
        <Typography variant="body2" color="text.secondary">{data.major}</Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2"><b>GPA:</b> {data.y}</Typography>
          <Typography variant="body2"><b>AI:</b> {data.x} hrs</Typography>
        </Box>
      </Box>
    );
  }
  return null;
};
