import React, { useMemo, useState } from 'react';
import { Typography, Grid, Box, useTheme, Chip, Paper, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Users, Brain, BookOpen, GraduationCap, TrendingUp, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';

export default function Overview() {
  const { data, loading, countrySummaries } = useData();
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState('all');
  const [mapMetric, setMapMetric] = useState('avg_gpa');

  // Get unique countries
  const uniqueCountries = useMemo(() => {
    if (!data) return [];
    const countries = new Set(data.students.map(s => s.country));
    return Array.from(countries).sort();
  }, [data]);

  // Get unique fields of study
  const uniqueFieldsOfStudy = useMemo(() => {
    if (!data) return [];
    const fields = new Set(data.students.map(s => s.field_of_study || s.major).filter(Boolean));
    return Array.from(fields).sort();
  }, [data]);

  // Filter students based on selected country
  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.students.filter(s => {
      const countryMatch = selectedCountry === 'all' || s.country === selectedCountry;
      const studentField = s.field_of_study || s.major;
      const majorMatch = selectedFieldOfStudy === 'all' || studentField === selectedFieldOfStudy;
      return countryMatch && majorMatch;
    });
  }, [data, selectedCountry, selectedFieldOfStudy]);

  // Filter country summary based on selected country
  const filteredCountrySummary = useMemo(() => {
    if (!countrySummaries || !Array.isArray(countrySummaries)) return [];
    if (selectedCountry === 'all') return countrySummaries;
    return countrySummaries.filter(c => c.country === selectedCountry);
  }, [countrySummaries, selectedCountry]);

  // Calculate key metrics
  const totalStudents = filteredStudents.length;

  const avgGpa = useMemo(() => {
    if (totalStudents === 0) return 'N/A';
    const validGPAs = filteredStudents.filter(s => s.gpa !== null && s.gpa !== undefined && !isNaN(s.gpa));
    if (validGPAs.length === 0) return 'N/A';
    return (validGPAs.reduce((acc, s) => acc + s.gpa, 0) / validGPAs.length).toFixed(2);
  }, [filteredStudents, totalStudents]);

  const avgAiUsage = useMemo(() => {
    if (totalStudents === 0) return '0.0';
    const validUsage = filteredStudents.filter(s => s.ai_usage_hours !== null && !isNaN(s.ai_usage_hours));
    if (validUsage.length === 0) return '0.0';
    return (validUsage.reduce((acc, s) => acc + s.ai_usage_hours, 0) / validUsage.length).toFixed(1);
  }, [filteredStudents, totalStudents]);

  const avgStudyHours = useMemo(() => {
    if (totalStudents === 0) return '0.0';
    const validHours = filteredStudents.filter(s => s.study_hours_per_week !== null && !isNaN(s.study_hours_per_week));
    if (validHours.length === 0) return '0.0';
    return (validHours.reduce((acc, s) => acc + s.study_hours_per_week, 0) / validHours.length).toFixed(1);
  }, [filteredStudents, totalStudents]);

  // Most popular AI tool
  const aiToolCounts = useMemo(() => {
    const tools = {};
    filteredStudents.forEach(s => {
      tools[s.ai_tool] = (tools[s.ai_tool] || 0) + 1;
    });
    return tools;
  }, [filteredStudents]);

  const mostPopularTool = useMemo(() => {
    const entries = Object.entries(aiToolCounts);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
  }, [aiToolCounts]);

  // AI usage percentage
  const aiUsagePercentage = useMemo(() => {
    if (totalStudents === 0) return '0.0';
    const usingAI = filteredStudents.filter(s => s.ai_usage_hours > 0).length;
    return ((usingAI / totalStudents) * 100).toFixed(1);
  }, [filteredStudents, totalStudents]);

  // Calculate GPA-AI correlation
  const correlation = useMemo(() => {
    if (filteredStudents.length === 0) return 0;

    // Filter out students with null GPA or AI usage
    const validStudents = filteredStudents.filter(s =>
      s.gpa !== null && s.gpa !== undefined && !isNaN(s.gpa) &&
      s.ai_usage_hours !== null && !isNaN(s.ai_usage_hours)
    );

    if (validStudents.length < 2) return 0;

    const x = validStudents.map(s => s.ai_usage_hours);
    const y = validStudents.map(s => s.gpa);
    const n = x.length;
    const avgX = x.reduce((a, b) => a + b) / n;
    const avgY = y.reduce((a, b) => a + b) / n;

    const numerator = x.map((v, i) => (v - avgX) * (y[i] - avgY)).reduce((a, b) => a + b);
    const denominator = Math.sqrt(
      x.map(v => (v - avgX) ** 2).reduce((a, b) => a + b) *
      y.map(v => (v - avgY) ** 2).reduce((a, b) => a + b)
    );

    if (denominator === 0) return 0;
    const result = numerator / denominator;
    return isNaN(result) ? 0 : parseFloat(result.toFixed(2));
  }, [filteredStudents]);

  const correlationIndicator = correlation > 0.3
    ? { text: "Positive Learning Impact", color: "#10b981" }
    : correlation < 0
      ? { text: "Negative Impact Risk", color: "#ef4444" }
      : { text: "Minimal Impact", color: "#f59e0b" };

  // Study hours by country
  const studyHoursByCountry = useMemo(() => {
    if (!data) return [];

    const countriesToMap = selectedCountry === 'all'
      ? uniqueCountries
      : [selectedCountry];

    return countriesToMap.map(country => {
      const studentsInCountry = data.students.filter(s => {
        const studentField = s.field_of_study || s.major;
        return s.country === country &&
          (selectedFieldOfStudy === 'all' || studentField === selectedFieldOfStudy);
      });

      const count = studentsInCountry.length;
      const validHours = studentsInCountry.filter(s => s.study_hours_per_week !== null && !isNaN(s.study_hours_per_week));
      const totalHours = validHours.reduce((acc, s) => acc + s.study_hours_per_week, 0);

      return {
        country,
        avgStudyHours: validHours.length > 0 ? (totalHours / validHours.length).toFixed(1) : '0.0'
      };
    });
  }, [data, selectedCountry, selectedFieldOfStudy, uniqueCountries]);

  // Major distribution
  const majorDistribution = useMemo(() => {
    const majors = {};
    filteredStudents.forEach(s => {
      const field = s.field_of_study || s.major;
      if (field) {
        majors[field] = (majors[field] || 0) + 1;
      }
    });
    return majors;
  }, [filteredStudents]);

  // Top AI Tools
  const topAITools = useMemo(() => {
    return Object.entries(aiToolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [aiToolCounts]);

  // Tool Purpose (derived from Major)
  const toolPurposeDistribution = useMemo(() => {
    const purposes = {
      'Research': 0,
      'Coding': 0,
      'Creative': 0,
      'Problem Solving': 0
    };

    filteredStudents.forEach(s => {
      const field = s.field_of_study || s.major || '';
      if (field.includes('Computer Science') || field.includes('Engineering') || field.includes('Data Science')) {
        purposes['Coding']++;
      } else if (field.includes('Arts') || field.includes('Design')) {
        purposes['Creative']++;
      } else if (field.includes('Medicine') || field.includes('Health') || field.includes('Pharmacy')) {
        purposes['Research']++;
      } else {
        purposes['Problem Solving']++;
      }
    });

    return purposes;
  }, [filteredStudents]);

  // Skill Level (derived from Satisfaction Score)
  const avgSkillLevel = useMemo(() => {
    if (totalStudents === 0) return 0;
    const validScores = filteredStudents.filter(s => s.satisfaction_score !== null && !isNaN(s.satisfaction_score));
    if (validScores.length === 0) return 0;
    const totalScore = validScores.reduce((acc, s) => acc + s.satisfaction_score, 0);
    return (totalScore / validScores.length).toFixed(1);
  }, [filteredStudents, totalStudents]);

  // Clear filters
  const clearFilters = () => {
    setSelectedCountry('all');
    setSelectedFieldOfStudy('all');
  };

  const hasActiveFilters = selectedCountry !== 'all' || selectedFieldOfStudy !== 'all';

  // Map data
  const countryNames = !countrySummaries ? [] : (selectedCountry === 'all' ? countrySummaries : filteredCountrySummary).map(c => c.country);
  const mapMetricValues = !countrySummaries ? [] : (selectedCountry === 'all' ? countrySummaries : filteredCountrySummary).map(c => c[mapMetric]);

  const metricLabels = {
    avg_gpa: 'Average GPA',
    avg_ai_usage: 'Avg AI Usage (Hours)',
    student_count: 'Student Count'
  };

  // Generate dynamic insights
  const insights = useMemo(() => {
    const insights = [];

    try {
      // Correlation insight
      if (correlation > 0.3) {
        insights.push(`Strong positive correlation (${correlation}) between AI usage and GPA suggests AI tools are effectively supporting student learning.`);
      } else if (correlation < -0.1) {
        insights.push(`Negative correlation (${correlation}) between AI usage and GPA may indicate over-reliance or misuse of AI tools.`);
      } else {
        insights.push(`Weak correlation (${correlation}) between AI usage and GPA suggests other factors may be more influential in academic performance.`);
      }

      // Country-specific insights
      if (selectedCountry === 'all' && countrySummaries && Array.isArray(countrySummaries) && countrySummaries.length > 0) {
        const countriesWithGPA = countrySummaries.filter(c => c.avg_gpa !== null && !isNaN(c.avg_gpa));
        if (countriesWithGPA.length > 0) {
          const highestGPA = countriesWithGPA.reduce((max, c) => c.avg_gpa > max.avg_gpa ? c : max);
          const lowestGPA = countriesWithGPA.reduce((min, c) => c.avg_gpa < min.avg_gpa ? c : min);
          insights.push(`${highestGPA.country} leads with the highest average GPA (${highestGPA.avg_gpa.toFixed(2)}), while ${lowestGPA.country} has the lowest (${lowestGPA.avg_gpa.toFixed(2)}).`);
        }

        const countriesWithAI = countrySummaries.filter(c => c.avg_ai_usage_hours !== null && !isNaN(c.avg_ai_usage_hours));
        if (countriesWithAI.length > 0) {
          const highestAI = countriesWithAI.reduce((max, c) => c.avg_ai_usage_hours > max.avg_ai_usage_hours ? c : max);
          insights.push(`${highestAI.country} shows the highest AI usage (${highestAI.avg_ai_usage_hours.toFixed(1)} hrs/week), indicating strong technology adoption.`);
        }
      }

      // AI tool insight
      if (mostPopularTool !== 'N/A' && aiToolCounts[mostPopularTool] && totalStudents > 0) {
        insights.push(`${mostPopularTool} is the most popular AI tool, used by ${aiToolCounts[mostPopularTool]} students (${((aiToolCounts[mostPopularTool] / totalStudents) * 100).toFixed(1)}% of ${selectedCountry === 'all' ? 'all' : selectedCountry} students).`);
      }

      // Overall AI adoption
      if (totalStudents > 0) {
        insights.push(`${aiUsagePercentage}% of students actively use AI tools in their studies.`);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      // Don't push error message to insights array
    }

    return insights;
  }, [correlation, selectedCountry, data, mostPopularTool, aiToolCounts, totalStudents, aiUsagePercentage]);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Handle loading and null data states
  if (loading || !data) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ pb: 5 }}>
      {/* ✨ Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Overview Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive summary of AI impact on education across all regions
        </Typography>
      </Box>

      {/* 🎯 Interactive Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.05)',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Country/Region</InputLabel>
            <Select
              value={selectedCountry}
              label="Country/Region"
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
            <InputLabel>Field of Study</InputLabel>
            <Select
              value={selectedFieldOfStudy}
              label="Field of Study"
              onChange={(e) => setSelectedFieldOfStudy(e.target.value)}
              sx={{ transition: 'all 0.3s ease' }}
            >
              <MenuItem value="all">All Fields</MenuItem>
              {uniqueFieldsOfStudy.map(field => (
                <MenuItem key={field} value={field}>{field}</MenuItem>
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

          {/* Active Filter Chip */}
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
            {selectedFieldOfStudy !== 'all' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Chip
                  label={`Field: ${selectedFieldOfStudy}`}
                  onDelete={() => setSelectedFieldOfStudy('all')}
                  color="primary"
                  variant="outlined"
                />
              </motion.div>
            )}
          </Box>
        </Box>

        {/* Results Count */}
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Showing {totalStudents} of {data.students.length} students
        </Typography>
      </Paper>

      {/* 📊 Key Metrics / Summary Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCountry}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Total Students" value={totalStudents} icon={Users} trend="up" trendValue="+12%" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Avg. GPA" value={avgGpa} icon={GraduationCap} trend="up" trendValue="+0.2" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Avg. AI Usage (Hrs)" value={avgAiUsage} icon={Brain} trend="up" trendValue="+2.5" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Study Hours/Week" value={avgStudyHours} icon={BookOpen} trend="down" trendValue="-1.2" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Most Popular Tool" value={mostPopularTool} icon={Award} />
            </Grid>
          </Grid>
        </motion.div>
      </AnimatePresence>

      {/* 📈 Correlation Indicator */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={`AI–GPA Correlation: ${correlation} (${correlationIndicator.text})`}
          sx={{
            p: 2,
            fontSize: '16px',
            borderRadius: 2,
            backgroundColor: correlationIndicator.color,
            color: '#fff'
          }}
        />
      </Box>

      {/* 📊 Global Trends / Mini Charts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`charts-${selectedCountry}`}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Grid container spacing={3} sx={{ mb: 4, display: 'flex', flexWrap: 'wrap' }}>
            {/* GPA vs AI Usage Scatter */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flex: 1 }}>
              <Paper sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.08)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.03) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                  GPA vs AI Usage
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Plot
                    data={[{
                      x: filteredStudents.map(s => s.ai_usage_hours),
                      y: filteredStudents.map(s => s.gpa),
                      mode: 'markers',
                      type: 'scatter',
                      marker: {
                        size: 8,
                        color: theme.palette.primary.main,
                        opacity: 0.7
                      }
                    }]}
                    layout={{
                      autosize: true,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: theme.palette.text.secondary, size: 10 },
                      xaxis: {
                        title: { text: 'AI Usage (Hrs)', font: { size: 10 } },
                        gridcolor: 'rgba(255,255,255,0.1)',
                        zerolinecolor: 'rgba(255,255,255,0.1)'
                      },
                      yaxis: {
                        title: { text: 'GPA', font: { size: 10 } },
                        gridcolor: 'rgba(255,255,255,0.1)',
                        zerolinecolor: 'rgba(255,255,255,0.1)',
                        range: [0, 4.2]
                      },
                      margin: { t: 10, r: 20, l: 40, b: 40 },
                      showlegend: false
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Study Hours by Country */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flex: 1 }}>
              <Paper sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.08)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.03) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                  Study Hours by Region
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Plot
                    data={[{
                      x: studyHoursByCountry.map(c => c.country),
                      y: studyHoursByCountry.map(c => parseFloat(c.avgStudyHours)),
                      type: 'bar',
                      marker: {
                        color: '#10b981'
                      }
                    }]}
                    layout={{
                      autosize: true,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: theme.palette.text.secondary, size: 10 },
                      xaxis: {
                        title: { text: 'Country', font: { size: 10 } },
                        gridcolor: 'rgba(255,255,255,0.1)'
                      },
                      yaxis: {
                        title: { text: 'Avg Hours', font: { size: 10 } },
                        gridcolor: 'rgba(255,255,255,0.1)'
                      },
                      margin: { t: 10, r: 20, l: 40, b: 60 }
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Major Distribution */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flex: 1 }}>
              <Paper sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.08)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(236, 72, 153, 0.03) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                  Major Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Plot
                    data={[{
                      labels: Object.keys(majorDistribution),
                      values: Object.values(majorDistribution),
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
                      },
                      textinfo: "label+percent",
                      textfont: { size: 9 }
                    }]}
                    layout={{
                      autosize: true,
                      paper_bgcolor: 'transparent',
                      font: { color: theme.palette.text.secondary },
                      showlegend: false,
                      margin: { t: 10, r: 10, l: 10, b: 10 }
                    }}
                    useResizeHandler
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </AnimatePresence>

      {/* 🤖 AI Usage Snapshot */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ai-snapshot-${selectedCountry}`}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}> AI Usage Snapshot </Typography>

            {/* Row 1: 3 equal cards */}
            <Grid container spacing={3} sx={{ mb: 3, display: 'flex', flexWrap: 'wrap' }}>
              {/* Top AI Tools (Vertical Bar) */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.03) 100%)`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Top AI Tools Usage
                  </Typography>
                  <Box sx={{ height: 260 }}>
                    <Plot
                      data={[{
                        x: topAITools.map(t => t[0]),
                        y: topAITools.map(t => t[1]),
                        type: 'bar',
                        marker: {
                          color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].slice(0, topAITools.length)
                        },
                        text: topAITools.map(t => `${t[1]}`),
                        textposition: 'outside'
                      }]}
                      layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: theme.palette.text.secondary },
                        margin: { t: 20, r: 20, l: 40, b: 60 },
                        xaxis: { tickangle: -45 },
                        yaxis: { title: 'Students' }
                      }}
                      useResizeHandler
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Tool Purpose (Donut Chart) */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(139, 92, 246, 0.03) 100%)`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                    Tool Purpose
                  </Typography>
                  <Box sx={{ height: 260 }}>
                    <Plot
                      data={[{
                        labels: Object.keys(toolPurposeDistribution),
                        values: Object.values(toolPurposeDistribution),
                        type: 'pie',
                        hole: 0.55,
                        marker: {
                          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981']
                        },
                        textinfo: "label+percent",
                        textfont: { size: 11 },
                        showlegend: false
                      }]}
                      layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: theme.palette.text.secondary },
                        margin: { t: 10, r: 10, l: 10, b: 30 },
                        showlegend: false
                      }}
                      useResizeHandler
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Skill Level (Gauge) */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.03) 100%)`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                    Skill Level (Satisfaction Score)
                  </Typography>
                  <Box sx={{ height: 260 }}>
                    <Plot
                      data={[{
                        type: "indicator",
                        mode: "gauge+number",
                        value: parseFloat(avgSkillLevel),
                        title: { text: "Score (0-10)", font: { size: 12 } },
                        gauge: {
                          axis: { range: [0, 10], tickwidth: 1, tickcolor: theme.palette.text.secondary },
                          bar: { color: theme.palette.primary.main },
                          bgcolor: "transparent",
                          borderwidth: 2,
                          bordercolor: "rgba(255,255,255,0.1)",
                          steps: [
                            { range: [0, 4], color: "rgba(239, 68, 68, 0.2)" },
                            { range: [4, 7], color: "rgba(245, 158, 11, 0.2)" },
                            { range: [7, 10], color: "rgba(16, 185, 129, 0.2)" }
                          ],
                        }
                      }]}
                      layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: theme.palette.text.secondary },
                        margin: { t: 30, r: 30, l: 30, b: 30 }
                      }}
                      useResizeHandler
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Row 2: 2 equal cards */}
            <Grid container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {/* Usage Access (KPI %) */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: 320,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.05) 100%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
                }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    mb: 2
                  }}>
                    <Users size={32} color="#6366f1" />
                  </Box>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    {aiUsagePercentage}%
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 500, mt: 1 }} color="text.secondary">
                    Usage Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Students actively using AI tools
                  </Typography>
                </Paper>
              </Grid>

              {/* Time Spent (KPI + Trend) */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: 320,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.05) 100%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
                }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {avgAiUsage}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 500, mt: 1 }} color="text.secondary">
                    Avg Hours / Week
                  </Typography>
                  {/* Sparkline Trend */}
                  <Box sx={{ width: '80%', height: 60, mt: 2 }}>
                    <Plot
                      data={[{
                        y: [2, 3, 5, 4, 6, 5, 7, parseFloat(avgAiUsage)],
                        type: 'scatter',
                        mode: 'lines',
                        line: { color: '#10b981', width: 2.5, shape: 'spline' },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(16, 185, 129, 0.15)'
                      }]}
                      layout={{
                        autosize: true,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        margin: { t: 0, r: 0, l: 0, b: 0 },
                        xaxis: { showgrid: false, zeroline: false, showticklabels: false },
                        yaxis: { showgrid: false, zeroline: false, showticklabels: false }
                      }}
                      useResizeHandler
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </AnimatePresence>

      {/* 💡 Insights / Interpretation Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`insights-${selectedCountry}`}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{
            p: 4,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.05)',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <TrendingUp size={28} color={theme.palette.primary.main} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Key Insights & Interpretations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {insights.map((insight, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    • {insight}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
