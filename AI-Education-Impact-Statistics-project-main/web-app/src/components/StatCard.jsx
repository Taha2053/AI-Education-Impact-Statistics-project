import { Paper, Typography } from "@mui/material";

export default function StatCard({ title, value, color }) {
  return (
    <Paper sx={{ p: 3, textAlign: "center", bgcolor: `${color}22`, border: `2px solid ${color}` }}>
      <Typography variant="h4" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
}