/**
 * Insight Generator - Auto-generates insights from dashboard data
 */

/**
 * Generate key insights from data and metrics
 * @param {Array} data - Filtered student data
 * @param {Object} metrics - Calculated metrics
 * @param {Object} aiToolCounts - AI tool usage counts
 * @returns {Array} Array of insight objects
 */
export const generateInsights = (data, metrics, aiToolCounts) => {
    if (!data || data.length === 0 || !metrics) return [];

    const insights = [];

    // 1. Correlation Insight
    const corrValue = parseFloat(metrics.correlation);
    const corrStrength = getCorrelationStrength(corrValue);

    if (Math.abs(corrValue) >= 0.5) {
        insights.push({
            type: Math.abs(corrValue) >= 0.7 ? 'success' : 'info',
            title: 'AI-Performance Correlation',
            description: `There is a ${corrStrength.toLowerCase()} ${corrValue >= 0 ? 'positive' : 'negative'} correlation (r=${corrValue}) between AI usage and GPA.`,
            priority: 1,
        });
    }

    // 2. High AI Usage Insight
    const avgAi = parseFloat(metrics.avgAi);
    const highUsage = data.filter(s => s.ai_usage_hours > 10);
    const lowUsage = data.filter(s => s.ai_usage_hours < 2);

    if (highUsage.length > 0 && lowUsage.length > 0) {
        const highGPA = highUsage.reduce((sum, s) => sum + s.gpa, 0) / highUsage.length;
        const lowGPA = lowUsage.reduce((sum, s) => sum + s.gpa, 0) / lowUsage.length;
        const diff = ((highGPA - lowGPA) / lowGPA * 100);

        if (Math.abs(diff) >= 10) {
            insights.push({
                type: diff > 0 ? 'success' : 'warning',
                title: 'AI Usage Impact',
                description: `Students using AI 10+ hours/week show ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'higher' : 'lower'} average GPA (${highGPA.toFixed(2)} vs ${lowGPA.toFixed(2)}).`,
                priority: 2,
            });
        }
    }

    // 3. Optimal Usage Range
    if (avgAi >= 8 && avgAi <= 12) {
        insights.push({
            type: 'success',
            title: 'Optimal AI Usage',
            description: `Average AI usage of ${avgAi} hours/week falls within the optimal range (8-12 hours), showing balanced integration.`,
            priority: 3,
        });
    } else if (avgAi > 15) {
        insights.push({
            type: 'warning',
            title: 'High AI Usage',
            description: `Average AI usage of ${avgAi} hours/week exceeds optimal range. Diminishing returns may occur above 15 hours/week.`,
            priority: 3,
        });
    } else if (avgAi < 5) {
        insights.push({
            type: 'warning',
            title: 'Low AI Engagement',
            description: `Average AI usage of ${avgAi} hours/week is below the optimal range. Consider promoting AI adoption.`,
            priority: 3,
        });
    }

    // 4. AI Adoption Rate
    const aiUsers = data.filter(s => s.ai_usage_hours > 0).length;
    const adoptionRate = (aiUsers / data.length * 100).toFixed(1);

    if (adoptionRate >= 75) {
        insights.push({
            type: 'success',
            title: 'Strong AI Adoption',
            description: `${adoptionRate}% of students actively use AI tools, indicating high engagement.`,
            priority: 4,
        });
    } else if (adoptionRate < 50) {
        insights.push({
            type: 'warning',
            title: 'Low AI Adoption',
            description: `Only ${adoptionRate}% of students use AI tools. Consider awareness campaigns or training.`,
            priority: 2,
        });
    }

    // 5. Tool Distribution Insight
    if (aiToolCounts && Object.keys(aiToolCounts).length > 0) {
        const topTool = Object.entries(aiToolCounts).sort((a, b) => b[1] - a[1])[0];
        const topToolPercent = (topTool[1] / data.length * 100).toFixed(1);

        insights.push({
            type: 'info',
            title: 'Most Popular Tool',
            description: `${topTool[0]} is the most popular AI tool, used by ${topToolPercent}% of students (${topTool[1]} students).`,
            priority: 5,
        });
    }

    // 6. GPA Distribution Insight
    const avgGpa = parseFloat(metrics.avgGpa);
    if (avgGpa >= 3.5) {
        insights.push({
            type: 'success',
            title: 'High Academic Performance',
            description: `Average GPA of ${avgGpa} indicates strong overall academic performance.`,
            priority: 6,
        });
    } else if (avgGpa < 3.0) {
        insights.push({
            type: 'warning',
            title: 'Academic Performance Alert',
            description: `Average GPA of ${avgGpa} is below target. Review support systems and interventions.`,
            priority: 2,
        });
    }

    // 7. Data Quality Check
    const missingData = data.filter(s => !s.gpa || s.ai_usage_hours === undefined).length;
    if (missingData > 0) {
        const missingPercent = (missingData / data.length * 100).toFixed(1);
        insights.push({
            type: 'warning',
            title: 'Data Quality Issue',
            description: `${missingData} students (${missingPercent}%) have incomplete data. Ensure data collection processes are robust.`,
            priority: 7,
        });
    }

    // Sort by priority and return
    return insights.sort((a, b) => a.priority - b.priority);
};

