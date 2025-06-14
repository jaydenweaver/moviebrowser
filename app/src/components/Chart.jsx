import { AgCharts } from 'ag-charts-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../App';

function MyChart({ data }) {
    const currentYear = new Date().getFullYear();

    const [chartOptions, setChartOptions] = useState({
        theme: 'ag-material-dark',
        background: {
            fill: '#242424'
        },
        title: {
            text: 'Ratings over Time',
        },
        subtitle: {
            text: 'via IMDb',
        },
        series: [{ 
            type: 'scatter',
            xKey: 'year',
            xName: 'Year',
            yKey: 'rating',
            yName: 'Rating',
            data: [],
        }],
        axes: [{
            type: 'number',
            position: 'bottom',
            title: {
                text: 'Year',
            },
            max: currentYear,
        }, {
            type: 'number',
            position: 'left',
            title: {
                text: 'Rating'
            },
            min: 0,
            max: 10
        }],
    });

    useEffect(() => {
        if (!data || data.length === 0) return;

        const fetchMovieData = async () => {
            const responses = data.map(async role => {
                try {
                    const response = await fetch(`${API_URL}/movies/data/${role.movieId}`);
                    if (!response.ok) throw new Error('failed fetching movie data!');
                    const data = await response.json();
                    return {
                        year: data.year,
                        rating: role.imdbRating,
                    };
                } catch {
                    return null;
                }
            });

            const results = (await Promise.all(responses)).filter(Boolean);

            setChartOptions(prev => ({
                ...prev,
                series: [{
                    ...prev.series[0],
                    data: results,
                }]
            }));
        };

        fetchMovieData();
    }, [data]);

    return <AgCharts options={chartOptions} />
}

export default MyChart;