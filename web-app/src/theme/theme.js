import { createTheme } from '@mui/material/styles';

// --- Color Palette Definitions ---
const colors = {
    background: '#030014', // Deepest Space Black/Purple
    paper: 'rgba(15, 23, 42, 0.6)', // Glassmorphic Dark
    primary: '#00F0FF', // Neon Cyan
    secondary: '#BD00FF', // Neon Purple
    accent: '#FF0055', // Neon Pink
    success: '#00FF94', // Neon Green
    warning: '#FFB800', // Neon Amber
    error: '#FF0033', // Neon Red
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.4)',
    }
};

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: colors.primary,
            light: '#5FFFFF',
            dark: '#00BBC7',
            contrastText: '#000000',
        },
        secondary: {
            main: colors.secondary,
            light: '#F45FFF',
            dark: '#8700CB',
            contrastText: '#FFFFFF',
        },
        background: {
            default: colors.background,
            paper: colors.paper,
        },
        text: colors.text,
        success: { main: colors.success },
        warning: { main: colors.warning },
        error: { main: colors.error },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            hover: 'rgba(0, 240, 255, 0.05)',
            selected: 'rgba(0, 240, 255, 0.1)',
        }
    },
    typography: {
        fontFamily: '"Outfit", "Inter", sans-serif', // Modern, geometric font
        h1: { fontWeight: 800, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600, letterSpacing: '0.01em' },
        button: { textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: colors.background,
                    backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(189, 0, 255, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.15) 0%, transparent 40%)
          `,
                    backgroundAttachment: 'fixed',
                    scrollbarColor: `${colors.secondary} ${colors.background}`,
                    "&::-webkit-scrollbar": { width: '8px' },
                    "&::-webkit-scrollbar-track": { background: colors.background },
                    "&::-webkit-scrollbar-thumb": {
                        background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`,
                        borderRadius: '4px'
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(10, 10, 20, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    transition: 'all 0.3s ease-in-out',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    '&:hover': {
                        borderColor: colors.primary,
                        boxShadow: `0 0 20px -5px ${colors.primary}40`,
                        transform: 'translateY(-4px)',
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    transition: 'all 0.3s ease',
                },
                containedPrimary: {
                    background: `linear-gradient(90deg, ${colors.primary}, #00a8ff)`,
                    color: '#000',
                    boxShadow: `0 0 15px ${colors.primary}60`,
                    '&:hover': {
                        boxShadow: `0 0 25px ${colors.primary}80`,
                        transform: 'scale(1.02)',
                    },
                },
                containedSecondary: {
                    background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent})`,
                    boxShadow: `0 0 15px ${colors.secondary}60`,
                    '&:hover': {
                        boxShadow: `0 0 25px ${colors.secondary}80`,
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                }
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                },
                filled: {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                }
            },
        },
    },
});

export default theme;
