import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { EventPaymentModal } from '../../components/staff/event-payment-modal';
import { EventBooking } from '../../lib/types';
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

export default function StaffEventsPage() {
  const navigate = useNavigate();
  const { eventBookings, updateEventBooking } = useBooking();
  const { eventTypePrices } = useBooking();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventBooking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredEvents = eventBookings.filter((event) => {
    if (statusFilter === 'all') return true;
    return event.status === statusFilter;
  });

  const handleAcceptEvent = (event: EventBooking) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const handleDeclineEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to decline this event?')) {
      updateEventBooking(eventId, { status: 'cancelled' });
      alert('Event declined successfully');
    }
  };

  const handlePaymentConfirm = () => {
    if (selectedEvent) {
      updateEventBooking(selectedEvent.id, { status: 'confirmed' });
      alert('Event accepted and payment recorded!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getEventName = (type: string) => {
    const et = eventTypePrices.find((p) => p.type === type);
    return et?.name || type;
  };

  const getEventTypeIcon = (_eventType: string) => '📅';

  const pendingCount = eventBookings.filter((e) => e.status === 'pending').length;
  const confirmedCount = eventBookings.filter((e) => e.status === 'confirmed').length;
  const totalRevenue = eventBookings
    .filter((e) => e.status === 'confirmed')
    .reduce((sum, e) => sum + e.totalPrice, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <StaffSidebar />

      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Review, accept, and manage event bookings</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-xs text-gray-500 mt-2">Waiting for acceptance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confirmed Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
                <p className="text-xs text-gray-500 mt-2">Ready to proceed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue (Confirmed)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">₱{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-2">From confirmed events</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <span className="font-semibold text-gray-700">Filter by Status:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 text-lg">No events found for the selected status</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="border-l-4 border-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <span className="text-3xl">{getEventTypeIcon(event.eventType)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">
                            {getEventName(event.eventType)}
                            </CardTitle>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                              {event.status.toUpperCase()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Host: <span className="font-semibold">{event.guestName}</span></p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Number of Guests</p>
                        <p className="text-lg font-bold text-gray-900">{event.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Event Date</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Price</p>
                        <p className="text-lg font-bold text-purple-600">₱{event.totalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Payment Status</p>
                        <p className="text-lg font-bold text-gray-900">
                          {event.paymentStatus ? (
                            <span className={event.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                              {event.paymentStatus.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-red-600">UNPAID</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">Email:</span> {event.guestEmail}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">Phone:</span> {event.guestPhone}
                      </p>
                    </div>

                    {event.serviceIds.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Selected Services:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {event.serviceIds.map((serviceId) => (
                            <li key={serviceId} className="flex items-center gap-2">
                              <span className="text-purple-600">✓</span>
                              {serviceId}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      {event.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleAcceptEvent(event)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            ✓ Accept Event & Record Payment
                          </Button>
                          <Button
                            onClick={() => handleDeclineEvent(event.id)}
                            variant="outline"
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {event.status === 'confirmed' && (
                        <Button disabled className="flex-1 bg-gray-300 text-gray-600">
                          Event Confirmed
                        </Button>
                      )}
                      {event.status === 'cancelled' && (
                        <Button disabled className="flex-1 bg-gray-300 text-gray-600">
                          Event Cancelled
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <EventPaymentModal
          event={selectedEvent}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedEvent(null);
          }}
          onConfirm={handlePaymentConfirm}
        />
      </main>
    </div>
  );
}
