import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  CalendarCheck,
  LogIn,
  LogOut,
  DoorOpen,
  BedDouble,
  Users,
  Eye,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-orange-100 text-orange-800',
};

function isSameDay(a: Date, b: string): boolean {
  const d = new Date(b + 'T00:00:00');
  return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth() && a.getDate() === d.getDate();
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { bookings, rooms, currentUser } = useBooking();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todaysCheckIns = useMemo(
    () => bookings.filter((b) => b.bookingType !== 'event' && (b.status === 'confirmed' || b.status === 'pending') && isSameDay(today, b.checkInDate)),
    [bookings, today]
  );

  const todaysCheckOuts = useMemo(
    () => bookings.filter((b) => b.bookingType !== 'event' && b.status === 'checked-in' && isSameDay(today, b.checkOutDate)),
    [bookings, today]
  );

  const availableRooms = useMemo(() => rooms.filter((r) => r.status === 'available'), [rooms]);
  const occupiedRooms = useMemo(() => rooms.filter((r) => r.status === 'occupied'), [rooms]);

  const assignedReservations = useMemo(
    () => bookings.filter((b) => b.bookingType !== 'event' && b.assignedStaffId === currentUser.id && b.status !== 'checked-out' && b.status !== 'cancelled' && b.status !== 'rejected'),
    [bookings, currentUser.id]
  );

  const stats = [
    { label: "Today's Check-ins", value: todaysCheckIns.length, icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-50', route: '/staff/check-in' },
    { label: "Today's Check-outs", value: todaysCheckOuts.length, icon: LogOut, color: 'text-orange-600', bg: 'bg-orange-50', route: '/staff/check-out' },
    { label: 'Available Rooms', value: availableRooms.length, icon: DoorOpen, color: 'text-green-600', bg: 'bg-green-50', route: '/staff/reservations' },
    { label: 'Occupied Rooms', value: occupiedRooms.length, icon: BedDouble, color: 'text-purple-600', bg: 'bg-purple-50', route: '/staff/check-out' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">Staff Dashboard</h2>
              <p className="text-gray-600">Overview of today's activity and your assigned reservations.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <button
                    key={stat.label}
                    onClick={() => navigate(stat.route)}
                    className="text-left"
                  >
                    <Card className="hover:shadow-lg transition cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                            <Icon size={24} className={stat.color} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assigned Reservations */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={20} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-800">Assigned Reservations</h3>
                    </div>
                    <button onClick={() => navigate('/staff/reservations')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  {assignedReservations.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No reservations assigned to you.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {assignedReservations.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                              {b.roomNumber || '—'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{b.guestName}</p>
                              <p className="text-xs text-gray-500">{b.checkInDate} → {b.checkOutDate}</p>
                            </div>
                          </div>
                          <Badge className={statusBadge[b.status]}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Check-ins */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LogIn size={20} className="text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">Today's Check-ins</h3>
                    </div>
                    <button onClick={() => navigate('/staff/check-in')} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      Go to Check-in <ArrowRight size={14} />
                    </button>
                  </div>
                  {todaysCheckIns.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No check-ins scheduled for today.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {todaysCheckIns.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-sm font-bold text-green-600">
                              {b.roomNumber || '—'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{b.guestName}</p>
                              <p className="text-xs text-gray-500">{b.numberOfGuests} guest(s)</p>
                            </div>
                          </div>
                          <Badge className={statusBadge[b.status]}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Check-outs */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LogOut size={20} className="text-orange-600" />
                      <h3 className="text-lg font-bold text-gray-800">Today's Check-outs</h3>
                    </div>
                    <button onClick={() => navigate('/staff/check-out')} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                      Go to Check-out <ArrowRight size={14} />
                    </button>
                  </div>
                  {todaysCheckOuts.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No check-outs scheduled for today.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {todaysCheckOuts.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-sm font-bold text-orange-600">
                              {b.roomNumber || '—'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{b.guestName}</p>
                              <p className="text-xs text-gray-500">Out: {b.checkOutDate}</p>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Checked-in</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Rooms */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DoorOpen size={20} className="text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">Available Rooms</h3>
                    </div>
                    <span className="text-sm text-gray-500">{availableRooms.length} of {rooms.length} rooms</span>
                  </div>
                  {availableRooms.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No rooms currently available.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                      {availableRooms.map((r) => (
                        <div key={r.id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-xs font-bold text-green-600">
                              {r.roomNumber}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 capitalize">{r.type}</p>
                              <p className="text-xs text-gray-500">₱{r.pricePerNight}/night</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Occupied Rooms full-width */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BedDouble size={20} className="text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Occupied Rooms</h3>
                  </div>
                  <span className="text-sm text-gray-500">{occupiedRooms.length} of {rooms.length} rooms</span>
                </div>
                {occupiedRooms.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">No rooms currently occupied.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {occupiedRooms.map((r) => {
                      const occupant = bookings.find((b) => b.roomId === r.id && b.status === 'checked-in');
                      return (
                        <div key={r.id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-600">
                              {r.roomNumber}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 capitalize">{r.type}</p>
                              <p className="text-xs text-gray-500">{occupant ? occupant.guestName : 'Occupied'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
