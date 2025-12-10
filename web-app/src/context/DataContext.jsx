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
                const response = await fetch('/unified_students.json');

                if (!response.ok) {
                    throw new Error('Failed to load data');
                }

                setLoadingProgress(30);
                const jsonData = await response.json();
                setLoadingProgress(70);

                // Validate data structure - unified_students.json is a flat array
                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid data structure');
                }

                setLoadingProgress(90);
                // Wrap the array in an object for consistency with existing code
                setData({ students: jsonData });
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

    return (
        <DataContext.Provider value={{
            data,
            loading,
            loadingProgress,
            error,
            // Expose commonly used data subsets
            students: data?.students || [],
            metadata: data?.metadata || {},
            globalCorrelations: data?.global_correlations || {},
            countrySummaries: data?.country_summaries || []
        }}>
            {children}
        </DataContext.Provider>
    );
}
