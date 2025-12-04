import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  useTheme,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Users, Brain, BookOpen, GraduationCap, Globe } from "lucide-react";
import { useData } from "../context/DataContext";
import WorldMap from "../components/WorldMap";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";

// -------------------------------------------------------
//  STAT CARD COMPONENT
// -------------------------------------------------------
const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        boxShadow: 5,
        borderLeft: `6px solid ${color}`,
        bgcolor: "#1e1e1e",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: "white" }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ fontSize: 42, color: color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
};

// -------------------------------------------------------
//  CORRELATION CHIP COMPONENT
// -------------------------------------------------------
const CorrelationChip = ({ label, value, description }) => {
  const getColor = (corr) => {
    if (corr > 0.3) return '#10b981';
    if (corr < 0) return '#ef4444';
    return '#f59e0b';
  };

  const getStrength = (corr) => {
    const abs = Math.abs(corr);
    if (abs > 0.5) return 'Strong';
    if (abs > 0.3) return 'Moderate';
    if (abs > 0.1) return 'Weak';
    return 'Very Weak';
  };

  return (
    <Chip
      icon={<Brain size={16} />}
      label={`${label}: ${value !== null ? value.toFixed(3) : 'N/A'} (${getStrength(value || 0)})`}
      sx={{
        px: 2,
        py: 2.5,
        fontSize: '0.95rem',
        fontWeight: 600,
        bgcolor: getColor(value || 0),
        color: 'white',
        '&:hover': {
          bgcolor: getColor(value || 0),
          opacity: 0.9
        }
      }}
    />
  );
};

// -------------------------------------------------------
//  GLOBAL ANALYSIS PAGE
// -------------------------------------------------------
export default function GlobalAnalysis() {
  const { data, loading, metadata, globalCorrelations, countrySummaries } = useData();
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState('all');

  // Filter country summaries
  const displayedSummaries = useMemo(() => {
    if (!countrySummaries) return [];
    if (selectedCountry === 'all') return countrySummaries;
    return countrySummaries.filter(c => c.country === selectedCountry);
  }, [countrySummaries, selectedCountry]);

  // Country comparison data
  const countryChartData = useMemo(() => {
    if (!countrySummaries) return { countries: [], studentCounts: [], avgGPAs: [], avgAIUsage: [] };

    const filtered = selectedCountry === 'all'
      ? countrySummaries.filter(c => c.country !== 'Global')
      : countrySummaries.filter(c => c.country === selectedCountry);

    return {
      countries: filtered.map(c => c.country),
      studentCounts: filtered.map(c => c.student_count),
      avgGPAs: filtered.map(c => c.avg_gpa || 0),
      avgAIUsage: filtered.map(c => c.avg_ai_usage_hours || 0)
    };
  }, [countrySummaries, selectedCountry]);

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Typography color="white" variant="h6">Loading global data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      {/* TITLE */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom color="white">
          🌍 Global Analysis
        </Typography>
        <Typography variant="subtitle1" color="grey.400">
          Comprehensive geographic analysis of AI adoption across {metadata?.countries?.length || 0} regions
        </Typography>
      </Box>

      {/* GLOBAL METRICS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              title="Total Students"
              value={(metadata?.total_students || 0).toLocaleString()}
              icon={<Users />}
              color={theme.palette.primary.main}
              subtitle="Across all regions"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard
              title="Countries"
              value={metadata?.countries?.length || 0}
              icon={<Globe />}
              color={theme.palette.secondary.main}
              subtitle="Regions studied"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard
              title="Data Processed"
              value={metadata?.date_processed || 'N/A'}
              icon={<BookOpen />}
              color="#10b981"
              subtitle="Last updated"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <StatCard
              title="Global Correlation"
              value={globalCorrelations?.gpa_vs_ai_usage?.correlation?.toFixed(3) || 'N/A'}
              icon={<Brain />}
              color="#f59e0b"
              subtitle="GPA ↔ AI Usage"
            />
          </motion.div>
        </Grid>
      </Grid>

      {/* COUNTRY FILTER */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e1e1e' }}>
        <FormControl fullWidth>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Country</InputLabel>
          <Select
            value={selectedCountry}
            label="Select Country"
            onChange={(e) => setSelectedCountry(e.target.value)}
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
            }}
          >
            <MenuItem value="all">All Countries</MenuItem>
            {metadata?.countries?.filter(c => c !== 'Global').map(country => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* WORLD MAP */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#1e1e1e' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom color="white">
          🗺️ Geographic Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click on a country to filter the view. Marker size = student count, color = AI usage intensity
        </Typography>
        <WorldMap
          countrySummaries={countrySummaries}
          selectedCountry={selectedCountry}
          onCountryClick={(country) => setSelectedCountry(country)}
        />
      </Paper>

      {/* GLOBAL CORRELATIONS */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#1e1e1e' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom color="white">
          📊 Global Correlations
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
          <CorrelationChip
            label="GPA ↔ AI Usage"
            value={globalCorrelations?.gpa_vs_ai_usage?.correlation}
            description={`n=${globalCorrelations?.gpa_vs_ai_usage?.sample_size || 0}`}
          />
          <CorrelationChip
            label="Stress ↔ AI Usage"
            value={globalCorrelations?.stress_vs_ai_usage?.correlation}
            description={`n=${globalCorrelations?.stress_vs_ai_usage?.sample_size || 0}`}
          />
          <CorrelationChip
            label="GPA ↔ Stress"
            value={globalCorrelations?.gpa_vs_stress?.correlation}
            description={`n=${globalCorrelations?.gpa_vs_stress?.sample_size || 0}`}
          />
          <CorrelationChip
            label="Satisfaction ↔ AI Usage"
            value={globalCorrelations?.satisfaction_vs_ai_usage?.correlation}
            description={`n=${globalCorrelations?.satisfaction_vs_ai_usage?.sample_size || 0}`}
          />
        </Stack>
      </Paper>

      {/* COUNTRY COMPARISON CHARTS */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#1e1e1e', height: 400 }}>
            <Typography variant="h6" gutterBottom color="white">
              Student Count by Country
            </Typography>
            <Plot
              data={[{
                type: 'bar',
                x: countryChartData.countries,
                y: countryChartData.studentCounts,
                marker: {
                  color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].slice(0, countryChartData.countries.length)
                }
              }]}
              layout={{
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: 'white' },
                xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                yaxis: { gridcolor: 'rgba(255,255,255,0.1)', title: 'Students' },
                margin: { t: 20, r: 20, l: 60, b: 60 }
              }}
              config={{ displayModeBar: false }}
              style={{ width: '100%', height: '320px' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#1e1e1e', height: 400 }}>
            <Typography variant="h6" gutterBottom color="white">
              Average AI Usage by Country
            </Typography>
            <Plot
              data={[{
                type: 'bar',
                x: countryChartData.countries,
                y: countryChartData.avgAIUsage,
                marker: {
                  color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'].slice(0, countryChartData.countries.length)
                }
              }]}
              layout={{
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: 'white' },
                xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                yaxis: { gridcolor: 'rgba(255,255,255,0.1)', title: 'Hours/Week' },
                margin: { t: 20, r: 20, l: 60, b: 60 }
              }}
              config={{ displayModeBar: false }}
              style={{ width: '100%', height: '320px' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}