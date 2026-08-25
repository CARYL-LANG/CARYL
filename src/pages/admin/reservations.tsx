import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Badge } from '../../components/ui/badge';
import { Trash2, LogIn, Send, Calendar, List } from 'lucide-react';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../../lib/notifications';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Booking } from '../../lib/types';
import { ReservationCalendar } from '../../components/admin/reservation-calendar';

const statusColors: { [key: string]: string } = {
  confirmed: 'bg-blue-100 text-blue-800',
  'checked-in': 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReservationsPage() {
  const navigate = useNavigate();
  const {
    bookings,
    rooms,
    staffAccounts,
    updateBooking,
    deleteBooking,
  } = useBooking();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [transferStaffId, setTransferStaffId] = useState('');
  const [transferRoomId, setTransferRoomId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || null;

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  const statusTabs: { key: 'all' | Booking['status']; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { key: 'checked-in', label: 'Checked-in', count: bookings.filter(b => b.status === 'checked-in').length },
    { key: 'checked-out', label: 'Checked-out', count: bookings.filter(b => b.status === 'checked-out').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const availableRooms = rooms.filter(
    (r) =>
      r.status === 'available' ||
      (activeBooking && r.id === activeBooking.roomId),
  );

  // Approve Reservation
  const handleApproveReservation = (id: string) => {
    updateBooking(id, { status: 'confirmed' });
    showSuccessNotification({
      title: 'Reservation Approved',
      description: 'The reservation has been successfully approved.',
    });
  };

  // Reject Reservation
  const handleRejectReservation = (id: string) => {
    if (confirm('Are you sure you want to reject this reservation?')) {
      updateBooking(id, { status: 'rejected' });
      showWarningNotification({
        title: 'Reservation Rejected',
        description: 'The reservation has been rejected.',
      });
    }
  };

  // Delete Reservation - Open Dialog
  const handleDeleteClick = (id: string) => {
    setBookingToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking(bookingToDelete);
      showErrorNotification({
        title: 'Reservation Deleted',
        description: 'The reservation has been permanently deleted.',
      });
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  // Transfer to Staff
  const openTransfer = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    setActiveBookingId(id);
    setTransferStaffId(booking?.assignedStaffId || '');
    setTransferRoomId(booking?.roomId || '');
    setTransferOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!activeBookingId || !transferStaffId) return;
    const staff = staffAccounts.find((s) => s.id === transferStaffId);
    const room = transferRoomId ? rooms.find((r) => r.id === transferRoomId) : null;
    updateBooking(activeBookingId, {
      assignedStaffId: transferStaffId,
      roomId: room ? room.id : null,
      roomNumber: room ? room.roomNumber : null,
    });
    showSuccessNotification({
      title: 'Reservation Transferred',
      description: room
        ? `Reservation handed to ${staff?.firstName} ${staff?.lastName} with Room ${room.roomNumber}.`
        : `Reservation handed to ${staff?.firstName} ${staff?.lastName}. Room assignment cleared.`,
    });
    setTransferOpen(false);
    setActiveBookingId(null);
    setTransferStaffId('');
    setTransferRoomId('');
  };

  // Check In
  const openCheckIn = (id: string) => {
    setActiveBookingId(id);
    setCheckInOpen(true);
  };

  const handleConfirmCheckIn = () => {
    if (!activeBookingId) return;
    const booking = bookings.find((b) => b.id === activeBookingId);
    if (!booking) return;

    if (booking.status !== 'confirmed') {
      showErrorNotification({
        title: 'Cannot Check In',
        description: 'Only confirmed reservations can be checked in. Approve it first.',
      });
      setCheckInOpen(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate + 'T00:00:00');
    if (checkIn > today) {
      showErrorNotification({
        title: 'Cannot Check In Yet',
        description: `Check-in date is ${booking.checkInDate}. Guest cannot be checked in before the scheduled date.`,
      });
      setCheckInOpen(false);
      return;
    }

    updateBooking(activeBookingId, {
      status: 'checked-in',
      paymentStatus: 'completed',
      checkInTime: new Date().toISOString(),
    });

    showSuccessNotification({
      title: 'Guest Checked In',
      description: `Guest ${booking.guestName} has been checked in to Room ${booking.roomNumber}.`,
    });
    setCheckInOpen(false);
    setActiveBookingId(null);
  };

  const renderActions = (booking: Booking) => (
    <div className="flex gap-1 flex-wrap">
      <>
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => handleApproveReservation(booking.id)}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
              title="Approve"
            >
              Approve
            </button>
            <button
              onClick={() => handleRejectReservation(booking.id)}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
              title="Reject"
            >
              Reject
            </button>
          </>
        )}
        {booking.status === 'confirmed' && (
          <button
            onClick={() => openCheckIn(booking.id)}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition flex items-center gap-1"
            title="Check In"
          >
            <LogIn size={12} />
            Check In
          </button>
        )}
        <button
          onClick={() => openTransfer(booking.id)}
          className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition flex items-center gap-1"
          title="Transfer to Staff"
        >
          <Send size={12} />
          Transfer
        </button>
        <button
          onClick={() => handleDeleteClick(booking.id)}
          className="p-1 hover:bg-gray-200 rounded transition"
          title="Delete"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      </>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Showing {filteredBookings.length} reservation{filteredBookings.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        viewMode === 'list'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                    }
                    >
                      <List size={16} />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        viewMode === 'calendar'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                    }
                    >
                      <Calendar size={16} />
                      Calendar
                    </button>
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="mt-3 flex flex-wrap gap-2">
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
                        statusFilter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar View */}
              {viewMode === 'calendar' ? (
                <div className="p-4">
                  <ReservationCalendar bookings={filteredBookings} rooms={rooms} />
                </div>
              ) : (
                <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Guest Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Check-In
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Check-Out
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Total Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          No reservations found for this filter.
                        </td>
                      </tr>
                    ) : filteredBookings.map((booking) => {
                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {booking.guestName}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {booking.guestEmail}
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-semibold">
                            {booking.roomNumber || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {booking.createdAt
                              ? new Date(booking.createdAt).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`${statusColors[booking.status]}`}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-semibold">
                            ₱{booking.totalPrice}
                          </td>
                          <td className="px-6 py-4">
                            {renderActions(booking)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No reservations found for this filter.</p>
                ) : (
                  filteredBookings.map((booking) => {
                    return (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{booking.guestName}</h3>
                            <p className="text-xs text-gray-600">{booking.guestEmail}</p>
                          </div>
                          <Badge
                            className={`${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Room:</span>
                            <p className="font-semibold">{booking.roomNumber || '—'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <p className="font-semibold">₱{booking.totalPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-In:</span>
                            <p className="font-semibold text-xs">
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-Out:</span>
                            <p className="font-semibold text-xs">
                              {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {renderActions(booking)}
                      </div>
                    );
                  })
                )}
              </div>
                </>
              )}
            </div>
          </div>
        </main>

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Reservation"
          description="Are you sure you want to delete this reservation? This action cannot be undone and the booking record will be permanently removed from the system."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
          }}
        />

        {/* Transfer to Staff Modal */}
        <Dialog open={transferOpen} onOpenChange={(open) => !open && setTransferOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Reservation to Staff</DialogTitle>
              <DialogDescription>
                Hand this reservation to a staff member for check-in handling. Room assignment is optional — leaving it blank clears any current room assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff member <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferStaffId}
                  onChange={(e) => setTransferStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a staff member...</option>
                  {staffAccounts
                    .filter((s) => s.status === 'active')
                    .map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} — {staff.position}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room (optional)
                </label>
                <select
                  value={transferRoomId}
                  onChange={(e) => setTransferRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No room assignment</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} — {room.type} (₱{room.pricePerNight}/night, sleeps {room.capacity})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choosing "No room assignment" clears the current room so the staff can assign one themselves.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransfer}
                disabled={!transferStaffId}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send size={16} className="mr-2" />
                Transfer to Staff
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check In Confirmation Modal */}
        <Dialog open={checkInOpen} onOpenChange={(open) => !open && setCheckInOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Confirm Guest Check-In</DialogTitle>
              <DialogDescription>
                You are about to check in <span className="font-semibold text-gray-900">{activeBooking?.guestName}</span>
                {activeBooking?.roomNumber ? ` to Room ${activeBooking.roomNumber}.` : '.'} The reservation status will change to "Checked In" and the room will be marked as occupied. Only staff can check out guests afterward.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckInOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCheckIn}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogIn size={16} className="mr-2" />
                Confirm Check-In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
