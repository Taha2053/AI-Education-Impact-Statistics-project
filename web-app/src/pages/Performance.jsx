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
  Card,
  CardContent,
  Collapse,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import regression from 'regression';

// Constants
const OUTLIER_THRESHOLD = { MIN_GPA: 2.9, MAX_GPA: 3.8 };
const MARKER_SIZE = { DEFAULT: 8, OUTLIER: 10 };
const GPA_RANGE = [0, 4.2];
const OPTIMAL_USAGE_ZONE = { MIN: 8, MAX: 12 };

// Neon Palette for Dark Theme (Updated for new countries)
const COUNTRY_COLORS = {
  Tunisia: '#60a5fa',    // Blue
  Bangladesh: '#34d399', // Green
  Egypt: '#f87171',     // Red
  India: '#c084fc',     // Purple
  Global: '#f59e0b'     // Orange
};




const calculateCorrelation = (x, y) => {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};

const calculateRSquared = (actual, predicted) => {
  if (actual.length === 0) return 0;
  const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
  const ssTotal = actual.reduce((sum, y) => sum + Math.pow(y - meanActual, 2), 0);
  const ssResidual = actual.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);
  return ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;
};

const identifyOutliers = (students) => {
  return students.filter((s) => {
    if (s.gpa === null || s.gpa === undefined || isNaN(s.gpa)) return false;
    return s.gpa < OUTLIER_THRESHOLD.MIN_GPA || s.gpa > OUTLIER_THRESHOLD.MAX_GPA;
  });
};

const createTooltip = (student) => {
  const gpa = student.gpa !== null && !isNaN(student.gpa) ? student.gpa.toFixed(2) : 'N/A';
  const studyHours = student.study_hours_per_week || 'N/A';
  const major = student.field_of_study || student.major || 'N/A';
  const aiTool = student.ai_tool || 'N/A';

  return `<b>GPA:</b> ${gpa}<br>` +
    `<b>AI Usage:</b> ${student.ai_usage_hours}h/week<br>` +
    `<b>Major:</b> ${major}<br>` +
    `<b>Study Hours:</b> ${studyHours}h/week<br>` +
    `<b>AI Tool:</b> ${aiTool}<br>` +
    `<b>Country:</b> ${student.country}`;
};

const getCorrelationInterpretation = (corr) => {
  const abs = Math.abs(corr);
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Very Weak';
};

