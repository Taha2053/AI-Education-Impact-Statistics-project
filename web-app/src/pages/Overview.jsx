import React, { useMemo, useState } from 'react';
import { Typography, Grid, Box, useTheme, Chip, Paper, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Users, Brain, BookOpen, GraduationCap, TrendingUp, Award, X, Lightbulb, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';

export default function Overview() {
  const { data, loading } = useData();
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
    const majors = new Set(data.students.map(s => s.major));
    return Array.from(majors).sort();
  }, [data]);

  // Filter students based on selected country
  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.students.filter(s => {
      const countryMatch = selectedCountry === 'all' || s.country === selectedCountry;
      const majorMatch = selectedFieldOfStudy === 'all' || s.major === selectedFieldOfStudy;
      return countryMatch && majorMatch;
    });
  }, [data, selectedCountry, selectedFieldOfStudy]);

  // Filter country summary based on selected country
  const filteredCountrySummary = useMemo(() => {
    if (!data) return [];
    if (selectedCountry === 'all') return data.country_summary;
    return data.country_summary.filter(c => c.country === selectedCountry);
  }, [data, selectedCountry]);

  // Calculate key metrics
  const totalStudents = filteredStudents.length;
  const avgGpa = totalStudents > 0 ? (filteredStudents.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(2) : '0.00';
  const avgAiUsage = totalStudents > 0 ? (filteredStudents.reduce((acc, s) => acc + s.ai_usage_hours, 0) / totalStudents).toFixed(1) : '0.0';
  const avgStudyHours = totalStudents > 0 ? (filteredStudents.reduce((acc, s) => acc + s.study_hours_per_week, 0) / totalStudents).toFixed(1) : '0.0';

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
    const x = filteredStudents.map(s => s.ai_usage_hours);
    const y = filteredStudents.map(s => s.gpa);
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
      const studentsInCountry = data.students.filter(s =>
        s.country === country &&
        (selectedFieldOfStudy === 'all' || s.major === selectedFieldOfStudy)
      );

      const count = studentsInCountry.length;
      const totalHours = studentsInCountry.reduce((acc, s) => acc + s.study_hours_per_week, 0);

      return {
        country,
        avgStudyHours: count > 0 ? (totalHours / count).toFixed(1) : '0.0'
      };
    });
  }, [data, selectedCountry, selectedFieldOfStudy, uniqueCountries]);

  // Major distribution
  const majorDistribution = useMemo(() => {
    const majors = {};
    filteredStudents.forEach(s => {
      majors[s.major] = (majors[s.major] || 0) + 1;
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
      if (s.major === 'Computer Science' || s.major === 'Engineering') {
        purposes['Coding']++;
      } else if (s.major === 'Arts') {
        purposes['Creative']++;
      } else if (s.major === 'Medicine') {
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
    const totalScore = filteredStudents.reduce((acc, s) => acc + s.satisfaction_score, 0);
    return (totalScore / totalStudents).toFixed(1);
  }, [filteredStudents, totalStudents]);

  // Clear filters
  const clearFilters = () => {
    setSelectedCountry('all');
    setSelectedFieldOfStudy('all');
  };

  const hasActiveFilters = selectedCountry !== 'all' || selectedFieldOfStudy !== 'all';

  // Map data
  const countryNames = !data ? [] : (selectedCountry === 'all' ? data.country_summary : filteredCountrySummary).map(c => c.country);
  const mapMetricValues = !data ? [] : (selectedCountry === 'all' ? data.country_summary : filteredCountrySummary).map(c => c[mapMetric]);

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
      if (selectedCountry === 'all' && data.country_summary.length > 0) {
        const highestGPA = data.country_summary.reduce((max, c) => c.avg_gpa > max.avg_gpa ? c : max);
        const lowestGPA = data.country_summary.reduce((min, c) => c.avg_gpa < min.avg_gpa ? c : min);
        insights.push(`${highestGPA.country} leads with the highest average GPA (${highestGPA.avg_gpa.toFixed(2)}), while ${lowestGPA.country} has the lowest (${lowestGPA.avg_gpa.toFixed(2)}).`);

        const highestAI = data.country_summary.reduce((max, c) => c.avg_ai_usage > max.avg_ai_usage ? c : max);
        insights.push(`${highestAI.country} shows the highest AI usage (${highestAI.avg_ai_usage.toFixed(1)} hrs/week), indicating strong technology adoption.`);
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
      insights.push('Unable to generate insights at this time. Please try refreshing the page.');
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
      <Box sx={{
        mb: 4,
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(236, 72, 153, 0.06) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <LayoutDashboard size={28} color="white" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Overview Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', ml: 7 }}>
            Comprehensive summary of AI impact on education across all regions
          </Typography>
        </Box>
        {/* Decorative gradient orb */}
        <Box sx={{
          position: 'absolute',
          right: -50,
          top: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </Box>

      {/* 🎯 Interactive Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: '1px solid rgba(99, 102, 241, 0.2)',
          background: `linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 50%, ${theme.palette.background.paper} 100%)`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)'
          }
        }}
      >
        {/* Filter Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: 'rgba(99, 102, 241, 0.15)',
            mr: 1.5,
            display: 'flex'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6366f1' }}>
            Filter Data
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ '&.Mui-focused': { color: '#6366f1' } }}>Country/Region</InputLabel>
            <Select
              value={selectedCountry}
              label="Country/Region"
              onChange={(e) => setSelectedCountry(e.target.value)}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(99, 102, 241, 0.5)'
                  }
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1'
                }
              }}
            >
              <MenuItem value="all">All Countries</MenuItem>
              {uniqueCountries.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ '&.Mui-focused': { color: '#8b5cf6' } }}>Field of Study</InputLabel>
            <Select
              value={selectedFieldOfStudy}
              label="Field of Study"
              onChange={(e) => setSelectedFieldOfStudy(e.target.value)}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(139, 92, 246, 0.5)'
                  }
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8b5cf6'
                }
              }}
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
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#ef4444',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}

          {/* Active Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
            {selectedCountry !== 'all' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Chip
                  label={`🌍 ${selectedCountry}`}
                  onDelete={() => setSelectedCountry('all')}
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    color: '#6366f1',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    border: '1px solid',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: '#6366f1',
                      '&:hover': { color: '#4f46e5' }
                    }
                  }}
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
                  label={`📚 ${selectedFieldOfStudy}`}
                  onDelete={() => setSelectedFieldOfStudy('all')}
                  sx={{
                    bgcolor: 'rgba(139, 92, 246, 0.15)',
                    color: '#8b5cf6',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    border: '1px solid',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: '#8b5cf6',
                      '&:hover': { color: '#7c3aed' }
                    }
                  }}
                />
              </motion.div>
            )}
          </Box>
        </Box>

        {/* Results Count */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#10b981',
            animation: 'pulse 2s infinite'
          }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing <span style={{ color: '#10b981', fontWeight: 600 }}>{totalStudents}</span> of {data.students.length} students
          </Typography>
        </Box>
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
          <Grid container spacing={3} sx={{ mb: 4, display: 'flex', flexWrap: 'nowrap' }}>
            <Grid item xs={12} sm={6} md={2.4} sx={{ flex: 1, minWidth: 0 }}>
              <StatCard title="Total Students" value={totalStudents} icon={Users} trend="up" trendValue="+12%" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4} sx={{ flex: 1, minWidth: 0 }}>
              <StatCard title="Avg. GPA" value={avgGpa} icon={GraduationCap} trend="up" trendValue="+0.2" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4} sx={{ flex: 1, minWidth: 0 }}>
              <StatCard title="Avg. AI Usage (Hrs)" value={avgAiUsage} icon={Brain} trend="up" trendValue="+2.5" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4} sx={{ flex: 1, minWidth: 0 }}>
              <StatCard title="Study Hours/Week" value={avgStudyHours} icon={BookOpen} trend="down" trendValue="-1.2" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4} sx={{ flex: 1, minWidth: 0 }}>
              <StatCard title="Most Popular Tool" value={mostPopularTool} icon={Award} />
            </Grid>
          </Grid>
        </motion.div>
      </AnimatePresence>

      {/* 📈 Correlation Indicator */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${correlationIndicator.color}15 0%, ${theme.palette.background.paper} 100%)`,
          border: `1px solid ${correlationIndicator.color}40`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: `0 4px 20px ${correlationIndicator.color}20`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 30px ${correlationIndicator.color}30`
          }
        }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${correlationIndicator.color}20`,
            display: 'flex'
          }}>
            <TrendingUp size={24} color={correlationIndicator.color} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              AI–GPA Correlation
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: correlationIndicator.color }}>
              {correlation} ({correlationIndicator.text})
            </Typography>
          </Box>
        </Paper>
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
                border: '1px solid rgba(99, 102, 241, 0.15)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.05) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
                    <TrendingUp size={20} color="#6366f1" />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    GPA vs AI Usage
                  </Typography>
                </Box>
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
                border: '1px solid rgba(16, 185, 129, 0.15)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.05) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                    <BookOpen size={20} color="#10b981" />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Study Hours by Region
                  </Typography>
                </Box>
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
                border: '1px solid rgba(236, 72, 153, 0.15)',
                height: '100%',
                width: '100%',
                minHeight: 380,
                transition: 'all 0.3s ease',
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(236, 72, 153, 0.05) 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.25)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(236, 72, 153, 0.1)' }}>
                    <GraduationCap size={20} color="#ec4899" />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Major Distribution
                  </Typography>
                </Box>
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
            p: 4,
            mb: 4,
            borderRadius: 4,
            border: '1px solid rgba(99, 102, 241, 0.15)',
            background: `linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, ${theme.palette.background.paper} 100%)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
                display: 'flex'
              }}>
                <Brain size={24} color="#6366f1" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                AI Usage Snapshot
              </Typography>
            </Box>

            {/* Row 1: 3 equal cards */}
            <Grid container spacing={3} sx={{ mb: 3, display: 'flex', flexWrap: 'wrap' }}>
              {/* Top AI Tools (Vertical Bar) */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flex: 1 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.05) 100%)`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
                      <Award size={20} color="#6366f1" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Top AI Tools Usage
                    </Typography>
                  </Box>
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
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(139, 92, 246, 0.05) 100%)`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.25)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
                      <Brain size={20} color="#8b5cf6" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Tool Purpose
                    </Typography>
                  </Box>
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
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  height: 320,
                  width: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.05) 100%)`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                      <TrendingUp size={20} color="#10b981" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Skill Level (Satisfaction Score)
                    </Typography>
                  </Box>
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
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  height: 320,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(99, 102, 241, 0.05) 100%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }
                }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    mb: 2,
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
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
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  height: 320,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(16, 185, 129, 0.05) 100%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }
                }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    mb: 2,
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                  }}>
                    <TrendingUp size={32} color="#10b981" />
                  </Box>
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
            border: '1px solid rgba(245, 158, 11, 0.15)',
            background: `linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, ${theme.palette.background.paper} 100%)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)',
                display: 'flex'
              }}>
                <Lightbulb size={24} color="#f59e0b" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                Key Insights & Interpretations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {insights.map((insight, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    gap: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(245, 158, 11, 0.05)',
                      borderColor: 'rgba(245, 158, 11, 0.2)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{
                    minWidth: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#f59e0b',
                    mt: 1
                  }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {insight}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box >
  );
}
