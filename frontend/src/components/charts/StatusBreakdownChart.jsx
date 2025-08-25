import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusBreakdownChart = ({ chartData }) => {
    const data = {
        labels: chartData.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
        datasets: [{
            label: 'Count',
            data: chartData.map(item => item.count),
            backgroundColor: {
                'booked': '#32CD32', // lime green
                'completed': '#34d399', // Light Green
                'canceled': '#f87171', // Red
                'pending': '#facc15' // Yellow
            },
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };
    
    // Custom mapping for background colors
    data.datasets[0].backgroundColor = data.labels.map(label => data.datasets[0].backgroundColor[label.toLowerCase()] || '#d1d5db');


    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Appointment Status Breakdown',
                font: { size: 18 }
            },
        },
    };

    return <Pie data={data} options={options} />;
};

export default StatusBreakdownChart;