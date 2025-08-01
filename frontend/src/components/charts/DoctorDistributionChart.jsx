import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoctorDistributionChart = ({ chartData }) => {
    const data = {
        labels: chartData.map(item => `Dr. ${item.doctor__name}`),
        datasets: [{
            label: 'Appointments',
            data: chartData.map(item => item.count),
            backgroundColor: [
                '#34d399', '#60a5fa', '#facc15', '#fb923c', '#f87171', '#a78bfa',
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Appointments by Doctor',
                font: { size: 18 }
            },
        },
    };

    return <Doughnut data={data} options={options} />;
};

export default DoctorDistributionChart;