import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader } from '../../components/customer/customer-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, DoorOpen, Users, X, Edit2, Download, Clock } from 'lucide-react';
import { EditCustomerBookingModal } from '../../components/customer/edit-booking-modal';
import { ReceiptModal } from '../../components/customer/receipt-modal';
import { Booking, EventBooking } from '../../lib/types';
import { showSuccessNotification } from '../../lib/notifications';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { bookings, eventBookings, deleteBooking, deleteEventBooking, updateBooking, eventTypePrices } = useBooking();
  const getEventName = (type: string) => eventTypePrices.find((p) => p.type === type)?.name || type;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ booking?: Booking | null; event?: EventBooking | null }>({});

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      deleteBooking(bookingId);
      showSuccessNotification({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
    }
  };

  const handleCancelEvent = (eventId: string) => {
    if (confirm('Are you sure you want to cancel this event booking?')) {
      deleteEventBooking(eventId);
      showSuccessNotification({
        title: 'Event Cancelled',
        description: 'Your event booking has been cancelled successfully.',
      });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleSaveBooking = (updatedBooking: Booking) => {
    updateBooking(updatedBooking.id, updatedBooking);
    showSuccessNotification({
      title: 'Booking Updated',
      description: 'Your booking details have been updated.',
    });
  };

  const openReceiptModal = (booking?: Booking | null, event?: EventBooking | null) => {
    setReceiptData({ booking, event });
    setIsReceiptOpen(true);
  };

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-green-100 text-green-800',
    'checked-out': 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.checkInDate) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.checkOutDate) <= new Date()
  );
  const currentBookings = bookings.filter(
    (b) =>
      new Date(b.checkInDate) <= new Date() &&
      new Date(b.checkOutDate) > new Date()
  );

  const upcomingEvents = eventBookings.filter(
    (e) => new Date(e.eventDate) > new Date()
  );
  const pastEvents = eventBookings.filter(
    (e) => new Date(e.eventEndDate) <= new Date()
  );
  const activeEvents = eventBookings.filter(
    (e) =>
      new Date(e.eventDate) <= new Date() &&
      new Date(e.eventEndDate) > new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader currentPage="bookings" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

        {/* Current Bookings */}
        {currentBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Current Stay
            </h2>
            <div className="space-y-4">
              {currentBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-l-4 border-l-green-500 hover:shadow-lg transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-green-600 bg-green-50 w-20 h-20 rounded-lg flex items-center justify-center">
                            {booking.roomNumber}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Booking ID: {booking.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              Room {booking.roomNumber}
                            </p>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-600" />
                              <span>
                                {new Date(booking.checkInDate).toLocaleDateString()} to{' '}
                                {new Date(booking.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                            {booking.checkInTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-green-600" />
                                <span>
                                  Check-in: {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                            {booking.checkOutTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-red-600" />
                                <span>
                                  Check-out: {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {booking.numberOfGuests} guest
                              {booking.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Price</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₱{booking.totalPrice}
                          </p>
                        </div>
                        <button
                          onClick={() => openReceiptModal(booking, null)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Upcoming Bookings
            </h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-l-4 border-l-blue-500 hover:shadow-lg transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-blue-600 bg-blue-50 w-20 h-20 rounded-lg flex items-center justify-center">
                            {booking.roomNumber}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Booking ID: {booking.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              Room {booking.roomNumber}
                            </p>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-600" />
                              <span>
                                {new Date(booking.checkInDate).toLocaleDateString()} to{' '}
                                {new Date(booking.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                            {booking.checkInTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-green-600" />
                                <span>
                                  Check-in: {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                            {booking.checkOutTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-red-600" />
                                <span>
                                  Check-out: {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {booking.numberOfGuests} guest
                              {booking.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Price</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₱{booking.totalPrice}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-col">
                          <button
                            onClick={() => openReceiptModal(booking, null)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <Download size={16} />
                            Receipt
                          </button>
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleEditBooking(booking)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {booking.status !== 'checked-out' && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Past Bookings
            </h2>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="border-l-4 border-l-gray-400 opacity-75 hover:opacity-100 transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-gray-400 bg-gray-100 w-20 h-20 rounded-lg flex items-center justify-center">
                            {booking.roomNumber}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Booking ID: {booking.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              Room {booking.roomNumber}
                            </p>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-600" />
                              <span>
                                {new Date(booking.checkInDate).toLocaleDateString()} to{' '}
                                {new Date(booking.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                            {booking.checkInTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-green-600" />
                                <span>
                                  Check-in: {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                            {booking.checkOutTime && (
                              <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                <Clock size={12} className="text-red-600" />
                                <span>
                                  Check-out: {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {booking.numberOfGuests} guest
                              {booking.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Price</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₱{booking.totalPrice}
                          </p>
                        </div>
                        <button
                          onClick={() => openReceiptModal(booking, null)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EVENT BOOKINGS SECTION */}
        {activeEvents.length > 0 && (
          <div className="mb-12 mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Active Events
            </h2>
            <div className="space-y-4">
              {activeEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-l-4 border-l-purple-500 hover:shadow-lg transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-purple-600 bg-purple-50 w-20 h-20 rounded-lg flex items-center justify-center">
                            {event.eventType === 'birthday' ? '🎂' : event.eventType === 'wedding' ? '💒' : '👥'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Event ID: {event.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              {getEventName(event.eventType)}
                            </p>
                            <Badge className={statusColors[event.status]}>
                              {event.status.charAt(0).toUpperCase() +
                                event.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />
                            <span>
                              {new Date(event.eventDate).toLocaleDateString()} to{' '}
                              {new Date(event.eventEndDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {event.numberOfGuests} guest
                              {event.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Price</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₱{event.totalPrice}
                          </p>
                        </div>
                        <button
                          onClick={() => openReceiptModal(null, event)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div className="mb-12 mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-l-4 border-l-purple-400 hover:shadow-lg transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-purple-500 bg-purple-50 w-20 h-20 rounded-lg flex items-center justify-center">
                            {event.eventType === 'birthday' ? '🎂' : event.eventType === 'wedding' ? '💒' : '👥'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Event ID: {event.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              {getEventName(event.eventType)}
                            </p>
                            <Badge className={statusColors[event.status]}>
                              {event.status.charAt(0).toUpperCase() +
                                event.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />
                            <span>
                              {new Date(event.eventDate).toLocaleDateString()} to{' '}
                              {new Date(event.eventEndDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {event.numberOfGuests} guest
                              {event.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Price</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₱{event.totalPrice}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openReceiptModal(null, event)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <Download size={16} />
                            Receipt
                          </button>
                          {event.status !== 'completed' && (
                            <button
                              onClick={() => handleCancelEvent(event.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="mb-12 mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Past Events
            </h2>
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-l-4 border-l-gray-400 opacity-75 hover:opacity-100 transition"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-gray-400 bg-gray-100 w-20 h-20 rounded-lg flex items-center justify-center">
                            {event.eventType === 'birthday' ? '🎂' : event.eventType === 'wedding' ? '💒' : '👥'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Event ID: {event.id}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                              {getEventName(event.eventType)}
                            </p>
                            <Badge className={statusColors[event.status]}>
                              {event.status.charAt(0).toUpperCase() +
                                event.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />
                            <span>
                              {new Date(event.eventDate).toLocaleDateString()} to{' '}
                              {new Date(event.eventEndDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            <span>
                              {event.numberOfGuests} guest
                              {event.numberOfGuests > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Total Price</p>
                        <p className="text-3xl font-bold text-gray-800">
                          ₱{event.totalPrice}
                        </p>
                        <button
                          onClick={() => openReceiptModal(null, event)}
                          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 w-full"
                        >
                          <Download size={16} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && eventBookings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DoorOpen size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No bookings yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start exploring and make your first booking!
              </p>
            </CardContent>
          </Card>
        )}

        <EditCustomerBookingModal
          booking={selectedBooking}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBooking(null);
          }}
          onSave={handleSaveBooking}
        />

        <ReceiptModal
          booking={receiptData.booking}
          event={receiptData.event}
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setReceiptData({});
          }}
        />
      </main>
    </div>
  );
}
