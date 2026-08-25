'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { useBooking } from '../../lib/context';
import { useMemo } from 'react';

const COLORS = ['#1e40af', '#4ade80', '#fbbf24', '#f97316', '#ef4444'];
const LABELS = ['Occupied', 'Available', 'Reserved', 'Maintenance'];

export function OccupancyChart() {
  const { rooms } = useBooking();

  const data = useMemo(() => {
    const counts = {
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      available: rooms.filter((r) => r.status === 'available').length,
      reserved: rooms.filter((r) => r.status === 'reserved').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    };
    return [
      { name: 'Occupied', value: counts.occupied },
      { name: 'Available', value: counts.available },
      { name: 'Reserved', value: counts.reserved },
      { name: 'Maintenance', value: counts.maintenance },
    ].filter((d) => d.value > 0);
  }, [rooms]);

  const total = rooms.length;
  const occupied = rooms.filter((r) => r.status === 'occupied').length;
  const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Room Occupancy</h3>
          <p className="text-sm text-gray-500 mt-1">{total} total rooms</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Occupancy rate</p>
          <p className="text-lg font-bold text-blue-600">{rate}%</p>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          No room data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
