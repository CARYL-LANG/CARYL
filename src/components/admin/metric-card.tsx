import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  backgroundColor: string;
  textColor?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  backgroundColor,
  textColor = 'text-white',
}: MetricCardProps) {
  return (
    <div className={`${backgroundColor} rounded-lg p-6 ${textColor} shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
