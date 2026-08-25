import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function StaffReportsPage() {
  const navigate = useNavigate();
  const { bookings } = useBooking();

  const totalCheckIns = bookings.filter(
    (b) => b.status === 'checked-in' || b.status === 'checked-out'
  ).length;

  const totalCheckOuts = bookings.filter((b) => b.status === 'checked-out').length;

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const avgBookingValue =
    bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Staff Reports
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Check-Ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {totalCheckIns}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Check-Outs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {totalCheckOuts}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₱{totalRevenue}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg Booking Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ₱{avgBookingValue}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={24} className="text-blue-600" />
                  Recent Guest Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Guest
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Room
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Check-In
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Check-Out
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 10).map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-3 text-gray-800 font-medium">
                            {booking.guestName}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            {booking.roomNumber}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            <div>{booking.checkInDate}</div>
                            {booking.checkInTime && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {new Date(booking.checkInTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            <div>{booking.checkOutDate}</div>
                            {booking.checkOutTime && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {new Date(booking.checkOutTime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
