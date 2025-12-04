import React, { useMemo } from 'react';
import { Grid, Box, Paper, Typography, Stack } from '@mui/material';
import { Users, GraduationCap, Brain, TrendingUp } from 'lucide-react';
import StatCard from '../../StatCard';
import TrendIndicator from '../shared/TrendIndicator';
import {
    generatePreviousPeriodData,
    calculateChange
} from '../utils/performanceCalculator';
import { getCorrelationStrength } from '../utils/dataHelpers';
import CountUp from 'react-countup';

/**
 * HeroKPIs - Top KPI cards with trends
 */
export default function HeroKPIs({ metrics, theme }) {
    // Generate previous period data for trends
    const previousMetrics = useMemo(() =>
        generatePreviousPeriodData(metrics),
        [metrics]
    );

    const trends = useMemo(() => {
        if (!previousMetrics) return {};
        return {
            total: calculateChange(metrics.total, previousMetrics.total),
            avgGpa: calculateChange(parseFloat(metrics.avgGpa), parseFloat(previousMetrics.avgGpa)),
            avgAi: calculateChange(parseFloat(metrics.avgAi), parseFloat(previousMetrics.avgAi)),
        };
    }, [metrics, previousMetrics]);

    return (
        <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="stretch">
                {/* Total Students */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Students"
                        value={<CountUp end={metrics?.total || 0} duration={1} />}
                        icon={Users}
                        color={theme.palette.primary.main}
                        tooltip="Number of students after applying filters"
                        sx={{ height: '100%' }}
                    />
                    {trends.total !== undefined && (
                        <Box sx={{ mt: 1, px: 2 }}>
                            <TrendIndicator value={trends.total} label="vs last period" />
                        </Box>
                    )}
                </Grid>

                {/* Average GPA */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg GPA"
                        value={<CountUp end={parseFloat(metrics?.avgGpa || 0)} decimals={2} duration={1} />}
                        icon={GraduationCap}
                        color={theme.palette.secondary.main}
                        tooltip="Average GPA of filtered cohort"
                        sx={{ height: '100%' }}
                    />
                    {trends.avgGpa !== undefined && (
                        <Box sx={{ mt: 1, px: 2 }}>
                            <TrendIndicator value={trends.avgGpa} label="vs last period" showPercentage={false} />
                        </Box>
                    )}
                </Grid>

                {/* Average AI Usage */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg AI Usage"
                        value={
                            <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                <CountUp end={parseFloat(metrics?.avgAi || 0)} decimals={1} duration={1} />
                                <Typography variant="h6" component="span" color="text.secondary">h</Typography>
                            </Stack>
                        }
                        icon={Brain}
                        color="#10b981"
                        tooltip="Average AI usage per week"
                        sx={{ height: '100%' }}
                    />
                    {trends.avgAi !== undefined && (
                        <Box sx={{ mt: 1, px: 2 }}>
                            <TrendIndicator value={trends.avgAi} label="vs last period" showPercentage={false} />
                        </Box>
                    )}
                </Grid>

                {/* Correlation */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            height: '100%',
                            borderRadius: 2,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            p: 2,
                        }}
                    >
                        <Stack spacing={1} alignItems="center">
                            <TrendingUp size={32} color={theme.palette.info.main} />
                            <Typography variant="subtitle2" color="text.secondary" align="center">
                                GPA‑AI Correlation
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {metrics?.correlation}
                            </Typography>
                            <Box
                                sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ color: '#10b981' }}
                                >
                                    {getCorrelationStrength(metrics?.correlation)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
