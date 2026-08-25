import { useState } from 'react';
import { useBooking } from '../../lib/context';
import { CustomerHeader } from '../../components/customer/customer-header';
import { EventTypeSelector } from '../../components/customer/event-type-selector';
import { EventBookingModal } from '../../components/customer/event-booking-modal';
import { CustomerEventPaymentModal } from '../../components/customer/event-payment-modal';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { EventBooking } from '../../lib/types';

export default function EventsPage() {
  const { services, addEventBooking, eventBookings, eventTypePrices } = useBooking();
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newEventBooking, setNewEventBooking] = useState<EventBooking | null>(null);

  const addonServices = services.filter((s) => s.category === 'function-hall' && s.available);

  const handleEventSelect = (eventType: string) => {
    setSelectedEventType(eventType);
    setShowModal(true);
  };

  const handleBookingConfirm = (bookingData: any) => {
    const newBooking: EventBooking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    addEventBooking(newBooking);
    setNewEventBooking(newBooking);
    setShowModal(false);
    setSelectedEventType(null);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    setNewEventBooking(null);
  };

  const getEventName = (type: string) => {
    const et = eventTypePrices.find((p) => p.type === type);
    return et?.name || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader currentPage="events" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Event</h1>
          <p className="text-lg text-gray-600">
            Create unforgettable memories at our premium event venues with professional services
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Event Type</h2>
          <EventTypeSelector onSelect={handleEventSelect} />
        </div>

        {eventBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Event Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getEventName(booking.eventType)}
                      </CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Host Name</p>
                        <p className="font-semibold text-gray-900">{booking.guestName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Number of Guests</p>
                        <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Event Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Price</p>
                        <p className="font-semibold text-blue-600">₱{booking.totalPrice}</p>
                      </div>
                    </div>

                    {booking.serviceIds.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-2">Selected Add-ons:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {booking.serviceIds.map((serviceId) => {
                            const svc = addonServices.find((s) => s.id === serviceId);
                            return (
                              <li key={serviceId} className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                {svc?.name || serviceId}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && selectedEventType && (
        <EventBookingModal
          eventType={selectedEventType}
          services={addonServices}
          onClose={() => {
            setShowModal(false);
            setSelectedEventType(null);
          }}
          onConfirm={handleBookingConfirm}
        />
      )}

      <CustomerEventPaymentModal
        event={newEventBooking}
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setNewEventBooking(null);
        }}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
