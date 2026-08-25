import { useState } from 'react';
import { useBooking } from '../../lib/context';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Waves, Music, Search } from 'lucide-react';

export default function StaffFacilitiesPage() {
  const { services, facilityBookings, updateFacilityBooking, logActivity } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const q = searchQuery.trim().toLowerCase();
  const filtered = facilityBookings.filter((b) => {
    const matchesSearch = !q || b.guestName.toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || b.facilityType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateFacilityBooking(id, { status: status as any });
    logActivity('Updated facility booking status', 'facility_booking', id, `Status changed to ${status}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 overflow-auto">
        <StaffHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
              <p className="text-gray-600 mt-2">Monitor and manage swimming pool and videoke bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Types</option>
                <option value="swimming-pool">Swimming Pool</option>
                <option value="videoke">Videoke</option>
              </select>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by guest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Waves size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{facilityBookings.filter((b) => b.facilityType === 'swimming-pool').length}</p>
                    <p className="text-xs text-gray-500">Pool Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Music size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{facilityBookings.filter((b) => b.facilityType === 'videoke').length}</p>
                    <p className="text-xs text-gray-500">Videoke Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-yellow-600">{facilityBookings.filter((b) => b.status === 'pending').length}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-600">{facilityBookings.filter((b) => b.status === 'confirmed').length}</p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No facility bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtered.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.guestName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {booking.facilityType === 'swimming-pool' ? 'Swimming Pool' : 'Videoke'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{booking.bookingDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{booking.numberOfGuests}</td>
                          <td className="px-6 py-4">
                            <Badge className={
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">₱{booking.totalPrice}</td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirm</option>
                              <option value="completed">Complete</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
