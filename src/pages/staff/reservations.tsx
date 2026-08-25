import { useState, useMemo } from 'react';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Booking, Room } from '../../lib/types';
import { showSuccessNotification, showErrorNotification, showInfoNotification } from '../../lib/notifications';
import {
  CalendarPlus,
  Search,
  X,
  Pencil,
  DoorOpen,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  BedDouble,
  ArrowLeftRight,
} from 'lucide-react';

const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-orange-100 text-orange-800',
};

const datesOverlap = (s1: string, e1: string, s2: string, e2: string) => {
  return new Date(s1) < new Date(e2) && new Date(s2) < new Date(e1);
};

export default function StaffReservationsPage() {
  const { bookings, rooms, addBooking, updateBooking } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'walk-in' | 'status'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [transferringBooking, setTransferringBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => b.bookingType !== 'event');

    if (viewMode === 'walk-in') {
      result = result.filter((b) => b.createdBy === 'staff');
    } else if (viewMode === 'status') {
      result = result.filter((b) => b.status !== 'checked-out' && b.status !== 'cancelled' && b.status !== 'rejected');
    } else {
      result = result.filter((b) => b.createdBy === 'staff' && b.status !== 'checked-in' && b.status !== 'checked-out');
    }

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (searchTerm) {
      result = result.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, searchTerm, statusFilter, viewMode]);

  const statusTabs: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bookings.filter((b) => b.bookingType !== 'event').length },
    { key: 'pending', label: 'Pending', count: bookings.filter((b) => b.bookingType !== 'event' && b.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.bookingType !== 'event' && b.status === 'confirmed').length },
    { key: 'checked-in', label: 'Checked-in', count: bookings.filter((b) => b.bookingType !== 'event' && b.status === 'checked-in').length },
    { key: 'checked-out', label: 'Checked-out', count: bookings.filter((b) => b.bookingType !== 'event' && b.status === 'checked-out').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.bookingType !== 'event' && (b.status === 'cancelled' || b.status === 'rejected')).length },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">Reservations</h2>
                <p className="text-gray-600">Manually create and manage reservations for walk-in or phone customers. New reservations are confirmed automatically and sent to the Check-In queue.</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <CalendarPlus size={20} />
                Create Reservation
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by guest name, email, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              {([
                { key: 'all', label: 'All Reservations' },
                { key: 'walk-in', label: 'Walk-in Reservations' },
                { key: 'status', label: 'Reservation Status' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    viewMode === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    statusFilter === tab.key
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CalendarPlus size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No manual reservations yet</p>
                  <p className="text-gray-500 text-sm mt-1">Only reservations created by staff appear here. Once a guest is checked in, the reservation moves to the Check-In / Check-Out pages.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-semibold text-gray-600 uppercase mb-1">Room</span>
                              <div className="text-2xl font-bold text-blue-600 bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center">
                                {booking.roomNumber || '—'}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-800">{booking.guestName}</h3>
                                <Badge className={statusColors[booking.status]}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">{booking.guestEmail}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {booking.checkInDate} → {booking.checkOutDate}</span>
                                <span className="flex items-center gap-1"><Users size={14} /> {booking.numberOfGuests}</span>
                                <span className="flex items-center gap-1"><BedDouble size={14} /> ₱{booking.totalPrice}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => setViewingBooking(booking)}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                            title="View details"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => setEditingBooking(booking)}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition"
                            title="Edit reservation"
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            onClick={() => setAssigningBooking(booking)}
                            className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition"
                            title="Assign a room"
                          >
                            <DoorOpen size={16} /> Assign Room
                          </button>
                          {booking.status === 'checked-in' && (
                            <button
                              onClick={() => setTransferringBooking(booking)}
                              className="flex items-center gap-1 px-3 py-2 bg-teal-100 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-200 transition"
                              title="Transfer to another room"
                            >
                              <ArrowLeftRight size={16} /> Transfer Room
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {isCreateOpen && (
        <CreateReservationModal
          rooms={rooms}
          bookings={bookings}
          onClose={() => setIsCreateOpen(false)}
          onCreate={(data) => {
            addBooking(data);
            setIsCreateOpen(false);
            showSuccessNotification({
              title: 'Reservation Created',
              description: `Reservation for ${data.guestName} has been created manually.`,
            });
          }}
        />
      )}

      {editingBooking && (
        <EditReservationModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={(updated) => {
            updateBooking(updated.id, updated);
            setEditingBooking(null);
            showSuccessNotification({
              title: 'Reservation Updated',
              description: `Reservation for ${updated.guestName} has been updated.`,
            });
          }}
        />
      )}

      {assigningBooking && (
        <AssignRoomModal
          booking={assigningBooking}
          rooms={rooms}
          bookings={bookings}
          onClose={() => setAssigningBooking(null)}
          onAssign={(room) => {
            updateBooking(assigningBooking.id, {
              roomId: room.id,
              roomNumber: room.roomNumber,
            });
            setAssigningBooking(null);
            showSuccessNotification({
              title: 'Room Assigned',
              description: `Room ${room.roomNumber} has been assigned to ${assigningBooking.guestName}.`,
            });
          }}
        />
      )}

      {transferringBooking && (
        <TransferRoomModal
          booking={transferringBooking}
          rooms={rooms}
          bookings={bookings}
          onClose={() => setTransferringBooking(null)}
          onTransfer={(room) => {
            updateBooking(transferringBooking.id, {
              roomId: room.id,
              roomNumber: room.roomNumber,
            });
            setTransferringBooking(null);
            showSuccessNotification({
              title: 'Room Transferred',
              description: `${transferringBooking.guestName} has been moved to Room ${room.roomNumber}.`,
            });
          }}
        />
      )}

      {viewingBooking && (
        <ViewReservationModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      )}
    </div>
  );
}

/* ---------- Create Reservation Modal ---------- */

interface CreateModalProps {
  rooms: Room[];
  bookings: Booking[];
  onClose: () => void;
  onCreate: (booking: Booking) => void;
}

function CreateReservationModal({ rooms, bookings, onClose, onCreate }: CreateModalProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [status, setStatus] = useState<Booking['status']>('confirmed');

  const availableRooms = rooms.filter((r) => r.status === 'available');
  const selectedRoom = rooms.find((r) => r.id === roomId);

  const conflict = useMemo(() => {
    if (!roomId || !checkInDate || !checkOutDate) return null;
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.status !== 'cancelled' &&
        b.status !== 'checked-out' &&
        b.status !== 'rejected' &&
        datesOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate)
    ) || null;
  }, [roomId, checkInDate, checkOutDate, bookings]);

  const nights = checkInDate && checkOutDate
    ? Math.max(0, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000))
    : 0;
  const totalPrice = selectedRoom && nights > 0 ? nights * selectedRoom.pricePerNight : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !roomId || !checkInDate || !checkOutDate) {
      showErrorNotification({ title: 'Missing Fields', description: 'Please fill in all fields.' });
      return;
    }
    if (nights <= 0) {
      showErrorNotification({ title: 'Invalid Dates', description: 'Check-out must be after check-in.' });
      return;
    }
    if (conflict) {
      showErrorNotification({
        title: 'Booking Conflict',
        description: `Room is already booked ${conflict.checkInDate} to ${conflict.checkOutDate}.`,
      });
      return;
    }
    const room = rooms.find((r) => r.id === roomId)!;
    const newBooking: Booking = {
      id: 'temp_' + Date.now(),
      guestName,
      guestEmail,
      guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      checkInDate,
      checkOutDate,
      status,
      totalPrice,
      numberOfGuests,
      bookingType: 'room',
      createdAt: new Date().toISOString(),
      paymentStatus: 'completed',
      createdBy: 'staff',
    };
    onCreate(newBooking);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create Reservation</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Full Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="juan@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="0912 345 6789"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a room...</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} — {r.type} (₱{r.pricePerNight}/night, {r.status})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          {conflict && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-700">
              This room is already booked {conflict.checkInDate} to {conflict.checkOutDate} for {conflict.guestName}.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <select
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Booking['status'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
              </select>
            </div>
          </div>
          {totalPrice > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{nights} night(s) × ₱{selectedRoom?.pricePerNight}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">₱{totalPrice}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Create Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Edit Reservation Modal ---------- */

interface EditModalProps {
  booking: Booking;
  onClose: () => void;
  onSave: (updated: Booking) => void;
}

function EditReservationModal({ booking, onClose, onSave }: EditModalProps) {
  const [guestName, setGuestName] = useState(booking.guestName);
  const [guestEmail, setGuestEmail] = useState(booking.guestEmail);
  const [guestPhone, setGuestPhone] = useState(booking.guestPhone);
  const [checkInDate, setCheckInDate] = useState(booking.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState(booking.checkOutDate);
  const [numberOfGuests, setNumberOfGuests] = useState(booking.numberOfGuests);
  const [totalPrice, setTotalPrice] = useState(booking.totalPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate) {
      showErrorNotification({ title: 'Missing Fields', description: 'Please fill in all fields.' });
      return;
    }
    onSave({
      ...booking,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Reservation</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
              <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
              <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <input type="number" min={1} max={8} value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₱)</label>
              <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Assign Room Modal ---------- */

interface AssignModalProps {
  booking: Booking;
  rooms: Room[];
  bookings: Booking[];
  onClose: () => void;
  onAssign: (room: Room) => void;
}

function AssignRoomModal({ booking, rooms, bookings, onClose, onAssign }: AssignModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState(booking.roomId || '');

  const candidateRooms = rooms.filter((r) => r.status === 'available');

  const isRoomFree = (room: Room) => {
    return !bookings.some(
      (b) =>
        b.id !== booking.id &&
        b.roomId === room.id &&
        b.status !== 'cancelled' &&
        b.status !== 'checked-out' &&
        b.status !== 'rejected' &&
        datesOverlap(booking.checkInDate, booking.checkOutDate, b.checkInDate, b.checkOutDate)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) {
      showErrorNotification({ title: 'No Room', description: 'Please select a room.' });
      return;
    }
    if (!isRoomFree(room)) {
      showErrorNotification({
        title: 'Room Unavailable',
        description: `Room ${room.roomNumber} has a conflicting booking.`,
      });
      return;
    }
    onAssign(room);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assign Room</h2>
            <p className="text-sm text-gray-600 mt-1">
              For {booking.guestName} · {booking.checkInDate} → {booking.checkOutDate}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {candidateRooms.map((room) => {
            const free = isRoomFree(room);
            const selected = selectedRoomId === room.id;
            return (
              <button
                type="button"
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${!free ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!free}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-800">Room {room.roomNumber}</span>
                    <span className="text-sm text-gray-500 ml-2 capitalize">{room.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-700">₱{room.pricePerNight}/night</span>
                    <div className="text-xs">
                      {free ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Booked</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Capacity: {room.capacity} · Status: {room.status}</div>
              </button>
            );
          })}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              disabled={!selectedRoomId}>
              Assign Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Transfer Room Modal ---------- */

interface TransferModalProps {
  booking: Booking;
  rooms: Room[];
  bookings: Booking[];
  onClose: () => void;
  onTransfer: (room: Room) => void;
}

function TransferRoomModal({ booking, rooms, bookings, onClose, onTransfer }: TransferModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const candidateRooms = rooms.filter((r) => r.id !== booking.roomId && r.status === 'available');
  const isRoomFree = (room: Room) => !bookings.some(
    (b) => b.id !== booking.id && b.roomId === room.id && b.status !== 'cancelled' && b.status !== 'checked-out' && b.status !== 'rejected' && datesOverlap(booking.checkInDate, booking.checkOutDate, b.checkInDate, b.checkOutDate)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room || !isRoomFree(room)) {
      showErrorNotification({ title: 'Room Unavailable', description: 'Please choose an available room.' });
      return;
    }
    onTransfer(room);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transfer Room</h2>
            <p className="text-sm text-gray-600 mt-1">Move {booking.guestName} from Room {booking.roomNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={24} className="text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {candidateRooms.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No other rooms are currently available.</p>
          ) : candidateRooms.map((room) => {
            const free = isRoomFree(room);
            return (
              <button type="button" key={room.id} onClick={() => setSelectedRoomId(room.id)} disabled={!free}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${selectedRoomId === room.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'} ${!free ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex justify-between"><span className="font-bold text-gray-800">Room {room.roomNumber}</span><span className="text-sm text-gray-600">₱{room.pricePerNight}/night</span></div>
                <p className="text-xs text-gray-500 mt-1">{free ? 'Available' : 'Booked'} · {room.type}</p>
              </button>
            );
          })}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" disabled={!selectedRoomId} className="flex-1 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50">Transfer Room</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- View Reservation Modal ---------- */

function ViewReservationModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <User size={16} />, label: 'Guest', value: booking.guestName },
    { icon: <Mail size={16} />, label: 'Email', value: booking.guestEmail },
    { icon: <Phone size={16} />, label: 'Phone', value: booking.guestPhone },
    { icon: <BedDouble size={16} />, label: 'Room', value: booking.roomNumber || 'Not assigned' },
    { icon: <Calendar size={16} />, label: 'Check-In', value: booking.checkInDate },
    { icon: <Calendar size={16} />, label: 'Check-Out', value: booking.checkOutDate },
    { icon: <Users size={16} />, label: 'Guests', value: String(booking.numberOfGuests) },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Reservation Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[booking.status]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
            </Badge>
            <span className="text-sm text-gray-500">Created {new Date(booking.createdAt).toLocaleDateString()}</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-400">{r.icon}</span>
              <span className="text-sm text-gray-500 w-24">{r.label}</span>
              <span className="text-sm font-medium text-gray-800 flex-1">{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm text-gray-500">Total Price</span>
            <span className="text-xl font-bold text-blue-600">₱{booking.totalPrice}</span>
          </div>
          {booking.paymentStatus && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="text-sm font-medium capitalize text-gray-800">{booking.paymentStatus}</span>
            </div>
          )}
        </div>
        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
