import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  color: 'green' | 'blue' | 'yellow';
  isClickable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, isClickable, isActive, onClick }) => {
  const colorClasses = {
    green: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-300',
    blue: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300',
    yellow: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300',
  };

  const dotColorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
  }

  const baseClasses = `p-6 rounded-2xl ${colorClasses[color]} transition-all duration-200`;
  const clickableClasses = isClickable ? 'cursor-pointer transform hover:-translate-y-1' : '';
  const activeClasses = isActive ? 'ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 ring-blue-500' : 'border-2 border-transparent';

  const Component = isClickable ? 'button' : 'div';
  const componentProps = isClickable ? { onClick, 'aria-pressed': isActive, className: `${baseClasses} ${clickableClasses} ${activeClasses} w-full text-left` } : { className: baseClasses };

  return (
    <Component {...componentProps}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span className={`w-3 h-3 rounded-full ${dotColorClasses[color]}`}></span>
      </div>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </Component>
  );
};

export default StatCard;