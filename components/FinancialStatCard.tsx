import React from 'react';

interface FinancialStatCardProps {
    title: string;
    value: number;
    color: 'green' | 'yellow' | 'blue' | 'red' | 'indigo' | 'purple';
    subValue?: string;
}

const colorStyles = {
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-amber-500 to-yellow-600',
    blue: 'from-blue-500 to-indigo-600',
    red: 'from-red-500 to-rose-600',
    indigo: 'from-indigo-500 to-purple-600',
    purple: 'from-purple-500 to-pink-600',
};

const FinancialStatCard: React.FC<FinancialStatCardProps> = ({ title, value, color, subValue }) => {
    return (
        <div className={`bg-gradient-to-br ${colorStyles[color]} text-white p-4 rounded-xl shadow-lg`}>
            <p className="text-sm opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-1">${value.toFixed(2)}</p>
            {subValue && <p className="text-xs opacity-70 mt-1">{subValue}</p>}
        </div>
    );
};

export default FinancialStatCard;