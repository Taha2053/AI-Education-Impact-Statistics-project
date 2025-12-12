import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Avatar } from '@mui/material';
import { Menu as MenuIcon, LayoutDashboard, Globe, BarChart2, BookOpen, BrainCircuit, ChevronRight, MessageSquare, Zap } from 'lucide-react';
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
            bgcolor: 'rgba(10, 10, 20, 0.4)', // Semi-transparent
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
            {/* Logo Section */}
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    p: 1,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: '#000',
                    display: 'flex',
                    boxShadow: `0 0 20px ${theme.palette.primary.main}60`
                }}>
                    <BrainCircuit size={28} strokeWidth={2.5} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
                        STATS-<span style={{ color: theme.palette.primary.main }}>AI</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600  }}>
                        Statistical Study: The Impact of AI on Students
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
                {MENU_ITEMS.map((item) => {
                    const active = currentView === item.id;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                selected={active}
                                onClick={() => {
                                    onViewChange(item.id);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        color: '#fff',
                                        transform: 'translateX(4px)'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 44, color: active ? theme.palette.primary.main : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 700 : 500,
                                        fontSize: '0.95rem',
                                        letterSpacing: '0.02em'
                                    }}
                                />
                                {active && (
                                    <motion.div
                                        layoutId="glow"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            right: 0,
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}10, transparent)`,
                                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' /* Body handles bg */ }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'rgba(3, 0, 20, 0.2)', // Mostly transparent
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    boxShadow: 'none',
                    zIndex: theme.zIndex.drawer + 1,
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
                            <Zap size={16} color={theme.palette.warning.main} />
                            <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {MENU_ITEMS.find(item => item.id === currentView)?.text || 'Dashboard'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Add Top Actions here if needed */}
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
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', bgcolor: 'transparent' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', bgcolor: 'transparent' },
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
                    p: { xs: 2, md: 4 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: '100vh',
                    position: 'relative'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(2px)' }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}
