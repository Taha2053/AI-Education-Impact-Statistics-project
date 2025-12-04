import React from 'react';
import { Box, Paper, Typography, Stack, LinearProgress } from '@mui/material';

/**
 * PerformanceScore - Displays overall dashboard health score
 * @param {object} scores - Score breakdown { gpa: 0-100, aiAdoption: 0-100, engagement: 0-100 }
 * @param {number} overall - Overall score 0-100 (calculated if not provided)
 */
export default function PerformanceScore({ scores, overall }) {
    const calculateOverall = () => {
        if (overall !== undefined) return overall;
        if (!scores) return 0;

        const { gpa = 0, aiAdoption = 0, engagement = 0 } = scores;
        return Math.round((gpa * 0.4 + aiAdoption * 0.3 + engagement * 0.3));
    };

    const overallScore = calculateOverall();

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const scoreColor = getScoreColor(overallScore);
    const scoreLabel = getScoreLabel(overallScore);

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.05)',
                height: '100%',
            }}
        >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Performance Score
            </Typography>

            {/* Circular Score Display */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 2,
                }}
            >
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: `8px solid ${scoreColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        mb: 2,
                        background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`,
                    }}
                >
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{ color: scoreColor }}
                    >
                        {overallScore}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                    >
                        / 100
                    </Typography>
                </Box>

                <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ color: scoreColor, mb: 2 }}
                >
                    {scoreLabel}
                </Typography>
            </Box>

            {/* Breakdown */}
            {scores && (
                <Stack spacing={1.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Breakdown:
                    </Typography>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption">GPA Trend</Typography>
                            <Typography variant="caption" fontWeight={600}>
                                {scores.gpa}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={scores.gpa}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getScoreColor(scores.gpa),
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption">AI Adoption</Typography>
                            <Typography variant="caption" fontWeight={600}>
                                {scores.aiAdoption}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={scores.aiAdoption}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getScoreColor(scores.aiAdoption),
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption">Engagement</Typography>
                            <Typography variant="caption" fontWeight={600}>
                                {scores.engagement}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={scores.engagement}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getScoreColor(scores.engagement),
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                </Stack>
            )}
        </Paper>
    );
}
