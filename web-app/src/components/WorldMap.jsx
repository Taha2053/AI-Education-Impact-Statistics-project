import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Plot from 'react-plotly.js';
import { getCountryCoordinates } from '../utils/dataUtils';

export default function WorldMap({ countrySummaries, selectedCountry, onCountryClick }) {
    const theme = useTheme();

    const mapData = useMemo(() => {
        if (!countrySummaries || countrySummaries.length === 0) return [];

        // Prepare data for each country
        const lats = [];
        const lons = [];
        const texts = [];
        const markers = [];
        const sizes = [];

        countrySummaries.forEach((country) => {
            if (country.country === 'Global') return; // Skip global entry

            const coords = getCountryCoordinates(country.country);
            lats.push(coords.lat);
            lons.push(coords.lon);

            // Create hover text
            const gpaText = country.avg_gpa !== null && !isNaN(country.avg_gpa)
                ? country.avg_gpa.toFixed(2)
                : 'N/A';
            const aiText = country.avg_ai_usage_hours !== null && !isNaN(country.avg_ai_usage_hours)
                ? country.avg_ai_usage_hours.toFixed(1) + 'h'
                : 'N/A';

            texts.push(
                `<b>${country.country}</b><br>` +
                `Students: ${country.student_count.toLocaleString()}<br>` +
                `Avg GPA: ${gpaText}<br>` +
                `AI Usage: ${aiText}/week`
            );

            markers.push(country.country);

            // Size based on student count (scaled logarithmically for better visualization)
            sizes.push(Math.log(country.student_count + 1) * 5 + 10);
        });

        return [{
            type: 'scattergeo',
            mode: 'markers+text',
            lat: lats,
            lon: lons,
            text: texts,
            textposition: 'top center',
            hovertemplate: '%{text}<extra></extra>',
            marker: {
                size: sizes,
                color: countrySummaries
                    .filter(c => c.country !== 'Global')
                    .map(c => c.avg_ai_usage_hours || 0),
                colorscale: [
                    [0, '#3b82f6'],
                    [0.5, '#8b5cf6'],
                    [1, '#ec4899']
                ],
                colorbar: {
                    title: 'AI Usage<br>(hrs/week)',
                    thickness: 15,
                    len: 0.5,
                    x: 1.02,
                    tickfont: { color: 'white' },
                    titlefont: { color: 'white' }
                },
                line: {
                    width: 2,
                    color: selectedCountry === 'all' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'
                },
                opacity: 0.8
            },
            name: 'Countries',
            customdata: markers,
        }];
    }, [countrySummaries, selectedCountry]);

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <Plot
                data={mapData}
                layout={{
                    geo: {
                        projection: {
                            type: 'natural earth'
                        },
                        bgcolor: 'transparent',
                        showland: true,
                        landcolor: 'rgba(50, 50, 50, 0.3)',
                        showcountries: true,
                        countrycolor: 'rgba(100, 100, 100, 0.2)',
                        showocean: true,
                        oceancolor: 'rgba(20, 20, 40, 0.5)',
                        showlakes: true,
                        lakecolor: 'rgba(20, 20, 40, 0.5)',
                        coastlinecolor: 'rgba(150, 150, 150, 0.3)',
                        lataxis: {
                            range: [-60, 80]
                        },
                        lonaxis: {
                            range: [-180, 180]
                        }
                    },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    showlegend: false,
                    margin: { t: 0, r: 0, l: 0, b: 0 },
                    font: {
                        color: 'white',
                        family: 'Inter, sans-serif'
                    },
                    autosize: true,
                    height: 500
                }}
                config={{
                    displayModeBar: false,
                    responsive: true
                }}
                style={{ width: '100%', height: '100%' }}
                onClick={(event) => {
                    if (event.points && event.points[0] && event.points[0].customdata) {
                        const country = event.points[0].customdata;
                        if (onCountryClick) {
                            onCountryClick(country);
                        }
                    }
                }}
            />
        </Box>
    );
}
