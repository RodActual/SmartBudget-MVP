// src/pages/Dashboard.js
// This is the main "page" component that manages data fetching from the backend.

import React, { useState, useEffect } from 'react';

// We will import the presentational components once they are built
// import MetricCard from '../components/MetricCard';
// import ExpenseList from '../components/ExpenseList';
// import Chart from '../components/Chart';
// import AlertBanner from '../components/AlertBanner';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function fetches data from your running Flask backend
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // This URL must match the port your Flask server is running on
        const response = await fetch('http://127.0.0.1:5000/api/dashboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setMetrics(data.data); // Set the state with the 'data' object from your API
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
        
        setError(null);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        setError("Failed to load dashboard data. Is the backend server (python app.py) running?");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // The empty dependency array [] means this runs only once when the page loads

  // --- Render Logic ---

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  if (error) {
    // Once your AlertBanner is ready, you can use it here:
    // return <AlertBanner type="error" message={error} />;
    return <div className="p-8 m-4 bg-red-100 text-red-700 rounded-lg shadow">{error}</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-center text-gray-500">No dashboard data available.</div>;
  }

  // Once components are built, replace the placeholders below
  // with <MetricCard ... />, <ExpenseList ... />, etc.
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">SmartBudget Dashboard</h1>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Placeholder for MetricCard */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Spent</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.total_spent.toFixed(2)}</p>
        </div>
        
        {/* Placeholder for MetricCard */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Budget</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.total_budget.toFixed(2)}</p>
        </div>
        
        {/* Placeholder for MetricCard */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Remaining</h3>
          <p className={`text-3xl font-bold mt-2 ${metrics.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${metrics.remaining_budget.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expense List Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h2>
          {/* <ExpenseList categories={metrics.categories} /> */}
          <p className="text-gray-400">(Your ExpenseList component will go here)</p>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(metrics.categories, null, 2)}
          </pre>
        </div>

        {/* Chart & Alerts Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending Trend</h2>
            {/* <Chart /> */}
            <p className="text-gray-400">(Your Chart component will go here)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Alerts</h2>
            {/* <AlertBanner message="Shopping: Over budget" type="error" /> */}
            <p className="text-gray-400">(Your AlertBanner component will go here)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

