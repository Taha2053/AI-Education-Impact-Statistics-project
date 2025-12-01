import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, LayoutDashboard, Globe, BarChart2, BookOpen, BrainCircuit, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

const MENU_ITEMS = [
    { text: 'Overview', icon: <LayoutDashboard size={20} />, id: 'overview' },
    { text: 'Global Analysis', icon: <Globe size={20} />, id: 'global' },
    { text: 'Performance', icon: <BarChart2 size={20} />, id: 'performance' },
    { text: 'Study Habits', icon: <BookOpen size={20} />, id: 'habits' },
    { text: 'AI Insights', icon: <BrainCircuit size={20} />, id: 'ai' },
    { text: 'Assistance', icon: <MessageSquare size={20} />, id: 'assistance' },
];

export default function Layout({ children, currentView, onViewChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
        }}>
            {/* Logo Section */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    boxShadow: '0 4px 12px rgba(150, 111, 255, 0.3)'
                }}>
                    <BrainCircuit size={24} />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        AI Study
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        AI Education Impact Statistics
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
                {MENU_ITEMS.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={currentView === item.id}
                            onClick={() => {
                                onViewChange(item.id);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                '&.Mui-selected': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: currentView === item.id ? 600 : 500,
                                    fontSize: '0.95rem'
                                }}
                            />
                            {currentView === item.id && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '10%',
                                        bottom: '10%',
                                        width: '3px',
                                        backgroundColor: theme.palette.primary.main,
                                        borderTopRightRadius: '4px',
                                        borderBottomRightRadius: '4px',
                                    }}
                                />
                            )}
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
                    bgcolor: 'rgba(23, 23, 23, 0.8)', // Glass effect
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    zIndex: theme.zIndex.drawer + 1,
                    transition: 'all 0.3s ease'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Breadcrumbs / Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <LayoutDashboard size={18} />
                            <ChevronRight size={16} />
                            <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {MENU_ITEMS.find(item => item.id === currentView)?.text || 'Dashboard'}
                            </Typography>
                        </Box>
                    </Box>
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
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: '100vh',
                    position: 'relative'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}
