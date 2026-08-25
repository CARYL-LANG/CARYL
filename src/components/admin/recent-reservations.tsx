'use client';

import { useBooking } from '../../lib/context';
import { Badge } from '../ui/badge';

const statusColors: { [key: string]: string } = {
  confirmed: 'bg-blue-100 text-blue-800',
  'checked-in': 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

export function RecentReservations() {
  const { bookings } = useBooking();
  
  // Get first 5 bookings
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Recent Reservations</h3>
        <a href="/admin/reservations" className="text-blue-600 text-sm font-medium hover:underline">
          VIEW ALL
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Guest Name</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Room</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Check-In</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 text-gray-800 font-medium">
                  {booking.guestName}
                </td>
                <td className="py-3 px-3 text-gray-700">{booking.roomNumber}</td>
                <td className="py-3 px-3 text-gray-700">
                  {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="py-3 px-3">
                  <Badge className={statusColors[booking.status]}>
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1).replace('-', ' ')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
