/**
 * Performance Calculator - Calculates dashboard health scores
 */

/**
 * Calculate GPA trend score (0-100)
 * Based on average GPA and growth
 */
export const calculateGPAScore = (currentGPA, previousGPA = null) => {
    // Base score from current GPA (assuming 4.0 scale)
    const baseScore = (currentGPA / 4.0) * 100;

    // Bonus for improvement
    if (previousGPA && currentGPA > previousGPA) {
        const improvement = ((currentGPA - previousGPA) / previousGPA) * 100;
        const bonus = Math.min(improvement * 2, 10); // Max 10 bonus points
        return Math.min(Math.round(baseScore + bonus), 100);
    }

    return Math.round(baseScore);
};

/**
 * Calculate AI adoption score (0-100)
 * Based on percentage of students using AI and usage intensity
 */
export const calculateAIAdoptionScore = (data) => {
    if (!data || data.length === 0) return 0;

    // Percentage of students using AI (> 0 hours)
    const aiUsers = data.filter(s => s.ai_usage_hours > 0).length;
    const adoptionRate = (aiUsers / data.length) * 100;

    // Average usage hours (target: 8-12 hours is optimal)
    const avgUsage = data.reduce((sum, s) => sum + s.ai_usage_hours, 0) / data.length;
    const usageScore = avgUsage >= 8 && avgUsage <= 12 ? 100 :
        avgUsage > 12 ? Math.max(100 - (avgUsage - 12) * 5, 50) :
            (avgUsage / 8) * 100;

    // Weighted average
    return Math.round(adoptionRate * 0.6 + usageScore * 0.4);
};

/**
 * Calculate engagement score (0-100)
 * Based on data completeness and correlation strength
 */
export const calculateEngagementScore = (data, correlation) => {
    if (!data || data.length === 0) return 0;

    // Data completeness (no missing values)
    const completeRecords = data.filter(s =>
        s.gpa && s.ai_usage_hours !== undefined && s.major && s.country
    ).length;
    const completenessScore = (completeRecords / data.length) * 100;

    // Correlation strength (absolute value, 0 to 1)
    const correlationScore = Math.abs(correlation) * 100;

    // Weighted average
    return Math.round(completenessScore * 0.5 + correlationScore * 0.5);
};

/**
 * Calculate overall performance score
 */
export const calculateOverallScore = (data, metrics) => {
    if (!metrics) return 0;

    const gpaScore = calculateGPAScore(parseFloat(metrics.avgGpa));
    const aiScore = calculateAIAdoptionScore(data);
    const engagementScore = calculateEngagementScore(data, parseFloat(metrics.correlation));

    // Weighted average: GPA (40%), AI Adoption (30%), Engagement (30%)
    const overall = gpaScore * 0.4 + aiScore * 0.3 + engagementScore * 0.3;

    return {
        overall: Math.round(overall),
        breakdown: {
            gpa: gpaScore,
            aiAdoption: aiScore,
            engagement: engagementScore,
        },
    };
};

/**
 * Generate mock previous period data for trend comparison
 * In production, this would come from a real API
 */
export const generatePreviousPeriodData = (currentMetrics) => {
    if (!currentMetrics) return null;

    // Generate realistic "previous" values (slightly lower)
    return {
        total: Math.round(currentMetrics.total * 0.88), // 12% growth
        avgGpa: (parseFloat(currentMetrics.avgGpa) - 0.08).toFixed(2), // +0.08 improvement
        avgAi: (parseFloat(currentMetrics.avgAi) - 1.2).toFixed(1), // +1.2h growth
        correlation: (parseFloat(currentMetrics.correlation) - 0.05).toFixed(2),
    };
};

/**
 * Calculate percentage change between current and previous
 */
export const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};
