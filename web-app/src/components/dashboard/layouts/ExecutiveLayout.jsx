import React, { useMemo } from 'react';
import { Box, Grid, useTheme, Stack, Typography, Paper, Collapse, IconButton } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import HeroKPIs from '../sections/HeroKPIs';
import PerformanceScore from '../shared/PerformanceScore';
import InsightBadge from '../shared/InsightBadge';
import ChartCard from '../shared/ChartCard';
import Plot from 'react-plotly.js';
import {
    calculateOverallScore
} from '../utils/performanceCalculator';
import {
    getKeyInsight,
    generateInsights
} from '../utils/insightGenerator';

/**
 * ExecutiveLayout - Clean, action-oriented dashboard for quick decision-making
 */
export default function ExecutiveLayout({
    data,
    metrics,
    filters,
    onFilterChange,
    charts,
    tables,
    cohortComparison
}) {
    const theme = useTheme();
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    // Calculate performance score
    const performanceScore = useMemo(() =>
        calculateOverallScore(data, metrics),
        [data, metrics]
    );

    // Get key insight
    const keyInsight = useMemo(() =>
        getKeyInsight(data, metrics, charts?.aiToolCounts || {}),
        [data, metrics, charts]
    );

    // Get all insights
    const allInsights = useMemo(() =>
        generateInsights(data, metrics, charts?.aiToolCounts || {}),
        [data, metrics, charts]
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Hero KPIs */}
            <HeroKPIs metrics={metrics} theme={theme} />

            {/* Quick Filters (Collapsible) */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    🔍 Filters: {filters?.activeCount || 0} active
                </Typography>
                {/* Filters content would go here */}
            </Paper>

            {/* Key Insight + Performance Score */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                { /* Key Insight */}
                <Grid item xs={12} md={8}>
                    {keyInsight && (
                        <InsightBadge
                            type={keyInsight.type}
                            title={keyInsight.title}
                            description={keyInsight.description}
                        />
                    )}
                </Grid>

                {/* Performance Score */}
                <Grid item xs={12} md={4}>
                    <PerformanceScore
                        overall={performanceScore?.overall}
                        scores={performanceScore?.breakdown}
                    />
                </Grid>
            </Grid>

            {/* Distribution Charts */}
            {charts && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* GPA Distribution */}
                    <Grid item xs={12} md={8}>
                        <ChartCard
                            title="GPA Distribution"
                            insight="68% of students score between 3.0-3.8 GPA"
                            interactionHint="Hover for details"
                            height={300}
                        >
                            {charts.gpaDistribution}
                        </ChartCard>
                    </Grid>

                    {/* AI Tools Popularity */}
                    <Grid item xs={12} md={4}>
                        <ChartCard
                            title="AI Tools Popularity"
                            insight={`${Object.keys(charts?.aiToolCounts || {})[0]} is most popular`}
                            interactionHint="Click slice to filter"
                            height={300}
                        >
                            {charts.aiToolsDonut}
                        </ChartCard>
                    </Grid>
                </Grid>
            )}

            {/* Geographic Insights */}
            {tables && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        {tables.topPerformers}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {tables.aiUsageLeaders}
                    </Grid>
                </Grid>
            )}

            {/* Advanced Analysis (Collapsible) */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.02)',
                        },
                    }}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">🔬 Advanced Analysis</Typography>
                    </Stack>
                    <IconButton size="small">
                        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </IconButton>
                </Box>

                <Collapse in={showAdvanced}>
                    <Box sx={{ p: 3, pt: 0 }}>
                        {/* Scatter Plot */}
                        {charts?.correlationScatter && (
                            <Box sx={{ mb: 3 }}>
                                <ChartCard
                                    title="GPA vs AI Usage Correlation"
                                    insight={`r = ${metrics?.correlation} (${getCorrelationStrength(metrics?.correlation)})`}
                                    height={300}
                                >
                                    {charts.correlationScatter}
                                </ChartCard>
                            </Box>
                        )}

                        {/* Cohort Comparison */}
                        {cohortComparison && (
                            <Box>
                                {cohortComparison}
                            </Box>
                        )}

                        {/* All Insights */}
                        {allInsights.length > 1 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>All Insights</Typography>
                                <Stack spacing={2}>
                                    {allInsights.slice(1).map((insight, idx) => (
                                        <InsightBadge
                                            key={idx}
                                            type={insight.type}
                                            title={insight.title}
                                            description={insight.description}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </Paper>
        </Box>
    );
}

// Helper to get correlation strength
const getCorrelationStrength = (r) => {
    if (!r) return '';
    const val = Math.abs(parseFloat(r));
    if (val < 0.3) return 'Weak';
    if (val < 0.7) return 'Moderate';
    return 'Strong';
};
