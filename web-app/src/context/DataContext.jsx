import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingProgress(10);
                const response = await fetch('/the_final_generated_data.json');

                if (!response.ok) {
                    throw new Error('Failed to load data');
                }

                setLoadingProgress(30);
                const rawData = await response.json();
                setLoadingProgress(50);

                // --- DATA VALIDATION & NORMALIZATION ---
                if (!Array.isArray(rawData)) {
                    throw new Error('Invalid data structure: Expected specific JSON array');
                }

                // flatten the nested structure
                const students = rawData.map(item => ({
                    id: item.id,
                    source_file: item.source_file,
                    // Demographics
                    country: item.demographics?.country,
                    region: item.demographics?.region,
                    age: item.demographics?.age,
                    gender: item.demographics?.gender,
                    // Education
                    university: item.education?.university,
                    level: item.education?.level,
                    major: item.education?.major,
                    field_of_study: item.education?.major, // Map major to field_of_study for compatibility
                    gpa: item.education?.gpa,
                    study_hours_per_week: item.education?.study_hours_weekly,
                    // AI Usage
                    uses_ai: item.ai_usage?.uses_ai,
                    ai_usage_frequency: item.ai_usage?.frequency,
                    ai_tools: item.ai_usage?.tools || [],
                    ai_usage_hours: item.ai_usage?.hours_weekly,
                    ai_purpose: item.ai_usage?.primary_purpose || [],
                    ai_impact: item.ai_usage?.impact_on_grades,
                    // Psychometrics
                    stress_level: item.psychometrics?.stress_level,
                    satisfaction_score: item.psychometrics?.satisfaction_score,
                    concerns: item.psychometrics?.concerns || []
                }));

                setLoadingProgress(70);

                // --- DYNAMIC CALCULATION OF SUMMARIES ---

                // Helper to calculate average
                const calcAvg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

                // Helper for correlation
                const calcCorr = (x, y) => {
                    if (!x.length || x.length !== y.length) return 0;
                    const n = x.length;
                    const sumX = x.reduce((a, b) => a + b, 0);
                    const sumY = y.reduce((a, b) => a + b, 0);
                    const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
                    const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
                    const sumY2 = y.reduce((a, yi) => a + yi * yi, 0);
                    const numerator = n * sumXY - sumX * sumY;
                    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
                    return denominator === 0 ? 0 : numerator / denominator;
                };

                // 1. Country Summaries
                const uniqueCountries = [...new Set(students.map(s => s.country))];
                const countrySummaries = uniqueCountries.map(country => {
                    const countryStudents = students.filter(s => s.country === country);
                    const validGpa = countryStudents.filter(s => s.gpa != null).map(s => s.gpa);
                    const validAiHours = countryStudents.filter(s => s.ai_usage_hours != null).map(s => s.ai_usage_hours);

                    return {
                        country: country,
                        student_count: countryStudents.length,
                        avg_gpa: calcAvg(validGpa),
                        avg_ai_usage_hours: calcAvg(validAiHours),
                        avg_stress: calcAvg(countryStudents.filter(s => s.stress_level != null).map(s => s.stress_level)),
                        avg_satisfaction: calcAvg(countryStudents.filter(s => s.satisfaction_score != null).map(s => s.satisfaction_score))
                    };
                }).sort((a, b) => b.student_count - a.student_count);

                // Also add a "Global" summary
                countrySummaries.push({
                    country: 'Global',
                    student_count: students.length,
                    avg_gpa: calcAvg(students.filter(s => s.gpa != null).map(s => s.gpa)),
                    avg_ai_usage_hours: calcAvg(students.filter(s => s.ai_usage_hours != null).map(s => s.ai_usage_hours)),
                });

                // 2. Global Correlations
                const validGpaAi = students.filter(s => s.gpa != null && s.ai_usage_hours != null);
                const validStressAi = students.filter(s => s.stress_level != null && s.ai_usage_hours != null);
                const validGpaStress = students.filter(s => s.gpa != null && s.stress_level != null);
                const validSatAi = students.filter(s => s.satisfaction_score != null && s.ai_usage_hours != null);

                const globalCorrelations = {
                    gpa_vs_ai_usage: {
                        correlation: calcCorr(validGpaAi.map(s => s.gpa), validGpaAi.map(s => s.ai_usage_hours)),
                        sample_size: validGpaAi.length
                    },
                    stress_vs_ai_usage: {
                        correlation: calcCorr(validStressAi.map(s => s.stress_level), validStressAi.map(s => s.ai_usage_hours)),
                        sample_size: validStressAi.length
                    },
                    gpa_vs_stress: {
                        correlation: calcCorr(validGpaStress.map(s => s.gpa), validGpaStress.map(s => s.stress_level)),
                        sample_size: validGpaStress.length
                    },
                    satisfaction_vs_ai_usage: {
                        correlation: calcCorr(validSatAi.map(s => s.satisfaction_score), validSatAi.map(s => s.ai_usage_hours)),
                        sample_size: validSatAi.length
                    }
                };

                // 3. Metadata
                const metadata = {
                    total_students: students.length,
                    countries: uniqueCountries,
                    date_processed: new Date().toLocaleDateString()
                };

                setLoadingProgress(90);
                setData({
                    students: students,
                    country_summaries: countrySummaries,
                    global_correlations: globalCorrelations,
                    metadata: metadata
                });
                setLoadingProgress(100);
                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const value = React.useMemo(() => ({
        data,
        loading,
        loadingProgress,
        error,
        // Expose commonly used data subsets
        students: data?.students || [],
        metadata: data?.metadata || {},
        globalCorrelations: data?.global_correlations || {},
        countrySummaries: data?.country_summaries || []
    }), [data, loading, loadingProgress, error]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
