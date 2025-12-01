import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#966fffff', // Zinc 50
            light: '#f4f4f5',
            dark: '#e4e4e7',
            contrastText: '#18181b', // Zinc 900
        },
        secondary: {
            main: '#27272a', // Zinc 800
            light: '#3f3f46',
            dark: '#18181b',
            contrastText: '#fafafa',
        },
        background: {
            default: '#171717', // Zinc 950
            paper: '#262626', // Zinc 950
        },
        text: {
            primary: '#fafafa', // Zinc 50
            secondary: '#a1a1aa', // Zinc 400
        },
        divider: '#27272a',
        // Custom gradients
        gradients: {
            primary: 'linear-gradient(135deg, #fafafa 0%, #d4d4d8 100%)',
            dark: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
            glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            glow: 'radial-gradient(circle at center, rgba(250, 250, 250, 0.1) 0%, transparent 70%)',
        },
    },
    typography: {
        fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#09090b',
                    borderRadius: 16,
                    border: '1px solid #27272a',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.3)',
                        borderColor: '#3f3f46',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                    transition: 'all 0.2s ease-in-out',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(250, 250, 250, 0.15)',
                        transform: 'translateY(-1px)',
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: 'rgba(250, 250, 250, 0.05)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0b0b09ff',
                    scrollbarColor: '#27272a #09090b',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: '#09090b',
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: '#27272a',
                        minHeight: 24,
                        border: '2px solid #09090b',
                    },
                    '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                        backgroundColor: '#52525b',
                    },
                    '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
                        backgroundColor: '#52525b',
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#52525b',
                    },
                    '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
                        backgroundColor: '#09090b',
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#fafafa',
                        color: '#18181b',
                        '&:hover': {
                            backgroundColor: '#f4f4f5',
                        },
                        '& .lucide': {
                            color: '#18181b',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
