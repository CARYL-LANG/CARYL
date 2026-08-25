import { AdminSidebar } from '../components/admin/sidebar';
import { AdminHeader } from '../components/admin/header';
import { MetricCard } from '../components/admin/metric-card';
import { RecentReservations } from '../components/admin/recent-reservations';
import { RevenueChart } from '../components/admin/revenue-chart';
import { OccupancyChart } from '../components/admin/occupancy-chart';
import { ReservationCalendar } from '../components/admin/reservation-calendar';
import { NotificationsPanel } from '../components/admin/notifications-panel';
import { useBooking } from '../lib/context';
import { useMemo } from 'react';
import {
  CalendarCheck,
  Users,
  UserCog,
  DoorOpen,
  DoorClosed,
  BedDouble,
  CalendarOff,
  Wrench,
  TrendingUp,
  CalendarRange,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function AdminDashboard() {
  const {
    bookings,
    eventBookings,
    rooms,
    services,
    staffAccounts,
    customerAccounts,
    getMetrics,
  } = useBooking();

  const metrics = getMetrics();

  // ---- 1.1 Dashboard Overview metrics ----
  const totalReservations = bookings.length + eventBookings.length;
  const totalCustomers = customerAccounts.length;
  const totalStaff = staffAccounts.length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const reservedRooms = rooms.filter((r) => r.status === 'reserved').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

  // Revenue calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const { dailyRevenue, monthlyRevenue, annualRevenue } = useMemo(() => {
    let daily = 0;
    let monthly = 0;
    let annual = 0;

    const allBookings = [
      ...bookings.map((b) => ({ date: b.checkInDate, amount: b.totalPrice, status: b.paymentStatus })),
      ...eventBookings.map((e) => ({ date: e.eventDate, amount: e.totalPrice, status: e.paymentStatus })),
    ];

    allBookings.forEach((b) => {
      if (b.status !== 'completed') return;
      const d = new Date(b.date + 'T00:00:00');
      if (b.date === todayStr) daily += b.amount;
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) monthly += b.amount;
      if (d.getFullYear() === currentYear) annual += b.amount;
    });

    return { dailyRevenue: daily, monthlyRevenue: monthly, annualRevenue: annual };
  }, [bookings, eventBookings, todayStr, currentYear, currentMonth]);

  // ---- 1.2 Reservation Activity ----
  const pendingReservations = bookings.filter((b) => b.status === 'pending').length;
  const confirmedReservations = bookings.filter((b) => b.status === 'confirmed').length;
  const checkedInGuests = bookings.filter((b) => b.status === 'checked-in').length;
  const checkedOutGuests = bookings.filter((b) => b.status === 'checked-out').length;
  const cancelledReservations = bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length;

  const activityItems = [
    { label: 'Pending', value: pendingReservations, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Confirmed', value: confirmedReservations, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Checked-In', value: checkedInGuests, icon: LogIn, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Checked-Out', value: checkedOutGuests, icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Cancelled', value: cancelledReservations, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Real-time inn operations summary</p>
            </div>

            {/* 1.1 — Total metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
              <MetricCard
                title="Total Reservations"
                value={totalReservations}
                icon={<CalendarCheck size={28} />}
                backgroundColor="bg-blue-600"
              />
              <MetricCard
                title="Total Customers"
                value={totalCustomers}
                icon={<Users size={28} />}
                backgroundColor="bg-teal-600"
              />
              <MetricCard
                title="Total Staff"
                value={totalStaff}
                icon={<UserCog size={28} />}
                backgroundColor="bg-indigo-600"
              />
              <MetricCard
                title="Total Rooms"
                value={totalRooms}
                icon={<DoorOpen size={28} />}
                backgroundColor="bg-slate-700"
              />
              <MetricCard
                title="Available Rooms"
                value={availableRooms}
                icon={<DoorClosed size={28} />}
                backgroundColor="bg-green-600"
              />
              <MetricCard
                title="Occupied Rooms"
                value={occupiedRooms}
                icon={<BedDouble size={28} />}
                backgroundColor="bg-red-500"
              />
            </div>

            {/* Room status + revenue metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              <MetricCard
                title="Reserved Rooms"
                value={reservedRooms}
                icon={<CalendarRange size={28} />}
                backgroundColor="bg-amber-600"
              />
              <MetricCard
                title="Under Maintenance"
                value={maintenanceRooms}
                icon={<Wrench size={28} />}
                backgroundColor="bg-orange-600"
              />
              <MetricCard
                title="Daily Revenue"
                value={`₱${dailyRevenue.toLocaleString()}`}
                icon={<span className="font-semibold">₱</span>}
                backgroundColor="bg-emerald-600"
              />
              <MetricCard
                title="Monthly Revenue"
                value={`₱${monthlyRevenue.toLocaleString()}`}
                icon={<span className="font-semibold">₱</span>}
                backgroundColor="bg-sky-100"
                textColor="text-slate-900"
              />
              <MetricCard
                title="Annual Revenue"
                value={`₱${annualRevenue.toLocaleString()}`}
                icon={<span className="font-semibold">₱</span>}
                backgroundColor="bg-blue-100"
                textColor="text-slate-900"
              />
            </div>

            {/* 1.2 — Reservation Activity Monitor */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Reservation Activities</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {activityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`${item.bg} rounded-lg p-4 text-center border border-gray-100`}
                    >
                      <Icon size={28} className={`mx-auto mb-2 ${item.color}`} />
                      <p className="text-3xl font-bold text-gray-800">{item.value}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent reservations + notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RecentReservations />
              </div>
              <NotificationsPanel />
            </div>

            {/* Revenue + Occupancy charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <RevenueChart />
              <OccupancyChart />
            </div>

            {/* Reservation Calendar */}
            <div className="mb-8">
              <ReservationCalendar />
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Bookings</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₱{bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Event Bookings</p>
                    <p className="text-2xl font-bold text-teal-600">
                      ₱{eventBookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₱{(bookings.reduce((sum, b) => sum + b.totalPrice, 0) +
                        eventBookings.reduce((sum, b) => sum + b.totalPrice, 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confirmed Events</span>
                    <span className="text-lg font-bold text-gray-800">
                      {eventBookings.filter((b) => b.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-sm text-gray-600">Active Services</span>
                    <span className="text-lg font-bold text-gray-800">
                      {services.filter((s) => s.available).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-sm text-gray-600">Today's Bookings</span>
                    <span className="text-lg font-bold text-gray-800">{metrics.todaysBookings}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-sm text-gray-600">Checked-in Guests</span>
                    <span className="text-lg font-bold text-gray-800">{checkedInGuests}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-sm text-gray-600">Pending Payments</span>
                    <span className="text-lg font-bold text-gray-800">{metrics.pendingPayments}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
