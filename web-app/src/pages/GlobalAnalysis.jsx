import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import { Users, Brain, BookOpen, GraduationCap } from "lucide-react";
import { useData } from "../context/DataContext";

// -------------------------------------------------------
//  STAT CARD COMPONENT
// -------------------------------------------------------
const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        boxShadow: 5,
        borderLeft: `6px solid ${color}`,
        bgcolor: "#1e1e1e", // dark card background
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
        </Box>

        <Box sx={{ fontSize: 42, color: color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center">
        <Typography
          variant="caption"
          fontWeight="bold"
          color={trend === "up" ? "success.main" : "error.main"}
        >
          {trendValue} vs last month
        </Typography>
      </Stack>
    </Paper>
  );
};

// -------------------------------------------------------
//                DASHBOARD PAGE (Dark Mode)
// -------------------------------------------------------
export default function Overview() {
  const { data, loading } = useData();
  const theme = useTheme();

  if (loading || !data) return <Typography color="white">Loading...</Typography>;

  const totalStudents = data.students.length;
  const avgGpa = (data.students.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(2);
  const avgAiUsage = (data.students.reduce((acc, s) => acc + s.ai_usage_hours, 0) / totalStudents).toFixed(1);
  const avgStudyHours = (data.students.reduce((acc, s) => acc + s.study_hours_per_week, 0) / totalStudents).toFixed(1);

  return (
    <Box sx={{ p: 4, bgcolor: "#121212", minHeight: "100vh", color: "white" }}>
      {/* TITLE */}
      <Typography variant="h3" fontWeight={700} gutterBottom color="white">
        📊 Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" color="grey.400">
        Key statistics and insights on student performance and AI usage.
      </Typography>

      {/* MAIN STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={<Users />}
            color={theme.palette.primary.main}
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. GPA"
            value={avgGpa}
            icon={<GraduationCap />}
            color={theme.palette.secondary.main}
            trend="up"
            trendValue="+0.2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. AI Usage (Hrs)"
            value={avgAiUsage}
            icon={<Brain />}
            color="#10b981"
            trend="up"
            trendValue="+2.5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Study Hours/Week"
            value={avgStudyHours}
            icon={<BookOpen />}
            color="#f59e0b"
            trend="down"
            trendValue="-1.2"
          />
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 6, mb: 2 }} color="white">
        📈 Performance Visuals
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: 300, borderRadius: 3, boxShadow: 5, bgcolor: "#1e1e1e" }}>
            <Typography variant="h6" gutterBottom color="white">
              GPA vs AI Usage by Country
            </Typography>
            <Box
              sx={{
                height: "75%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "grey.700",
              }}
            >
              [Chart Placeholder]
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: 300, borderRadius: 3, boxShadow: 5, bgcolor: "#1e1e1e" }}>
            <Typography variant="h6" gutterBottom color="white">
              Student Distribution
            </Typography>
            <Box
              sx={{
                height: "75%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "grey.700",
              }}
            >
              [Chart Placeholder]
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* INSIGHTS */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 6, mb: 2 }} color="white">
        🔍 Key Insights
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 5, bgcolor: "#1f1f1f" }}>
            <Typography variant="h6" fontWeight="bold" color="white">
              Improved Productivity
            </Typography>
            <Typography color="white" sx={{ opacity: 0.85 }}>
              • Students using AI tools score higher on average.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 5, bgcolor: "#1f1f1f" }}>
            <Typography variant="h6" fontWeight="bold" color="white">
              Study Peak Hours
            </Typography>
            <Typography color="white" sx={{ opacity: 0.85 }}>
              • Highest activity between 8 PM and 11 PM.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 5, bgcolor: "#1f1f1f" }}>
            <Typography variant="h6" fontWeight="bold" color="white">
              Top Regions
            </Typography>
            <Typography color="white" sx={{ opacity: 0.85 }}>
              • Most active users are from USA, India, Nigeria.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}