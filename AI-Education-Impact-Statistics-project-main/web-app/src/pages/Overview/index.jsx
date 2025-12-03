import React from 'react';
import { Typography, Grid, Box, useTheme } from '@mui/material';
import { Users, Globe, Brain, BookOpen, GraduationCap } from 'lucide-react';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';

export default function Overview() {
  const { data, loading } = useData();
  const theme = useTheme();

  if (loading || !data) return <Typography>Loading...</Typography>;

  const totalStudents = data.students.length;
  const avgGpa = (data.students.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(2);
  const avgAiUsage = (data.students.reduce((acc, s) => acc + s.ai_usage_hours, 0) / totalStudents).toFixed(1);
  const avgStudyHours = (data.students.reduce((acc, s) => acc + s.study_hours_per_week, 0) / totalStudents).toFixed(1);

  // Prepare chart data
  const countryGpa = data.country_summary.map(c => c.avg_gpa);
  const countryNames = data.country_summary.map(c => c.country);
  const countryAi = data.country_summary.map(c => c.avg_ai_usage);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Dashboard Overview</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            color={theme.palette.primary.main}
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. GPA"
            value={avgGpa}
            icon={GraduationCap}
            color={theme.palette.secondary.main}
            trend="up"
            trendValue="+0.2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. AI Usage (Hrs)"
            value={avgAiUsage}
            icon={Brain}
            color="#10b981"
            trend="up"
            trendValue="+2.5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Study Hours/Week"
            value={avgStudyHours}
            icon={BookOpen}
            color="#f59e0b"
            trend="down"
            trendValue="-1.2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>GPA vs AI Usage by Country</Typography>
            <Plot
              data={[
                {
                  x: countryNames,
                  y: countryGpa,
                  name: 'Avg GPA',
                  type: 'bar',
                  marker: { color: theme.palette.primary.main }
                },
                {
                  x: countryNames,
                  y: countryAi,
                  name: 'Avg AI Usage (Hrs)',
                  type: 'bar',
                  marker: { color: theme.palette.secondary.main }
                }
              ]}
              layout={{
                barmode: 'group',
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: theme.palette.text.secondary },
                margin: { t: 10, r: 10, l: 40, b: 40 },
                legend: { orientation: 'h', y: 1.1 },
                height: 350
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Student Distribution</Typography>
            <Plot
              data={[{
                values: data.country_summary.map(c => c.student_count),
                labels: countryNames,
                type: 'pie',
                hole: 0.6,
                marker: {
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.secondary.main,
                    '#10b981',
                    '#f59e0b'
                  ]
                }
              }]}
              layout={{
                autosize: true,
                paper_bgcolor: 'transparent',
                font: { color: theme.palette.text.secondary },
                margin: { t: 10, r: 10, l: 10, b: 10 },
                showlegend: true,
                legend: { orientation: 'h', y: -0.1 },
                height: 300
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
