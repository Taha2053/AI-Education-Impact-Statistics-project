import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/Layout';
import { DataProvider } from './context/DataContext';
import Overview from './pages/Overview';

import GlobalAnalysis from './pages/GlobalAnalysis';
import Performance from './pages/Performance';
import StudyHabits from './pages/StudyHabits';
import AIInsights from './pages/AIInsights';

function App() {
    const [currentView, setCurrentView] = useState('overview');

    const renderView = () => {
        switch (currentView) {
            case 'overview': return <Overview />;
            case 'global': return <GlobalAnalysis />;
            case 'performance': return <Performance />;
            case 'habits': return <StudyHabits />;
            case 'ai': return <AIInsights />;
            default: return <Overview />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <DataProvider>
                <Layout currentView={currentView} onViewChange={setCurrentView}>
                    {renderView()}
                </Layout>
            </DataProvider>
        </ThemeProvider>
    );
}

export default App;
