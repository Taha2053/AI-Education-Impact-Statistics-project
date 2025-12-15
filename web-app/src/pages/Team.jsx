import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  useTheme,
  Button
} from '@mui/material';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Team members data with specific positions
const teamMembersData = [
  { id: 1, name: 'Jarraya Ahmed', image: '/team/member8.jpg', position: 'GK' },
  { id: 2, name: 'Rachdi Malek', image: '/team/member5.jpg', position: 'LB' },
  { id: 3, name: 'Najjar Selim', image: '/team/member9.jpg', position: 'CB1' },
  { id: 4, name: 'Teyeb Yossri', image: '/team/member3.jpg', position: 'CB2' },
  { id: 5, name: 'Belghith Farah', image: '/team/membre10.png', position: 'RB' },
  { id: 6, name: 'Aissa Rayhane', image: '/team/member6.jpg', position: 'CDM' },
  { id: 7, name: 'Khalfallah Almouthana Taha', image: '/team/member2.jpg', position: 'CM1' },
  { id: 8, name: 'Dhrif Eya', image: '/team/member1.jpg', position: 'CM2' },
  { id: 9, name: 'Kammoun Rami', image: '/team/member7.jpg', position: 'LW' },
  { id: 10, name: 'Barhoumi Aziz', image: '/team/member12.jpg', position: 'ST' },
  { id: 11, name: 'Moueddeb Salma', image: '/team/member4.jpg', position: 'RW' },
  { id: 12, name: 'Darchem Zaineb', image: '/team/membre11.jpeg', position: 'COACH' },
];

// Football positions mapping (4-3-3 formation)
const footballPositions = {
  GK: { name: 'Goalkeeper', top: '85%', left: '50%' },
  LB: { name: 'Left Back', top: '70%', left: '20%' },
  CB1: { name: 'Center Back', top: '75%', left: '40%' },
  CB2: { name: 'Center Back', top: '75%', left: '60%' },
  RB: { name: 'Right Back', top: '70%', left: '80%' },
  CDM: { name: 'Defensive Mid', top: '55%', left: '50%' },
  CM1: { name: 'Central Mid', top: '45%', left: '35%' },
  CM2: { name: 'Central Mid', top: '45%', left: '65%' },
  LW: { name: 'Left Wing', top: '25%', left: '25%' },
  ST: { name: 'Striker', top: '20%', left: '50%' },
  RW: { name: 'Right Wing', top: '25%', left: '75%' },
  COACH: { name: 'Coach', top: '8%', left: '12%' }
};

