import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { DataProvider } from './context/DataContext';
import GlobalAnalysis from './pages/GlobalAnalysis';  // ← ta page

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <GlobalAnalysis />
      </DataProvider>
    </ThemeProvider>
  );
}