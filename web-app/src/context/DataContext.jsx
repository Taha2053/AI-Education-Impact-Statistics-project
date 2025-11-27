import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load data');
                }
                return response.json();
            })
            .then(jsonData => {
                setData(jsonData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <DataContext.Provider value={{ data, loading, error }}>
            {children}
        </DataContext.Provider>
    );
}
