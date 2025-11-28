import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

function AlertBanner({ alerts = [], categories = [] }) {
  // Generate alerts from category data
  const categoryAlerts = categories
    .filter(cat => cat.status !== 'On Track')
    .map(cat => {
      const percentage = ((cat.spent / cat.budget) * 100).toFixed(1);
      return {
        type: cat.status === 'Over Budget' ? 'error' : 'warning',
        message: `${cat.category}: $${cat.spent} / $${cat.budget} (${percentage}%)`
      };
    });

  // Combine with general alerts
  const allAlerts = [...alerts, ...categoryAlerts];

  if (allAlerts.length === 0) {
    return null;
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertCircle
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: AlertTriangle
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: Info
        };
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {allAlerts.map((alert, index) => {
        const styles = getAlertStyles(alert.type);
        const Icon = styles.icon;
        
        return (
          <div
            key={index}
            className={`${styles.bg} ${styles.border} ${styles.text} px-4 py-3 rounded-lg border flex items-start gap-3`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}

export default AlertBanner;