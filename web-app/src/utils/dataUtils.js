// Utility functions for data manipulation

/**
 * Filter students based on multiple criteria
 */
export const filterStudents = (students, filters) => {
    if (!students || !Array.isArray(students)) return [];

    return students.filter(student => {
        // Country filter
        if (filters.country && filters.country !== 'all' && filters.country !== 'All') {
            if (student.country !== filters.country) return false;
        }

        // GPA range filter
        if (filters.gpaRange) {
            const [min, max] = filters.gpaRange;
            if (student.gpa !== null && student.gpa !== undefined) {
                if (student.gpa < min || student.gpa > max) return false;
            } else if (min > 0 || max < 4.0) {
                // Filter out null GPAs if range is specified
                return false;
            }
        }

        // AI Usage filter
        if (filters.aiUsage && filters.aiUsage !== 'all' && filters.aiUsage !== 'All') {
            if (student.uses_ai !== filters.aiUsage) return false;
        }

        // Gender filter
        if (filters.gender && filters.gender !== 'all' && filters.gender !== 'All') {
            if (student.gender !== filters.gender) return false;
        }

        // Education Level filter
        if (filters.educationLevel && filters.educationLevel !== 'all' && filters.educationLevel !== 'All') {
            if (student.education_level !== filters.educationLevel) return false;
        }

        // Field of Study filter
        if (filters.fieldOfStudy && filters.fieldOfStudy !== 'all' && filters.fieldOfStudy !== 'All') {
            const studentField = student.field_of_study || student.major;
            if (studentField !== filters.fieldOfStudy) return false;
        }

        // AI Usage Hours Range filter
        if (filters.aiUsageHoursRange) {
            const [min, max] = filters.aiUsageHoursRange;
            if (student.ai_usage_hours < min || student.ai_usage_hours > max) return false;
        }

        return true;
    });
};

/**
 * Calculate average safely (handle nulls and undefined)
 */
export const calculateAverage = (values) => {
    if (!values || values.length === 0) return 0;

    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length === 0) return 0;

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
};

/**
 * Calculate correlation coefficient
 */
export const calculateCorrelation = (x, y) => {
    if (!x || !y || x.length !== y.length || x.length === 0) return 0;

    // Filter out pairs where either value is null
    const pairs = x.map((xi, i) => [xi, y[i]])
        .filter(([xi, yi]) => xi !== null && yi !== null && !isNaN(xi) && !isNaN(yi));

    if (pairs.length < 2) return 0;

    const xFiltered = pairs.map(p => p[0]);
    const yFiltered = pairs.map(p => p[1]);

    const n = xFiltered.length;
    const sumX = xFiltered.reduce((a, b) => a + b, 0);
    const sumY = yFiltered.reduce((a, b) => a + b, 0);
    const sumXY = xFiltered.reduce((sum, xi, i) => sum + xi * yFiltered[i], 0);
    const sumX2 = xFiltered.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = yFiltered.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Get unique values for a field (for dropdowns)
 */
export const getUniqueValues = (students, field) => {
    if (!students || !Array.isArray(students)) return [];

    const values = students
        .map(s => s[field])
        .filter(v => v !== null && v !== undefined && v !== '');

    return [...new Set(values)].sort();
};

/**
 * Format GPA for display
 */
export const formatGPA = (gpa) => {
    if (gpa === null || gpa === undefined || isNaN(gpa)) return 'N/A';
    return parseFloat(gpa).toFixed(2);
};

/**
 * Format AI Usage hours for display
 */
export const formatAIUsage = (hours) => {
    if (hours === null || hours === undefined || isNaN(hours)) return 'N/A';
    return `${parseFloat(hours).toFixed(1)}h`;
};

/**
 * Format AI tools array for display
 */
export const formatAITools = (tools) => {
    if (!tools || !Array.isArray(tools) || tools.length === 0) return 'None';
    return tools.filter(Boolean).join(', ');
};

/**
 * Format stress level (0-10 scale) with descriptive label
 */
export const formatStressLevel = (level) => {
    if (level === null || level === undefined || isNaN(level)) return 'N/A';
    const numLevel = parseFloat(level);

    if (numLevel <= 2) return `Low (${numLevel.toFixed(1)}/10)`;
    if (numLevel <= 5) return `Moderate (${numLevel.toFixed(1)}/10)`;
    if (numLevel <= 8) return `High (${numLevel.toFixed(1)}/10)`;
    return `Severe (${numLevel.toFixed(1)}/10)`;
};

/**
 * Format boolean fields for display
 */
export const formatBoolean = (value) => {
    if (value === true) return '✓ Yes';
    if (value === false) return '✗ No';
    return '— N/A';
};

/**
 * Extract unique AI tools from students array (handles ai_tools as array)
 */
export const extractAIToolsUnique = (students) => {
    if (!students || !Array.isArray(students)) return [];

    const toolsSet = new Set();
    students.forEach(s => {
        if (s.ai_tools && Array.isArray(s.ai_tools)) {
            s.ai_tools.forEach(tool => {
                if (tool && tool !== 'None') {
                    toolsSet.add(tool);
                }
            });
        }
    });

    return Array.from(toolsSet).sort();
};

/**
 * Get country-specific fields
 */
export const getCountryFields = (country) => {
    const fieldMap = {
        'Tunisia': ['age', 'region', 'dependency_level', 'confidence_level'],
        'Bangladesh': ['university', 'teaching_impact', 'privacy_concern'],
        'Egypt': ['study_section', 'impact_on_assignment_quality'],
        'India': ['impact_on_grades', 'awareness_level', 'willing_to_pay'],
        'Global': ['country_of_study', 'chat_gpt_experience']
    };

    return fieldMap[country] || [];
};

/**
 * Downsample large arrays for visualization performance
 * Updated for larger datasets (27k+ records)
 */
export const downsampleData = (data, maxPoints = 1000) => {
    if (!data || data.length <= maxPoints) return data;

    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString();
};

/**
 * Get country coordinates for map
 */
export const getCountryCoordinates = (country) => {
    const coords = {
        'Tunisia': { lat: 36.8065, lon: 10.1815 },
        'Bangladesh': { lat: 23.685, lon: 90.3563 },
        'Egypt': { lat: 30.0444, lon: 31.2357 },
        'India': { lat: 20.5937, lon: 78.9629 },
        'Global': { lat: 0, lon: 0 } // Center of world
    };

    return coords[country] || { lat: 0, lon: 0 };
};
