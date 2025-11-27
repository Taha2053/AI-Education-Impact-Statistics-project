import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, LayoutDashboard, Globe, BarChart2, BookOpen, BrainCircuit } from 'lucide-react';

const drawerWidth = 260;

const MENU_ITEMS = [
    { text: 'Overview', icon: <LayoutDashboard size={20} />, id: 'overview' },
    { text: 'Global Analysis', icon: <Globe size={20} />, id: 'global' },
    { text: 'Performance', icon: <BarChart2 size={20} />, id: 'performance' },
    { text: 'Study Habits', icon: <BookOpen size={20} />, id: 'habits' },
    { text: 'AI Insights', icon: <BrainCircuit size={20} />, id: 'ai' },
];

export default function Layout({ children, currentView, onViewChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Toolbar sx={{ px: 3 }}>
                <BrainCircuit size={28} color={theme.palette.primary.main} style={{ marginRight: 12 }} />
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Study
                </Typography>
            </Toolbar>
            <List sx={{ px: 2, py: 2 }}>
                {MENU_ITEMS.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            selected={currentView === item.id}
                            onClick={() => {
                                onViewChange(item.id);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .lucide': {
                                        color: 'white',
                                    }
                                },
                                '& .lucide': {
                                    color: currentView === item.id ? 'white' : theme.palette.text.secondary,
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.default/80',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'none',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
                        {MENU_ITEMS.find(item => item.id === currentView)?.text || 'Dashboard'}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.05)' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.05)' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
            >
                {children}
            </Box>
        </Box>
    );
}
