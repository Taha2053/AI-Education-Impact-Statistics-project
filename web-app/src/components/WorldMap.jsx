import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { getCountryCoordinates } from '../utils/dataUtils';

export default function WorldMap({ countrySummaries, selectedCountry, onCountryClick }) {
    const theme = useTheme();

    const mapData = useMemo(() => {
        if (!countrySummaries || countrySummaries.length === 0) return [];

        const lats = [];
        const lons = [];
        const texts = [];
        const markers = [];
        const sizes = [];
        const values = [];

        countrySummaries.forEach((country) => {
            if (country.country === 'Global') return;

            const coords = getCountryCoordinates(country.country);
            lats.push(coords.lat);
            lons.push(coords.lon);

            const gpaText = country.avg_gpa !== null && !isNaN(country.avg_gpa) ? country.avg_gpa.toFixed(2) : 'N/A';
            const aiText = country.avg_ai_usage_hours !== null && !isNaN(country.avg_ai_usage_hours) ? country.avg_ai_usage_hours.toFixed(1) + 'h' : 'N/A';

            texts.push(
                `<b>${country.country}</b><br>` +
                `Students: ${country.student_count.toLocaleString()}<br>` +
                `Avg GPA: ${gpaText}<br>` +
                `AI Usage: ${aiText}/week`
            );

            markers.push(country.country);
            sizes.push(Math.log(country.student_count + 1) * 8 + 10);
            values.push(country.avg_ai_usage_hours || 0);
        });

        return [{
            type: 'scattergeo',
            mode: 'markers',
            lat: lats,
            lon: lons,
            text: texts,
            textposition: 'top center',
            hovertemplate: '%{text}<extra></extra>',
            marker: {
                size: sizes,
                color: values,
                colorscale: [
                    [0, theme.palette.primary.main],
                    [0.5, theme.palette.secondary.main],
                    [1, theme.palette.error.main]
                ],
                colorbar: {
                    title: 'AI Usage<br>(hrs/week)',
                    thickness: 15,
                    len: 0.5,
                    x: 1.02,
                    tickfont: { color: theme.palette.text.secondary },
                    titlefont: { color: theme.palette.text.secondary },
                    bgcolor: 'rgba(0,0,0,0)'
                },
                line: {
                    width: 2,
                    color: '#fff'
                },
                opacity: 0.8,
                symbol: 'circle'
            },
            name: 'Countries',
            customdata: markers,
        }];
    }, [countrySummaries, selectedCountry, theme]);

    return (
        <Box sx={{ height: '100%', width: '100%', borderRadius: 4, overflow: 'hidden' }}>
            <Plot
                data={mapData}
                layout={{
                    geo: {
                        projection: {
                            type: 'natural earth',
                            scale: 1.15
                        },
                        bgcolor: 'rgba(0,0,0,0)',
                        showland: true,
                        landcolor: '#0f172a', // Dark blue-grey
                        showcountries: true,
                        countrycolor: '#1e293b', // Slightly lighter border
                        showocean: false,
                        showframe: false,
                        showcoastlines: true,
                        coastlinecolor: '#1e293b',
                        center: { lat: 20, lon: 0 },
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    showlegend: false,
                    margin: { t: 0, r: 0, l: 0, b: 0 },
                    font: {
                        color: theme.palette.text.primary,
                        family: 'Inter, sans-serif'
                    },
                    autosize: true,
                }}
                config={{
                    displayModeBar: false,
                    responsive: true,
                    scrollZoom: true
                }}
                style={{ width: '100%', height: '100%' }}
                onClick={(event) => {
                    if (event.points && event.points[0] && event.points[0].customdata) {
                        if (onCountryClick) {
                            onCountryClick(event.points[0].customdata);
                        }
                    }
                }}
            />
        </Box>
    );
}
