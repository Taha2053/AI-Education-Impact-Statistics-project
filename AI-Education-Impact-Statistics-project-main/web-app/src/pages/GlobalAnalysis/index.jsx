import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
// Importez les icônes nécessaires
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// NOTE: Vous aurez besoin de mettre à jour votre composant StatCard.jsx
// J'ai inclus une version simple de StatCard pour que ce code fonctionne
// Si vous n'avez pas encore StatCard.jsx, utilisez ce code ci-dessous.

// --- DÉBUT DU STATCARD SIMPLIFIÉ POUR L'EXEMPLE ---
// (Remplacez ceci par votre vrai composant StatCard si vous l'avez)
const StatCard = ({ title, value, color, icon, change }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 2,
      boxShadow: 6, // Augmentation de l'ombre
      borderLeft: `5px solid ${color}`, // Bande de couleur latérale
      height: "100%",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          color: color,
          fontSize: 40,
          opacity: 0.8,
        }}
      >
        {icon}
      </Box>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
      <TrendingUpIcon
        fontSize="small"
        color={change > 0 ? "success" : "error"}
      />
      <Typography
        variant="caption"
        color={change > 0 ? "success.main" : "error.main"}
        fontWeight="bold"
      >
        {change}% vs last month
      </Typography>
    </Stack>
  </Paper>
);
// --- FIN DU STATCARD SIMPLIFIÉ ---

export default function GlobalAnalysis() {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.grey[50] }}>
      {/* TITRE ET INTRO
      */}
      <Typography variant="h3" fontWeight={700} gutterBottom color="text.primary">
        🌍 Impact Global de l'Éducation IA
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Aperçu des statistiques d'apprentissage et de l'adoption des outils IA.
      </Typography>
      <Divider sx={{ mb: 4, mt: 2 }} />

      {/* 1. CARTES DE STATISTIQUES PRINCIPALES
      */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value="12,458"
            color={theme.palette.primary.main}
            icon={<SchoolIcon fontSize="inherit" />}
            change={4.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Study Hours"
            value="6.8h/semaine"
            color={theme.palette.success.main}
            icon={<AccessTimeIcon fontSize="inherit" />}
            change={-1.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Usage Rate"
            value="78%"
            color={theme.palette.warning.main}
            icon={<SmartToyIcon fontSize="inherit" />}
            change={8.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Global Pass Rate"
            value="94.2%"
            color={theme.palette.error.main}
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            change={0.7}
          />
        </Grid>
      </Grid>

      {/* 2. ZONE DE GRAPHIQUES ET VISUALISATIONS
      */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 6, mb: 3 }}>
        📈 Tendances et Visualisations
      </Typography>
      <Grid container spacing={4}>
        {/* GRAPHIQUE 1 : Taux d'Utilisation de l'IA par temps */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 4, height: 400, borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" gutterBottom>
              Taux d'Adoption de l'IA (Annuel)
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme.palette.grey[400] }}>
                [Placeholder: Graphique à Barres/Lignes ici]
            </Box>
          </Paper>
        </Grid>

        {/* GRAPHIQUE 2 : Répartition des Heures d'Étude */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 4, height: 400, borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des Scores vs. Utilisation IA
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme.palette.grey[400] }}>
                [Placeholder: Graphique de Dispersion/Nuage de Points ici]
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 3. RÉSUMÉ DES TENDANCES CLÉS
      */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 6, mb: 3 }}>
        ✨ Faits Saillants et Insights Clés
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6, bgcolor: theme.palette.primary.light }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white" fontWeight="bold">
              Productivité Améliorée
            </Typography>
            <Typography color="white" sx={{ opacity: 0.9 }}>
              • Les étudiants utilisant les outils IA obtiennent un score moyen **18% supérieur** à leurs pairs.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white" fontWeight="bold">
              Heures de Pointe
            </Typography>
            <Typography color="white" sx={{ opacity: 0.9 }}>
              • Le pic d'activité d'étude est enregistré entre **20h00 et 23h00** (Heure locale).
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white" fontWeight="bold">
              Focus Géographique
            </Typography>
            <Typography color="white" sx={{ opacity: 0.9 }}>
              • Les trois pays ayant le plus grand nombre d'utilisateurs sont : **USA, Inde et Nigeria**.
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* 4. PIED DE PAGE
      */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Dernière mise à jour : 03 Décembre 2025
        </Typography>
        <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
          <CheckCircleOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Page d'analyse globale chargée avec succès !
        </Typography>
      </Box>
    </Box>
  );
}