/**
 * Get correlation strength label
 */
const getCorrelationStrength = (r) => {
    const val = Math.abs(r);
    if (val < 0.3) return 'Weak';
    if (val < 0.7) return 'Moderate';
    return 'Strong';
};

/**
 * Generate a single key insight (most important)
 */
export const getKeyInsight = (data, metrics, aiToolCounts) => {
    const insights = generateInsights(data, metrics, aiToolCounts);
    return insights.length > 0 ? insights[0] : null;
};

/**
 * Generate actionable recommendations
 */
export const generateRecommendations = (data, metrics) => {
    if (!data || !metrics) return [];

    const recommendations = [];
    const avgAi = parseFloat(metrics.avgAi);
    const avgGpa = parseFloat(metrics.avgGpa);
    const correlation = parseFloat(metrics.correlation);

    // Sweet spot recommendation
    if (avgAi < 8) {
        recommendations.push({
            priority: 'high',
            action: 'Encourage 8-12 hour/week AI usage as the optimal range',
            reason: 'Current average is below the sweet spot for maximum benefit',
        });
    } else if (avgAi > 15) {
        recommendations.push({
            priority: 'medium',
            action: 'Monitor heavy AI users (>15h/week) for over-reliance',
            reason: 'Diminishing returns observed above 15 hours/week',
        });
    }

    // Adoption recommendation
    const aiUsers = data.filter(s => s.ai_usage_hours > 0).length;
    const adoptionRate = aiUsers / data.length;

    if (adoptionRate < 0.5) {
        recommendations.push({
            priority: 'high',
            action: 'Launch AI literacy and adoption campaign',
            reason: `Only ${(adoptionRate * 100).toFixed(0)}% of students use AI tools`,
        });
    }

    // Major-specific recommendations
    const majorGroups = groupByMajor(data);
    for (const [major, students] of Object.entries(majorGroups)) {
        const majorAiUsers = students.filter(s => s.ai_usage_hours > 0).length;
        const majorAdoption = majorAiUsers / students.length;

        if (majorAdoption < 0.3 && students.length > 10) {
            recommendations.push({
                priority: 'medium',
                action: `Provide targeted AI training for ${major} students`,
                reason: `Only ${(majorAdoption * 100).toFixed(0)}% adoption in this major`,
            });
        }
    }

    // Performance recommendation
    if (avgGpa < 3.0) {
        recommendations.push({
            priority: 'high',
            action: 'Review and enhance academic support systems',
            reason: `Average GPA of ${avgGpa} is below target`,
        });
    }

    // Study high performers
    if (correlation > 0.5) {
        recommendations.push({
            priority: 'medium',
            action: 'Study high-performing cohorts for best practice patterns',
            reason: 'Strong positive correlation suggests AI usage contributes to success',
        });
    }

    return recommendations;
};

/**
 * Helper: Group data by major
 */
const groupByMajor = (data) => {
    return data.reduce((groups, student) => {
        const { major } = student;
        if (!groups[major]) groups[major] = [];
        groups[major].push(student);
        return groups;
    }, {});
};