export default function Team() {
  const theme = useTheme();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(-1);
  const [showFullTeam, setShowFullTeam] = useState(false);
  const animationRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setTeamMembers(teamMembersData);
    // Create audio element
    audioRef.current = new Audio('/team/champions_league.mp3'); // Replace with your audio file path
    audioRef.current.loop = true;
    
    return () => {
      // Cleanup audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (showAnimation && currentPlayerIndex < 12) {
      const timer = setTimeout(() => {
        setCurrentPlayerIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (showAnimation && currentPlayerIndex === 12) {
      const timer = setTimeout(() => {
        setShowFullTeam(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, currentPlayerIndex]);

  const handleTeamClick = () => {
    setShowAnimation(true);
    setCurrentPlayerIndex(0);
    setShowFullTeam(false);
    
    // Play Champions League music
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Start from beginning
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
    
    setTimeout(() => {
      animationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setShowAnimation(false);
    setCurrentPlayerIndex(-1);
    setShowFullTeam(false);
    
    // Stop the music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (id) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      '#00D9FF',
      '#FF6B9D',
      '#C084FC',
      '#34D399',
      '#FBBF24',
      '#60A5FA',
      '#F472B6'
    ];
    return colors[(id - 1) % colors.length];
  };

  const getPositionKey = (index) => {
    return teamMembers[index]?.position || 'GK';
  };

  return (
    <Box sx={{ pb: 5, maxWidth: '100%', width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ mb: 1 }}>
            Our Team
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            The dedicated team that worked on this project
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleTeamClick}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 30px ${theme.palette.primary.main}60`,
            }
          }}
        >
          ⚽ TEAM FORMATION
        </Button>
      </Box>

      {/* Football Formation Animation */}
      <AnimatePresence>
        {showAnimation && (
          <Box ref={animationRef} sx={{ mb: 6 }}>
            {!showFullTeam ? (
              // Individual player reveal
              <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative'
              }}>
                <AnimatePresence mode="wait">
                  {currentPlayerIndex < 12 && teamMembers[currentPlayerIndex] && (
                    <motion.div
                      key={currentPlayerIndex}
                      initial={{ opacity: 0, scale: 0.5, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -50 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 6,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          border: `3px solid ${getColor(teamMembers[currentPlayerIndex].id)}`,
                          backdropFilter: 'blur(20px)',
                          textAlign: 'center',
                          minWidth: 400,
                          boxShadow: `0 20px 60px ${getColor(teamMembers[currentPlayerIndex].id)}60`
                        }}
                      >
                        <Typography 
                          variant="overline" 
                          sx={{ 
                            color: getColor(teamMembers[currentPlayerIndex].id),
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: 2
                          }}
                        >
                          {footballPositions[getPositionKey(currentPlayerIndex)].name}
                        </Typography>
                        <Avatar
                          src={teamMembers[currentPlayerIndex].image}
                          alt={teamMembers[currentPlayerIndex].name}
                          sx={{
                            width: 160,
                            height: 160,
                            margin: '20px auto',
                            bgcolor: getColor(teamMembers[currentPlayerIndex].id),
                            color: '#fff',
                            fontSize: '3rem',
                            fontWeight: 700,
                            boxShadow: `0 10px 40px ${getColor(teamMembers[currentPlayerIndex].id)}60`,
                            border: `4px solid ${getColor(teamMembers[currentPlayerIndex].id)}`,
                          }}
                        >
                          {getInitials(teamMembers[currentPlayerIndex].name)}
                        </Avatar>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            mt: 2,
                            fontWeight: 700,
                            color: '#fff'
                          }}
                        >
                          {teamMembers[currentPlayerIndex].name}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mt: 1,
                            color: 'text.secondary'
                          }}
                        >
                          {teamMembers[currentPlayerIndex].position === 'ST' ? '#10' : `#${currentPlayerIndex + 1}`}
                        </Typography>
                      </Paper>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ) : (
              // Full team on field
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      zIndex: 10,
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Reset
                  </Button>
                  <Typography 
                    variant="h3" 
                    align="center" 
                    sx={{ 
                      mb: 4,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Formation 4-3-3
                  </Typography>
                </Box>
                
                {/* Football Field */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 900,
                    margin: '0 auto',
                    paddingTop: '140%',
                    background: 'linear-gradient(180deg, #0a2f1a 0%, #1a4d2e 20%, #2d6f45 50%, #1a4d2e 80%, #0a2f1a 100%)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.3)',
                    border: '3px solid #4a7c59',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: `
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 8.33%,
                          rgba(255,255,255,0.03) 8.33%,
                          rgba(255,255,255,0.03) 16.66%
                        )
                      `,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  {/* Center line */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 10%, rgba(255,255,255,0.6) 90%, transparent)',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                  }} />
                  
                  {/* Center circle */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '140px',
                    height: '140px',
                    border: '3px solid rgba(255,255,255,0.6)',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.1)'
                  }} />
                  
                  {/* Center spot */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(255,255,255,0.5)'
                  }} />

                  {/* Top penalty area */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: '30%',
                    right: '30%',
                    height: '18%',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderTop: 'none',
                    boxShadow: '0 0 15px rgba(255,255,255,0.2)'
                  }} />
                  
                  {/* Top goal area */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: '40%',
                    right: '40%',
                    height: '8%',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderTop: 'none',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                  }} />
                  
                  {/* Top penalty arc */}
                  <Box sx={{
                    position: 'absolute',
                    top: '18%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '40px',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderTop: 'none',
                    borderRadius: '0 0 80px 80px',
                    borderTopWidth: 0,
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                  }} />

                  {/* Bottom penalty area */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '30%',
                    right: '30%',
                    height: '18%',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderBottom: 'none',
                    boxShadow: '0 0 15px rgba(255,255,255,0.2)'
                  }} />
                  
                  {/* Bottom goal area */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '40%',
                    right: '40%',
                    height: '8%',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderBottom: 'none',
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                  }} />
                  
                  {/* Bottom penalty arc */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: '18%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '40px',
                    border: '3px solid rgba(255,255,255,0.5)',
                    borderBottom: 'none',
                    borderRadius: '80px 80px 0 0',
                    borderBottomWidth: 0,
                    boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                  }} />

                  {/* Corner arcs */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '30px',
                    height: '30px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '0 0 30px 0'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '30px',
                    height: '30px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderLeft: 'none',
                    borderBottom: 'none',
                    borderRadius: '0 0 0 30px'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '30px',
                    height: '30px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderRadius: '0 30px 0 0'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '30px',
                    height: '30px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderLeft: 'none',
                    borderTop: 'none',
                    borderRadius: '30px 0 0 0'
                  }} />

                  {/* Players positioned absolutely */}
                  <Box sx={{ position: 'absolute', inset: 0 }}>
                    {teamMembers.map((member, index) => {
                      const posKey = member.position;
                      const position = footballPositions[posKey];
                      
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: index * 0.1,
                            type: 'spring',
                            stiffness: 200
                          }}
                          style={{
                            position: 'absolute',
                            top: position.top,
                            left: position.left,
                            transform: 'translate(-50%, -50%)',
                            zIndex: posKey === 'COACH' ? 15 : 5
                          }}
                        >
                          <Box sx={{ 
                            textAlign: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.15)',
                              zIndex: 20
                            }
                          }}>
                            <Avatar
                              src={member.image}
                              alt={member.name}
                              sx={{
                                width: { xs: 60, sm: 70, md: 80 },
                                height: { xs: 60, sm: 70, md: 80 },
                                bgcolor: getColor(member.id),
                                color: '#fff',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                margin: '0 auto 8px',
                                boxShadow: `0 4px 20px ${getColor(member.id)}80`,
                                border: `3px solid ${getColor(member.id)}`,
                              }}
                            >
                              {getInitials(member.name)}
                            </Avatar>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontWeight: 700,
                                color: '#fff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {member.name.split(' ')[member.name.split(' ').length - 1]}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontSize: '0.7rem',
                                color: getColor(member.id),
                                fontWeight: 700,
                                mt: 0.5,
                                bgcolor: 'rgba(0,0,0,0.8)',
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                border: `1px solid ${getColor(member.id)}`
                              }}
                            >
                              {posKey === 'ST' ? '#10' : posKey}
                            </Typography>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </Box>
                </Box>
              </motion.div>
            )}
          </Box>
        )}
      </AnimatePresence>

      {/* Team Grid */}
      <Grid container spacing={3}>
        {teamMembers.length > 0 && teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: getColor(member.id) + '40',
                    boxShadow: `0 8px 32px ${getColor(member.id)}20`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${getColor(member.id)}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: getColor(member.id),
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      boxShadow: `0 4px 20px ${getColor(member.id)}40`,
                      border: `3px solid ${getColor(member.id)}60`,
                      '& img': {
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  >
                    {getInitials(member.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'text.primary'
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      Project Team Member
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Footer note */}
      <Box
        sx={{
          mt: 5,
          p: 3,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
          <Users size={20} color={theme.palette.primary.main} />
          <Typography variant="body2" color="text.secondary">
            A collaborative effort by our team of 12 dedicated members
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}