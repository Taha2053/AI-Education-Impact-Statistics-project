import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  useTheme
} from '@mui/material';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

// Team members data - 12 placeholders for names and images
// Image paths should be relative to the public folder (e.g., '/team/member1.jpg')
// or you can use full URLs for external images
const teamMembersData = [
  { id: 1, name: 'Dhrif Eya', image: '/team/member1.jpg' },
  { id: 2, name: 'Khalfallah Almouthana Taha', image: '/team/member2.jpg' },
  { id: 3, name: 'Teyeb Yossri', image: '/team/member3.jpg' },
  { id: 4, name: 'Moueddeb Salma', image: '/team/member4.jpg' },
  { id: 5, name: 'Rachdi Malek', image: '/team/member5.jpg' },
  { id: 6, name: 'Aissa Rayhane', image: '/team/member6.jpg' },
  { id: 7, name: 'Kammoun Rami', image: '/team/member7.jpg' },
  { id: 8, name: 'Jarraya Ahmed', image: '/team/member8.jpg' },
  { id: 9, name: 'Selim Najjar', image: '/team/member9.jpg' },
  { id: 10, name: 'Belghith Farah', image: '/team/member10.jpg' },
  { id: 11, name: 'Darchem Zaineb', image: '/team/member11.jpg' },
  { id: 12, name: 'Barhoumi Aziz', image: '/team/member12.jpg' },
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid mutating the original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Team() {
  const theme = useTheme();

  // State to hold shuffled team members
  const [teamMembers, setTeamMembers] = useState([]);

  // Shuffle team members when component mounts
  useEffect(() => {
    setTeamMembers(shuffleArray(teamMembersData));
  }, []);

  // Generate initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a color based on the member ID for variety
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

  return (
    <Box sx={{ pb: 5, maxWidth: '100%', width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Our Team
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          The dedicated team that worked on this project
        </Typography>
      </Box>

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

