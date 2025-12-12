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
            s.ai_tools.forEach(rawTool => {
                const tool = normalizeTool(rawTool);
                if (tool) {
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
 * NOW COMPREHENSIVE
 */
export // Country name normalization mapping
const COUNTRY_NAME_MAPPINGS = {
  // Variations and official names
  'United States of America': 'United States',
  'USA': 'United States',
  'US': 'United States',
  'The United States': 'United States',
  
  'United Kingdom': 'United Kingdom',
  'UK': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  
  'The Netherlands': 'Netherlands',
  'Holland': 'Netherlands',
  
  'The Philippines': 'Philippines',
  
  'Myanmar (Burma)': 'Myanmar',
  'Burma': 'Myanmar',
  
//   'Cote d\'Ivoire': 'Ivory Coast',
//   'Côte d\'Ivoire': 'Ivory Coast',
  
  'Vatican City (Holy See)': 'Vatican City',
  'Holy See': 'Vatican City',
  
  'United Arab Emirates': 'United Arab Emirates',
  'UAE': 'United Arab Emirates',
  
  'Cape Verde': 'Cape Verde',
  'Cabo Verde': 'Cape Verde',
  
  'Palestinian State*': 'Palestine',
  'Palestine': 'Palestine',
  'Palestinian Territories': 'Palestine',
  
  'Kosovo': 'Kosovo',
  
  // Add more common variations as needed
  'South Korea': 'South Korea',
  'Republic of Korea': 'South Korea',
  
  'North Korea': 'North Korea',
  'Democratic People\'s Republic of Korea': 'North Korea',
  
  'Czech Republic': 'Czechia',
  'Czechia': 'Czechia',
};

// Comprehensive country coordinates database
const COUNTRY_COORDINATES = {
  // North America
  'United States': { lat: 37.0902, lon: -95.7129 },
  'Canada': { lat: 56.1304, lon: -106.3468 },
  'Mexico': { lat: 23.6345, lon: -102.5528 },
  
  // Europe
  'United Kingdom': { lat: 55.3781, lon: -3.4360 },
  'France': { lat: 46.2276, lon: 2.2137 },
  'Germany': { lat: 51.1657, lon: 10.4515 },
  'Italy': { lat: 41.8719, lon: 12.5674 },
  'Spain': { lat: 40.4637, lon: -3.7492 },
  'Netherlands': { lat: 52.1326, lon: 5.2913 },
    // FIXED COUNTRIES
    'Cyprus': { lat: 35.1264, lon: 33.4299 },        // Correct Mediterranean island position
    'Belarus': { lat: 53.7098, lon: 27.9534 },       // Correct European position

    // NEW ADDITIONS
    'Taiwan': { lat: 23.6978, lon: 120.9605 },
    'Montenegro': { lat: 42.7087, lon: 19.3744 },
    'Sri Lanka': { lat: 7.8731, lon: 80.7718 },
    'Angola': { lat: -11.2027, lon: 17.8739 },
    'Mauritania': { lat: 21.0079, lon: -10.9408 },
    'Jordan': { lat: 30.5852, lon: 36.2384 },
    'Mozambique': { lat: -18.6657, lon: 35.5296 },
    'Zimbabwe': { lat: -19.0154, lon: 29.1549 },
    'Zambia': { lat: -13.1339, lon: 27.8493 },
    'Slovenia': { lat: 46.1512, lon: 14.9955 },
    'Albania': { lat: 41.1533, lon: 20.1683 },
    'Luxembourg': { lat: 49.8153, lon: 6.1296 },
    // Europe (remaining)
'Estonia': { lat: 58.5953, lon: 25.0136 },
'Latvia': { lat: 56.8796, lon: 24.6032 },
'Lithuania': { lat: 55.1694, lon: 23.8813 },
'Slovakia': { lat: 48.6690, lon: 19.6990 },
'Bosnia and Herzegovina': { lat: 43.9159, lon: 17.6791 },
'North Macedonia': { lat: 41.6086, lon: 21.7453 },
'Moldova': { lat: 47.4116, lon: 28.3699 },
'Belarus': { lat: 53.7098, lon: 27.9534 },        // corrected
'Andorra': { lat: 42.5462, lon: 1.6016 },
'Liechtenstein': { lat: 47.1660, lon: 9.5554 },
'San Marino': { lat: 43.9333, lon: 12.4500 },
'Monaco': { lat: 43.7384, lon: 7.4246 },
'Iceland': { lat: 64.9631, lon: -19.0208 },

// Middle East (remaining)
'Yemen': { lat: 15.5527, lon: 48.5164 },
'Oman': { lat: 21.5126, lon: 55.9233 },
'Qatar': { lat: 25.3548, lon: 51.1839 },
'Kuwait': { lat: 29.3117, lon: 47.4818 },
'Bahrain': { lat: 26.0667, lon: 50.5577 },
'Lebanon': { lat: 33.8547, lon: 35.8623 },
'Syria': { lat: 34.8021, lon: 38.9968 },
'Georgia': { lat: 42.3154, lon: 43.3569 },
'Armenia': { lat: 40.0691, lon: 45.0382 },
'Azerbaijan': { lat: 40.1431, lon: 47.5769 },

// Africa (remaining)
'Botswana': { lat: -22.3285, lon: 24.6849 },
'Namibia': { lat: -22.9576, lon: 18.4904 },
'Malawi': { lat: -13.2543, lon: 34.3015 },
'Burundi': { lat: -3.3731, lon: 29.9189 },
'Rwanda': { lat: -1.9403, lon: 29.8739 },
'DR Congo': { lat: -4.0383, lon: 21.7587 },
'Republic of the Congo': { lat: -0.2280, lon: 15.8277 },
'Gabon': { lat: -0.8037, lon: 11.6094 },
'Cameroon': { lat: 7.3697, lon: 12.3547 },
'Central African Republic': { lat: 6.6111, lon: 20.9394 },
'Chad': { lat: 15.4542, lon: 18.7322 },
'Sudan': { lat: 12.8628, lon: 30.2176 },
'South Sudan': { lat: 7.3090, lon: 30.7330 },
'Eritrea': { lat: 15.1794, lon: 39.7823 },
'Djibouti': { lat: 11.8251, lon: 42.5903 },
'Somalia': { lat: 5.1521, lon: 46.1996 },
'Libya': { lat: 26.3351, lon: 17.2283 },
'Senegal': { lat: 14.4974, lon: -14.4524 },
'Gambia': { lat: 13.4432, lon: -15.3101 },
'Guinea': { lat: 9.9456, lon: -9.6966 },
'Guinea-Bissau': { lat: 11.8037, lon: -15.1804 },
'Sierra Leone': { lat: 8.4606, lon: -11.7799 },
'Liberia': { lat: 6.4281, lon: -9.4295 },
'Mali': { lat: 17.5707, lon: -3.9962 },
'Niger': { lat: 17.6078, lon: 8.0817 },
'Togo': { lat: 8.6195, lon: 0.8248 },
'Benin': { lat: 9.3077, lon: 2.3158 },
'Burkina Faso': { lat: 12.2383, lon: -1.5616 },
'Cabo Verde': { lat: 16.5388, lon: -23.0418 },
'Madagascar': { lat: -18.7669, lon: 46.8691 },
'São Tomé and Príncipe': { lat: 0.1864, lon: 6.6131 },
'Eswatini': { lat: -26.5225, lon: 31.4659 },
'Lesotho': { lat: -29.6100, lon: 28.2336 },

// Asia (remaining)
'Nepal': { lat: 28.3949, lon: 84.1240 },
'Bhutan': { lat: 27.5142, lon: 90.4336 },
'Sri Lanka': { lat: 7.8731, lon: 80.7718 },
'Mongolia': { lat: 46.8625, lon: 103.8467 },
'Laos': { lat: 19.8563, lon: 102.4955 },
'Cambodia': { lat: 12.5657, lon: 104.9910 },
'Brunei': { lat: 4.5353, lon: 114.7277 },
'East Timor': { lat: -8.8742, lon: 125.7275 },
'Maldives': { lat: 3.2028, lon: 73.2207 },
'Taiwan': { lat: 23.6978, lon: 120.9605 },

// Oceania (remaining)
'Papua New Guinea': { lat: -6.3149, lon: 143.9555 },
'Fiji': { lat: -17.7134, lon: 178.0650 },
'Samoa': { lat: -13.7590, lon: -172.1046 },
'Tonga': { lat: -21.1790, lon: -175.1982 },
'Vanuatu': { lat: -15.3767, lon: 166.9592 },
'Solomon Islands': { lat: -9.6457, lon: 160.1562 },
'Kiribati': { lat: 1.8709, lon: -157.3630 },
'Micronesia': { lat: 7.4256, lon: 150.5508 },
'Marshall Islands': { lat: 7.1315, lon: 171.1845 },
'Palau': { lat: 7.5150, lon: 134.5825 },
'Nauru': { lat: -0.5228, lon: 166.9315 },
'Tuvalu': { lat: -7.1095, lon: 177.6493 },


  'Belgium': { lat: 50.5039, lon: 4.4699 },
  'Switzerland': { lat: 46.8182, lon: 8.2275 },
  'Austria': { lat: 47.5162, lon: 14.5501 },
  'Poland': { lat: 51.9194, lon: 19.1451 },
  'Sweden': { lat: 60.1282, lon: 18.6435 },
  'Norway': { lat: 60.4720, lon: 8.4689 },
  'Denmark': { lat: 56.2639, lon: 9.5018 },
  'Finland': { lat: 61.9241, lon: 25.7482 },
  'Ireland': { lat: 53.4129, lon: -8.2439 },
  'Portugal': { lat: 39.3999, lon: -8.2245 },
  'Greece': { lat: 39.0742, lon: 21.8243 },
  'Romania': { lat: 45.9432, lon: 24.9668 },
  'Czechia': { lat: 49.8175, lon: 15.4730 },
  'Hungary': { lat: 47.1625, lon: 19.5033 },
  'Bulgaria': { lat: 42.7339, lon: 25.4858 },
  'Serbia': { lat: 44.0165, lon: 21.0059 },
  'Croatia': { lat: 45.1, lon: 15.2 },
  'Ukraine': { lat: 48.3794, lon: 31.1656 },
  'Russia': { lat: 61.5240, lon: 105.3188 },
  'Vatican City': { lat: 41.9029, lon: 12.4534 },
  'Kosovo': { lat: 42.6026, lon: 20.9030 },
  
  // Asia
  'China': { lat: 35.8617, lon: 104.1954 },
  'India': { lat: 20.5937, lon: 78.9629 },
  'Japan': { lat: 36.2048, lon: 138.2529 },
  'South Korea': { lat: 35.9078, lon: 127.7669 },
  'Indonesia': { lat: -0.7893, lon: 113.9213 },
  'Thailand': { lat: 15.8700, lon: 100.9925 },
  'Vietnam': { lat: 14.0583, lon: 108.2772 },
  'Malaysia': { lat: 4.2105, lon: 101.9758 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Philippines': { lat: 12.8797, lon: 121.7740 },
  'Pakistan': { lat: 30.3753, lon: 69.3451 },
  'Bangladesh': { lat: 23.6850, lon: 90.3563 },
  'Myanmar': { lat: 21.9162, lon: 95.9560 },
  'Saudi Arabia': { lat: 23.8859, lon: 45.0792 },
  'United Arab Emirates': { lat: 23.4241, lon: 53.8478 },
  'Israel': { lat: 31.0461, lon: 34.8516 },
  'Palestine': { lat: 31.9522, lon: 35.2332 },
  'Turkey': { lat: 38.9637, lon: 35.2433 },
  'Iran': { lat: 32.4279, lon: 53.6880 },
  'Iraq': { lat: 33.2232, lon: 43.6793 },
  'Afghanistan': { lat: 33.9391, lon: 67.7100 },
  'Kazakhstan': { lat: 48.0196, lon: 66.9237 },
  
  // Africa
  'Egypt': { lat: 26.8206, lon: 30.8025 },
  'South Africa': { lat: -30.5595, lon: 22.9375 },
  'Nigeria': { lat: 9.0820, lon: 8.6753 },
  'Kenya': { lat: -0.0236, lon: 37.9062 },
  'Ethiopia': { lat: 9.1450, lon: 40.4897 },
  'Morocco': { lat: 31.7917, lon: -7.0926 },
  'Algeria': { lat: 28.0339, lon: 1.6596 },
  'Tunisia': { lat: 33.8869, lon: 9.5375 },
  'Ghana': { lat: 7.9465, lon: -1.0232 },
  "Cote d'Ivoire": { lat: 7.5400, lon: -5.5471 },
  'Tanzania': { lat: -6.3690, lon: 34.8888 },
  'Uganda': { lat: 1.3733, lon: 32.2903 },
  'Cape Verde': { lat: 16.5388, lon: -23.0418 },
  
  // South America
  'Brazil': { lat: -14.2350, lon: -51.9253 },
  'Argentina': { lat: -38.4161, lon: -63.6167 },
  'Chile': { lat: -35.6751, lon: -71.5430 },
  'Colombia': { lat: 4.5709, lon: -74.2973 },
  'Peru': { lat: -9.1900, lon: -75.0152 },
  'Venezuela': { lat: 6.4238, lon: -66.5897 },
  'Ecuador': { lat: -1.8312, lon: -78.1834 },
  
  // Oceania
  'Australia': { lat: -25.2744, lon: 133.7751 },
  'New Zealand': { lat: -40.9006, lon: 174.8860 },
  
  // Central America & Caribbean
  'Cuba': { lat: 21.5218, lon: -77.7812 },
  'Jamaica': { lat: 18.1096, lon: -77.2975 },
  'Dominican Republic': { lat: 18.7357, lon: -70.1627 },
  'Costa Rica': { lat: 9.7489, lon: -83.7534 },
  'Panama': { lat: 8.5380, lon: -80.7821 },
  // Central America (remaining)
'Guatemala': { lat: 15.7835, lon: -90.2308 },
'El Salvador': { lat: 13.7942, lon: -88.8965 },
'Honduras': { lat: 15.2000, lon: -86.2419 },
'Nicaragua': { lat: 12.8654, lon: -85.2072 },
'Belize': { lat: 17.1899, lon: -88.4976 },

// Caribbean (remaining)
'Haiti': { lat: 18.9712, lon: -72.2852 },
'Trinidad and Tobago': { lat: 10.6918, lon: -61.2225 },
'Barbados': { lat: 13.1939, lon: -59.5432 },
'Bahamas': { lat: 25.0343, lon: -77.3963 },
'Antigua and Barbuda': { lat: 17.0608, lon: -61.7964 },
'Saint Kitts and Nevis': { lat: 17.3578, lon: -62.7830 },
'Saint Lucia': { lat: 13.9094, lon: -60.9789 },
'Saint Vincent and the Grenadines': { lat: 12.9843, lon: -61.2872 },
'Grenada': { lat: 12.1165, lon: -61.6790 },
'Dominica': { lat: 15.4150, lon: -61.3710 },

// South America (remaining)
'Bolivia': { lat: -16.2902, lon: -63.5887 },
'Paraguay': { lat: -23.4425, lon: -58.4438 },
'Uruguay': { lat: -32.5228, lon: -55.7658 },
'Guyana': { lat: 4.8604, lon: -58.9302 },
'Suriname': { lat: 3.9193, lon: -56.0278 },

// Middle East (remaining)
'Cyprus': { lat: 35.1264, lon: 33.4299 },  // already fixed; okay if you keep once

// South Asia (remaining)
'Maldives': { lat: 3.2028, lon: 73.2207 },
'Bhutan': { lat: 27.5142, lon: 90.4336 },

// Central Asia (remaining)
'Kyrgyzstan': { lat: 41.2044, lon: 74.7661 },
'Tajikistan': { lat: 38.8610, lon: 71.2761 },
'Turkmenistan': { lat: 38.9697, lon: 59.5563 },
'Uzbekistan': { lat: 41.3775, lon: 64.5853 },

// Oceania (remaining microstates)
'New Caledonia': { lat: -20.9043, lon: 165.6180 },       // not sovereign but often included
'French Polynesia': { lat: -17.6797, lon: -149.4068 },   // same as above
'Equatorial Guinea': { lat: 1.6508, lon: 10.2679 },

'St. Vincent & The Grenadines': { lat: 12.9843, lon: -61.2872 },

// "Ivory Coast": { lat: 7.5400, lon: -5.5471 },   // You already had this one, but here it is cleanly

'Congo': { lat: -0.2280, lon: 15.8277 },  
// Note: "Congo" is ambiguous — this one is the smaller, western Congo.
// DR Congo is already in your list with its own coords.

'Korea South': { lat: 35.9078, lon: 127.7669 },  
// Matches your existing naming 'South Korea'

'Malta': { lat: 35.9375, lon: 14.3754 },

'Macedonia': { lat: 41.6086, lon: 21.7453 },  
// You already included this as 'North Macedonia'

};

// Normalize country name
function normalizeCountryName(countryName) {
  if (!countryName) return null;
  
  // Check if there's a direct mapping
  if (COUNTRY_NAME_MAPPINGS[countryName]) {
    return COUNTRY_NAME_MAPPINGS[countryName];
  }
  
  // Return as-is if it exists in coordinates
  if (COUNTRY_COORDINATES[countryName]) {
    return countryName;
  }
  
  // Try to find partial match
  const lowerName = countryName.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_NAME_MAPPINGS)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return countryName;
}

// Get country coordinates with fallback
export function getCountryCoordinates(countryName) {
  const normalizedName = normalizeCountryName(countryName);
  
  // Return coordinates if found
  if (normalizedName && COUNTRY_COORDINATES[normalizedName]) {
    return COUNTRY_COORDINATES[normalizedName];
  }
  
  // Fallback for unknown countries - place in Atlantic Ocean with a note
  console.warn(`Country coordinates not found for: "${countryName}" (normalized: "${normalizedName}")`);
  return {
    lat: null,
    lon: null,
    _unknown: true
  };
}

// Tool normalization map
const TOOL_ALIASES = {
    'chatgpt': 'ChatGPT', 'chat gpt': 'ChatGPT', 'chat-gpt': 'ChatGPT', 'chat_gpt': 'ChatGPT',
    'claude': 'Claude', 'claude ai': 'Claude', 'anthropic claude': 'Claude',
    'gemini': 'Gemini', 'bard': 'Gemini', 'google bard': 'Gemini',
    'copilot': 'Copilot', 'co-pilot': 'Copilot', 'co pilot': 'Copilot', 'bing chat': 'Copilot', 'bingchat': 'Copilot',
    'perplexity': 'Perplexity', 'perplexity ai': 'Perplexity',
    "google's ai studio models": 'Google AI Studio', 'googlesaistudiomodels': 'Google AI Studio',
    'grok': 'Grok', 'grok beta': 'Grok',
    'black box': 'Black Box', 'blackbox': 'Black Box',
};

/**
 * Normalize AI tool names to standard format
 */
export const normalizeTool = (tool) => {
    if (!tool || tool === 'None') return null;
    const cleaned = String(tool).trim();
    if (!cleaned) return null;
    const lower = cleaned.toLowerCase();

    if (TOOL_ALIASES[lower]) return TOOL_ALIASES[lower];

    // Check partial matches for keys in aliases
    const sortedEntries = Object.entries(TOOL_ALIASES).sort((a, b) => b[0].length - a[0].length);
    for (const [key, value] of sortedEntries) {
        if (lower.includes(key)) return value;
    }

    // Capitalize words if no alias found
    if (cleaned === cleaned.toLowerCase() || cleaned === cleaned.toUpperCase()) {
        return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return cleaned;
};
