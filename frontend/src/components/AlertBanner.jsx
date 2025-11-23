import React from 'react';

// Defines Tailwind classes based on alert type (success, warning, error)
const typeStyles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    success: 'bg-green-100 border-green-400 text-green-700',
};

const AlertBanner = ({ message, type = 'warning' }) => {
    const styles = typeStyles[type] || typeStyles.warning;

    return (
        <div className={`p-4 border-l-4 rounded-lg shadow-md ${styles}`} role="alert">
            <p className="font-bold capitalize">{type}!</p>
            <p className="text-sm">{message}</p>
        </div>
    );
};

export default AlertBanner;