const getInsightMessage = (stats) => {
  const { correlation, avgAIUsage, avgGPA } = stats;
  if (avgAIUsage >= OPTIMAL_USAGE_ZONE.MIN && avgAIUsage <= OPTIMAL_USAGE_ZONE.MAX) {
    return {
      type: 'success',
      message: `📈 Optimal Usage Zone: Students in this view average ${avgAIUsage.toFixed(1)} hrs/week AI usage with ${avgGPA.toFixed(2)} GPA, suggesting effective AI integration.`
    };
  } else if (avgAIUsage > 15) {
    return {
      type: 'warning',
      message: `⚠️ High Usage Alert: Average AI usage (${avgAIUsage.toFixed(1)} hrs/week) exceeds recommended levels. Monitor for potential over-reliance.`
    };
  } else if (correlation < 0.2) {
    return {
      type: 'info',
      message: `ℹ️ Weak correlation (${correlation.toFixed(3)}) suggests AI usage is not a primary predictor of GPA in this subset. Other factors may be more influential.`
    };
  }
  return null;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function Performance() {
  const { data, loading, error } = useData();
  const theme = useTheme();

  // State management
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [selectedAITool, setSelectedAITool] = useState('All');
  const [showMethodology, setShowMethodology] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  // Memoized filter options
  const { countries, majors, aiTools } = useMemo(() => {
    if (!data?.students) return { countries: [], majors: [], aiTools: [] };
    return {
      countries: [...new Set(data.students.map((s) => s.country).filter(Boolean))].sort(),
      majors: [...new Set(data.students.map((s) => s.field_of_study || s.major).filter(Boolean))].sort(),
      aiTools: [...new Set(data.students.map((s) => s.ai_tool).filter(Boolean))].sort(),
    };
  }, [data]);

  // Memoized filtered students
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((s) => {
      const countryMatch = selectedCountry === 'All' || s.country === selectedCountry;
      const studentField = s.field_of_study || s.major;
      const majorMatch = selectedMajor === 'All' || studentField === selectedMajor;
      const toolMatch = selectedAITool === 'All' || s.ai_tool === selectedAITool;
      return countryMatch && majorMatch && toolMatch;
    });
  }, [data, selectedCountry, selectedMajor, selectedAITool]);

  // Memoized statistics
  const statistics = useMemo(() => {
    if (filteredStudents.length === 0) {
      return { correlation: 0, rSquared: 0, avgGPA: 0, avgAIUsage: 0, sampleSize: 0 };
    }

    // Filter out students with null GPA or AI usage
    const validStudents = filteredStudents.filter(s =>
      s.gpa !== null && s.gpa !== undefined && !isNaN(s.gpa) &&
      s.ai_usage_hours !== null && !isNaN(s.ai_usage_hours)
    );

    if (validStudents.length === 0) {
      return { correlation: 0, rSquared: 0, avgGPA: 0, avgAIUsage: 0, sampleSize: 0 };
    }

    const x = validStudents.map((s) => s.ai_usage_hours);
    const y = validStudents.map((s) => s.gpa);
    const correlation = calculateCorrelation(x, y);
    const regressionResult = regression.linear(x.map((xi, i) => [xi, y[i]]));
    const predicted = x.map((xi) => regressionResult.predict(xi)[1]);
    const rSquared = calculateRSquared(y, predicted);
    const avgGPA = y.reduce((a, b) => a + b, 0) / y.length;
    const avgAIUsage = x.reduce((a, b) => a + b, 0) / x.length;
    return { correlation, rSquared, avgGPA, avgAIUsage, sampleSize: validStudents.length };
  }, [filteredStudents]);

  // Memoized plot traces
  const plotTraces = useMemo(() => {
    if (filteredStudents.length === 0) return [];
    const traces = [];
    const countriesToDisplay = selectedCountry === 'All' ? countries : [selectedCountry];

    countriesToDisplay.forEach((country) => {
      const countryStudents = filteredStudents.filter((s) => s.country === country);
      if (countryStudents.length === 0) return;
      const x = countryStudents.map((s) => s.ai_usage_hours);
      const y = countryStudents.map((s) => s.gpa);

      // Scatter plot with color-blind friendly colors
      traces.push({
        x, y,
        mode: 'markers',
        type: 'scatter',
        name: country,
        text: countryStudents.map(createTooltip),
        hovertemplate: '%{text}<extra></extra>',
        marker: {
          size: MARKER_SIZE.DEFAULT,
          opacity: 0.6,
          color: COUNTRY_COLORS[country] || '#888888',
          line: { width: 1, color: 'rgba(255,255,255,0.3)' }
        },
      });

      // Trend line
      if (countryStudents.length > 1) {
        const regressionResult = regression.linear(x.map((xi, i) => [xi, y[i]]));
        const minX = Math.min(...x);
        const maxX = Math.max(...x);
        traces.push({
          x: [minX, maxX],
          y: [minX, maxX].map((xi) => regressionResult.predict(xi)[1]),
          mode: 'lines',
          type: 'scatter',
          name: `${country} Trend`,
          line: {
            dash: 'dash',
            width: 3,
            color: COUNTRY_COLORS[country] || '#888888'
          },
          hoverinfo: 'skip',
          showlegend: false,
        });
      }
    });

    // Add optimal usage zone annotation (visual rectangle)
    traces.push({
      x: [OPTIMAL_USAGE_ZONE.MIN, OPTIMAL_USAGE_ZONE.MAX, OPTIMAL_USAGE_ZONE.MAX, OPTIMAL_USAGE_ZONE.MIN, OPTIMAL_USAGE_ZONE.MIN],
      y: [3.5, 3.5, 4.0, 4.0, 3.5],
      fill: 'toself',
      fillcolor: 'rgba(67, 226, 123, 0.1)',
      line: { color: 'rgba(67, 226, 123, 0.3)', width: 1, dash: 'dot' },
      mode: 'lines',
      name: 'Optimal Zone',
      hoverinfo: 'name',
      showlegend: true,
    });

    // Add outliers
    const outliers = identifyOutliers(filteredStudents);
    if (outliers.length > 0) {
      traces.push({
        x: outliers.map((s) => s.ai_usage_hours),
        y: outliers.map((s) => s.gpa),
        mode: 'markers',
        type: 'scatter',
        name: 'Outliers',
        marker: {
          color: '#ef4444',
          size: MARKER_SIZE.OUTLIER,
          symbol: 'x',
          line: { width: 2, color: '#ef4444' }
        },
        text: outliers.map(createTooltip),
        hovertemplate: '<b>⚠ OUTLIER</b><br>%{text}<extra></extra>',
      });
    }

    return traces;
  }, [filteredStudents, selectedCountry, countries]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0e27' }}>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>Loading performance data...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0e27' }}>
        <Typography variant="h6" sx={{ color: '#ef4444' }}>Error loading data. Please try again.</Typography>
      </Box>
    );
  }

  const insightMessage = getInsightMessage(statistics);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Phase 1: Digital Wave Background (Reference Style) */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, background: '#020617', overflow: 'hidden' }}>

        {/* Deep Gradient Overlay */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 60%)', opacity: 0.6 }} />

        {/* Animated Waves Container */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50vh', display: 'flex', alignItems: 'flex-end', opacity: 0.8 }}>

          {/* Wave 1 - Cyan/Blue */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              scaleY: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', bottom: -50, left: 0, right: 0, height: '300px', background: 'linear-gradient(180deg, rgba(6,182,212,0) 0%, rgba(6,182,212,0.1) 100%)', filter: 'blur(20px)', zIndex: 1 }}
          />
          <svg viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, width: '100%', height: 'auto', zIndex: 2 }}>
            <motion.path
              fill="url(#grad1)"
              d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.4)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'rgba(147, 51, 234, 0.4)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(6, 182, 212, 0.4)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>

          {/* Wave 2 - Purple/Pink (Overlay) */}
          <svg viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, width: '100%', height: 'auto', zIndex: 3, opacity: 0.7 }}>
            <motion.path
              fill="url(#grad2)"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,250.7C672,245,768,203,864,192C960,181,1056,203,1152,218.7C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(124, 58, 237, 0.3)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'rgba(236, 72, 153, 0.3)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </Box>

        {/* Particles/Stars Effect */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 10px rgba(255,255,255,0.8)'
              }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Content Container */}
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{ position: 'relative', zIndex: 1, p: 3, maxWidth: '1600px', mx: 'auto' }}
      >
        {/* Phase 1: Header Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #22d3ee 0%, #c084fc 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              color: 'white',
              textShadow: '0 0 30px rgba(192, 132, 252, 0.3)',
              letterSpacing: '-0.02em'
            }}>
              Performance Analysis
            </Typography>
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}>
              Examining the Correlation Between AI Tool Adoption and Student Academic Achievement
            </Typography>
          </Box>
        </motion.div>

        {/* Phase 3: Methodology Panel */}
        <MotionPaper variants={itemVariants} sx={{
          mb: 4,
          p: 3,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowMethodology(!showMethodology)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, borderRadius: '50%', background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}>
                <Typography sx={{ fontSize: '1.2rem' }}>ℹ️</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', letterSpacing: '0.02em' }}>Methodology & Data Information</Typography>
            </Box>
            <Typography sx={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', transition: 'transform 0.3s', transform: showMethodology ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</Typography>
          </Box>
          <Collapse in={showMethodology}>
            <Box sx={{ mt: 3, pl: 2, borderLeft: '2px solid rgba(34, 211, 238, 0.3)', ml: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}><strong>Data Collection:</strong> Self-reported survey data from students across four countries</Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}><strong>Metrics:</strong> AI Usage (hours/week), GPA (0.0-4.0 scale), Major, Study Hours</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}><strong>Statistical Methods:</strong> Pearson correlation coefficient, Linear regression</Typography>
                  <Typography variant="body2" sx={{ color: '#fbbf24' }}><strong>⚠ Important:</strong> Correlation does not imply causation</Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </MotionPaper>

        {/* Phase 3: Filters */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {['Country', 'Major', 'AI Tool'].map((label, index) => (
              <Grid item xs={12} sm={4} key={label}>
                <FormControl fullWidth sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(5px)',
                    borderRadius: 3,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#22d3ee' }
                  }
                }}>
                  <InputLabel>{label}</InputLabel>
                  <Select
                    value={label === 'Country' ? selectedCountry : label === 'Major' ? selectedMajor : selectedAITool}
                    label={label}
                    onChange={(e) => {
                      if (label === 'Country') setSelectedCountry(e.target.value);
                      else if (label === 'Major') setSelectedMajor(e.target.value);
                      else setSelectedAITool(e.target.value);
                    }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white' } } }}
                  >
                    <MenuItem value="All">All {label === 'Country' ? 'Countries' : label === 'Major' ? 'Majors' : 'Tools'}</MenuItem>
                    {(label === 'Country' ? countries : label === 'Major' ? majors : aiTools).map((item) => (
                      <MenuItem key={item} value={item} sx={{ '&:hover': { bgcolor: 'rgba(34, 211, 238, 0.1)' } }}>{item}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Phase 3: Active Filters */}
        {(selectedCountry !== 'All' || selectedMajor !== 'All' || selectedAITool !== 'All') && (
          <motion.div variants={itemVariants}>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ alignSelf: 'center', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Active Filters:</Typography>
              {selectedCountry !== 'All' && <Chip label={`Country: ${selectedCountry}`} onDelete={() => setSelectedCountry('All')} size="small" sx={{ bgcolor: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.3)' }} />}
              {selectedMajor !== 'All' && <Chip label={`Major: ${selectedMajor}`} onDelete={() => setSelectedMajor('All')} size="small" sx={{ bgcolor: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)' }} />}
              {selectedAITool !== 'All' && <Chip label={`AI Tool: ${selectedAITool}`} onDelete={() => setSelectedAITool('All')} size="small" sx={{ bgcolor: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.3)' }} />}
            </Stack>
          </motion.div>
        )}

        {/* Phase 3: Insight Alert */}
        {showInsights && insightMessage && (
          <motion.div variants={itemVariants}>
            <Alert severity={insightMessage.type} onClose={() => setShowInsights(false)} sx={{
              mb: 4,
              bgcolor: 'rgba(255,255,255,0.03)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': { color: insightMessage.type === 'success' ? '#4ade80' : insightMessage.type === 'warning' ? '#fbbf24' : '#60a5fa' }
            }}>
              {insightMessage.message}
            </Alert>
          </motion.div>
        )}

        {/* Phase 3: Statistics Cards (Glassmorphism) */}
        <motion.div variants={containerVariants}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: 'Correlation', value: statistics.correlation.toFixed(3), subtitle: `${getCorrelationInterpretation(statistics.correlation)} ${statistics.correlation >= 0 ? 'Positive' : 'Negative'}`, color: '#818cf8' },
              { label: 'R² Score', value: statistics.rSquared.toFixed(3), subtitle: `${(statistics.rSquared * 100).toFixed(1)}% variance explained`, color: '#f472b6' },
              { label: 'Avg GPA', value: statistics.avgGPA.toFixed(2), subtitle: 'Out of 4.0', color: '#22d3ee' },
              { label: 'Avg AI Usage', value: `${statistics.avgAIUsage.toFixed(1)}h`, subtitle: 'Per week', color: '#34d399' },
              { label: 'Sample Size', value: statistics.sampleSize, subtitle: 'Students', color: '#fbbf24' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <MotionCard variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderTop: `3px solid ${stat.color}`,
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.06)',
                      boxShadow: `0 0 20px ${stat.color}30`
                    }
                  }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 1, color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5, color: 'white' }}>{stat.subtitle}</Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Phase 4: Main Visualization */}
        <MotionPaper variants={itemVariants} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', height: '650px', background: 'rgba(255,255,255,0.02)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'white' }}>
            GPA vs AI Usage Correlation
          </Typography>
          <Plot
            data={plotTraces}
            layout={{
              autosize: true,
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: 'rgba(255,255,255,0.7)', family: 'Inter, sans-serif' },
              xaxis: {
                title: { text: 'AI Usage (Hours/Week)', font: { size: 14, weight: 600, color: 'white' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                zerolinecolor: 'rgba(255,255,255,0.1)',
                tickfont: { color: 'rgba(255,255,255,0.7)' }
              },
              yaxis: {
                title: { text: 'GPA (Grade Point Average)', font: { size: 14, weight: 600, color: 'white' } },
                gridcolor: 'rgba(255,255,255,0.1)',
                zerolinecolor: 'rgba(255,255,255,0.1)',
                range: GPA_RANGE,
                tickfont: { color: 'rgba(255,255,255,0.7)' }
              },
              hovermode: 'closest',
              legend: {
                orientation: 'h',
                y: -0.15,
                x: 0.5,
                xanchor: 'center',
                bgcolor: 'rgba(0,0,0,0.5)',
                bordercolor: 'rgba(255,255,255,0.2)',
                borderwidth: 1,
                font: { color: 'white' }
              },
              margin: { t: 20, b: 100, l: 70, r: 20 },
              annotations: [
                {
                  x: 10,
                  y: 3.75,
                  text: '🎯 Optimal Zone<br>8-12 hrs/week',
                  showarrow: false,
                  font: { size: 11, color: '#43e97b' },
                  bgcolor: 'rgba(0,0,0,0.6)',
                  borderpad: 4
                }
              ],
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            config={{
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'performance_analysis',
                height: 800,
                width: 1200,
                scale: 2
              }
            }}
          />
        </MotionPaper>

        <motion.div variants={itemVariants}>
          <Box sx={{
            mt: 3,
            p: 3,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', lineHeight: 1.6 }}>
              <strong>Note:</strong> The shaded area represents the "Optimal Usage Zone" (8-12 hours/week) where students typically achieve the highest GPAs with effective AI integration.
              Outliers (marked with ✕) indicate students who significantly deviate from expected patterns.
            </Typography>
          </Box>
        </motion.div>

      </MotionBox>
    </Box>
  );
}
