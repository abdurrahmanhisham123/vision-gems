import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-stone-200 shadow-sm p-4 md:p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-black text-stone-900 tracking-tight uppercase">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs md:text-sm text-stone-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};





