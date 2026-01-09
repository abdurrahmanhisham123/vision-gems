import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  currency?: string;
  trend?: 'up' | 'down' | 'stable';
  note?: string;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  currency = 'LKR',
  trend,
  note,
  icon: Icon,
  iconColor = '#6366F1',
  valueColor
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (val === undefined || val === null || isNaN(val)) return '—';
    return `${currency} ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-stone-400" />;
  };

  const getValueColorClass = () => {
    if (valueColor) return '';
    if (typeof value === 'number') {
      if (value < 0) return 'text-red-600';
      if (value > 0 && trend === 'up') return 'text-emerald-600';
    }
    return 'text-stone-900';
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1.5">
          {title}
        </div>
        <div 
          className={`text-2xl md:text-3xl font-black leading-tight truncate ${getValueColorClass()}`}
          style={valueColor ? { color: valueColor } : {}}
        >
          {formatValue(value)}
        </div>
        {note && (
          <div className="text-xs text-stone-500 mt-1 hidden md:block">{note}</div>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className="text-xs text-stone-400">{trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div 
          className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border shrink-0 mt-4 md:mt-0"
          style={{ 
            backgroundColor: `${iconColor}15`, 
            borderColor: `${iconColor}30`, 
            color: iconColor 
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};






