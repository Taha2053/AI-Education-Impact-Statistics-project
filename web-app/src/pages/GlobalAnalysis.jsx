import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Users,
  Brain,
  Award,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Globe
} from 'lucide-react';
import { useData } from '../context/DataContext';
import WorldMap from '../components/WorldMap';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function GlobalAnalysis() {
  const { data, loading, metadata, countrySummaries } = useData();
  const theme = useTheme();

  const [sortConfig, setSortConfig] = useState({ key: 'student_count', direction: 'desc' });

  // Filter out "Global" for comparisons
  const comparisonData = useMemo(() => {
    if (!countrySummaries) return [];
    return countrySummaries.filter(c => c.country !== 'Global');
  }, [countrySummaries]);

  // Calculations for Hero Cards
  const stats = useMemo(() => {
    if (comparisonData.length === 0) return {};
    const maxGPA = [...comparisonData].sort((a, b) => b.avg_gpa - a.avg_gpa)[0];
    const maxAI = [...comparisonData].sort((a, b) => b.avg_ai_usage_hours - a.avg_ai_usage_hours)[0];
    const maxStress = [...comparisonData].sort((a, b) => b.avg_stress - a.avg_stress)[0];
    return { maxGPA, maxAI, maxStress };
  }, [comparisonData]);

  // Sorted Table Data
  const sortedTableData = useMemo(() => {
    let sorted = [...comparisonData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [comparisonData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Typography color="text.primary" variant="h6">Loading global data...</Typography>
      </Box>
    );
  }

  // Scatter Chart Data Formatter
  const scatterData = comparisonData.map(c => ({
    country: c.country,
    x: parseFloat(c.avg_ai_usage_hours.toFixed(2)),
    y: parseFloat(c.avg_gpa.toFixed(2)),
    z: c.student_count
  }));

  // Bar Chart Data
  const barData = sortedTableData.slice(0, 10).sort((a, b) => b.student_count - a.student_count).map(c => ({
    name: c.country,
    students: c.student_count
  }));

  return (
    <Box sx={{ pb: 5, maxWidth: '100%', width: '100%' }}>
      {/* TITLE */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Global Analysis
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Comparative insights across {comparisonData.length} countries.
        </Typography>
      </Box>

      {/* HERO METRICS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Global Reach"
            value={metadata?.total_students?.toLocaleString()}
            icon={Globe}
            color={theme.palette.primary.main}
            subtext={`${comparisonData.length} Countries Analyzed`}
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Performer"
            value={stats.maxGPA?.country || 'N/A'}
            icon={Award}
            color={theme.palette.success.main}
            subtext={`Avg GPA: ${stats.maxGPA?.avg_gpa?.toFixed(2)}`}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Highest AI Usage"
            value={stats.maxAI?.country || 'N/A'}
            icon={Brain}
            color={theme.palette.secondary.main}
            subtext={`${stats.maxAI?.avg_ai_usage_hours?.toFixed(1)} hrs/week`}
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Highest Stress"
            value={stats.maxStress?.country || 'N/A'}
            icon={AlertTriangle}
            color={theme.palette.error.main}
            subtext={`Level: ${stats.maxStress?.avg_stress?.toFixed(1)}/10`}
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* MAIN VISUALS ROW */}
      {/* 1. MAP (Full Width) */}
      <Box sx={{ mb: 4, height: 600, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.5)' }}>
        {countrySummaries && countrySummaries.length > 0 ? (
          <WorldMap countrySummaries={countrySummaries} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">No geographic data available</Typography>
          </Box>
        )}
      </Box>

      {/* 2. CHARTS (Quadrant + Student Count) */}
      <Grid container spacing={6} sx={{ mb: 4 }}>
        {/* QUADRANT CHART */}
        <Grid item xs={12} lg={7}>
          <ChartCard title="Performance Quadrant" subtitle="AI Usage (X) vs GPA (Y) - Bubble Size: Population">
            <Box sx={{ height: 550 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="AI Usage"
                    unit="h"
                    stroke="rgba(255,255,255,0.5)"
                    label={{ value: 'AI Hours/Week', position: 'bottom', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="GPA"
                    stroke="rgba(255,255,255,0.5)"
                    domain={[2.5, 4.0]}
                    label={{ value: 'Avg GPA', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="Students" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Box sx={{ p: 2, bgcolor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} color="white">{data.country}</Typography>
                            <Typography variant="body2" color="text.secondary">GPA: {data.y}</Typography>
                            <Typography variant="body2" color="text.secondary">AI: {data.x} hrs</Typography>
                            <Typography variant="body2" color="text.secondary">Students: {data.z}</Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Countries" data={scatterData} fill={theme.palette.primary.main}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main][index % 5]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* STUDENT COUNT BAR CHART */}
        <Grid item xs={12} lg={5}>
          <ChartCard title="Top Regions" subtitle="By Student Population">
            <Box sx={{ height: 550 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.7)" width={100} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="students" name="Students" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={theme.palette.secondary.main} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* DETAILED TABLE */}
      <ChartCard title="Detailed Statistics">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => requestSort('country')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Country {getSortIcon('country')}
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => requestSort('student_count')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    Students {getSortIcon('student_count')}
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{  fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => requestSort('avg_gpa')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    Avg GPA {getSortIcon('avg_gpa')}
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => requestSort('avg_ai_usage_hours')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    AI (h) {getSortIcon('avg_ai_usage_hours')}
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{  fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => requestSort('avg_stress')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    Stress {getSortIcon('avg_stress')}
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTableData.map((row) => (
                <TableRow
                  key={row.country}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}
                >
                  <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.dark, width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
                        {row.country.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {row.country}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {row.student_count.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {row.avg_gpa.toFixed(2)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(row.avg_gpa / 4.0) * 100}
                        sx={{ width: 50, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: theme.palette.success.main } }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {row.avg_ai_usage_hours.toFixed(1)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((row.avg_ai_usage_hours / 20) * 100, 100)}
                        sx={{
                          width: 50,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& .MuiLinearProgress-bar': { bgcolor: theme.palette.secondary.main }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Chip
                      label={row.avg_stress.toFixed(1)}
                      size="small"
                      sx={{
                        bgcolor: row.avg_stress > 6 ? 'rgba(255, 0, 50, 0.1)' : 'rgba(0, 255, 150, 0.1)',
                        color: row.avg_stress > 6 ? theme.palette.error.main : theme.palette.success.main,
                        fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: row.avg_stress > 6 ? 'rgba(255, 0, 50, 0.2)' : 'rgba(0, 255, 150, 0.2)'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ChartCard>
    </Box>
  );
}