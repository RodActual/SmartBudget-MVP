// frontend/src/components/Chart.jsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpendingTrendChart = ({ data, title }) => {
  // Map data props to Chart.js format
  const chartData = {
    labels: data.map(item => item.label), // e.g., ['Wk 1', 'Wk 2', 'Wk 3']
    datasets: [
      {
        label: title || 'Spending Trend',
        data: data.map(item => item.value), // e.g., [300, 250, 400]
        borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4, // Smooth curve
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows flexible sizing within parent container
    plugins: {
      legend: {
        display: false, // Typically hidden on small dashboard trend charts
      },
      title: {
        display: true,
        text: title || 'Spending Trend',
        font: {
            size: 14,
            weight: 'bold'
        },
        padding: {
            top: 10,
            bottom: 10
        }
      },
    },
    scales: {
        y: {
            // Hide Y-axis labels and grid lines for a cleaner look
            display: false, 
        },
        x: {
            // Hide X-axis labels and grid lines
            display: false,
        }
    }
  };

  return (
    <div className="w-full h-48 p-4 bg-white rounded-xl">
        <Line data={chartData} options={options} />
    </div>
  );
};

export default SpendingTrendChart;