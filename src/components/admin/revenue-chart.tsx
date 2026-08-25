'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useBooking } from '../../lib/context';
import { useMemo } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueChart() {
  const { bookings, eventBookings } = useBooking();

  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthlyMap: { [key: string]: number } = {};

    for (let i = 0; i < 12; i++) {
      monthlyMap[`${year}-${i}`] = 0;
    }

    [...bookings, ...eventBookings].forEach((b) => {
      const date = new Date(b.createdAt || (b as any).checkInDate || (b as any).eventDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (key in monthlyMap) {
        monthlyMap[key] += (b as any).totalPrice || 0;
      }
    });

    return Object.entries(monthlyMap).map(([key, revenue]) => {
      const [, monthIdx] = key.split('-');
      return { month: MONTH_NAMES[parseInt(monthIdx)], revenue };
    });
  }, [bookings, eventBookings]);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const currentMonth = new Date().getMonth();
  const currentMonthRevenue = data[currentMonth]?.revenue || 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Monthly Revenue</h3>
          <p className="text-sm text-gray-500 mt-1">Current year • Total: ₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">This month</p>
          <p className="text-lg font-bold text-green-600">₱{currentMonthRevenue.toLocaleString()}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" tickFormatter={(v) => `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            fill="#dbeafe"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
