/**
 * Data Helper Utilities
 */

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
    return num.toLocaleString('en-US');
};

/**
 * Group data by a specific key
 */
export const groupBy = (data, key) => {
    return data.reduce((groups, item) => {
        const value = item[key];
        if (!groups[value]) groups[value] = [];
        groups[value].push(item);
        return groups;
    }, {});
};

/**
 * Calculate average for an array of numbers
 */
export const average = (arr) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Calculate median for an array of numbers
 */
export const median = (arr) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
};

/**
 * Calculate percentile
 */
export const percentile = (arr, p) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Group data by country and calculate average GPA
 */
export const getCountryPerformance = (data) => {
    const groups = groupBy(data, 'country');

    return Object.entries(groups)
        .map(([country, students]) => ({
            country,
            avgGpa: average(students.map(s => s.gpa)).toFixed(2),
            avgAi: average(students.map(s => s.ai_usage_hours)).toFixed(1),
            count: students.length,
        }))
        .sort((a, b) => b.avgGpa - a.avgGpa);
};

/**
 * Group data by major and calculate metrics
 */
export const getMajorPerformance = (data) => {
    const groups = groupBy(data, 'major');

    return Object.entries(groups)
        .map(([major, students]) => ({
            major,
            avgGpa: average(students.map(s => s.gpa)).toFixed(2),
            avgAi: average(students.map(s => s.ai_usage_hours)).toFixed(1),
            count: students.length,
            aiAdoption: (students.filter(s => s.ai_usage_hours > 0).length / students.length * 100).toFixed(1),
        }))
        .sort((a, b) => b.avgGpa - a.avgGpa);
};

/**
 * Get AI tool distribution by major
 */
export const getAIToolsByMajor = (data) => {
    const tools = [...new Set(data.map(s => s.ai_tool))];
    const majors = [...new Set(data.map(s => s.major))];

    return tools.map(tool => {
        const counts = majors.map(major =>
            data.filter(s => s.major === major && s.ai_tool === tool).length
        );

        return {
            name: tool,
            data: counts,
            majors,
        };
    });
};

/**
 * Calculate correlation coefficient
 */
export const calculateCorrelation = (x, y) => {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : (numerator / denominator);
};

/**
 * Get correlation strength label
 */
export const getCorrelationStrength = (r) => {
    const val = Math.abs(r);
    if (val < 0.3) return 'Weak';
    if (val < 0.7) return 'Moderate';
    return 'Strong';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
};

/**
 * Get color for a score (0-100)
 */
export const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
};

/**
 * Debounce function calls
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
