'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { X, Check } from 'lucide-react';
import { Service } from '../../lib/types';
import { useBooking } from '../../lib/context';

interface EventBookingModalProps {
  eventType: string;
  services: Service[];
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

export function EventBookingModal({
  eventType,
  services,
  onClose,
  onConfirm,
}: EventBookingModalProps) {
  const { eventTypePrices } = useBooking();
  const eventTypeInfo = eventTypePrices.find((p) => p.type === eventType);
  const defaultPrice = eventTypeInfo?.price || 0;
  const eventDisplayName = eventTypeInfo?.name || eventType;

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(50);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState(defaultPrice);

  const calculateTotal = () => {
    let total = basePrice;

    selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        total += service.price;
      }
    });

    return total;
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleConfirm = () => {
    if (
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !eventDate ||
      !eventEndDate
    ) {
      alert('Please fill in all required fields');
      return;
    }

    onConfirm({
      guestName,
      guestEmail,
      guestPhone,
      eventType,
      eventDate,
      eventEndDate,
      numberOfGuests,
      selectedRooms: [],
      serviceIds: selectedServices,
      basePrice,
      totalPrice: calculateTotal(),
    });
  };

  const totalPrice = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
          <div>
            <CardTitle className="text-2xl">
              Book {eventDisplayName}
            </CardTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Event Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Event Dates & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Event Price (₱)
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold flex items-center">
                  ₱{basePrice.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Price is set by admin. Contact admin to modify.</p>
              </div>
            </div>
          </div>



          {/* Service Add-ons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Add Service Add-ons</h3>
            {services.length === 0 && (
              <p className="text-sm text-gray-500 italic">No add-on services available for this event.</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        {selectedServices.includes(service.id) && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      {service.capacity && (
                        <p className="text-xs text-gray-500 mt-1">
                          Capacity: {service.capacity} people
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-gray-800">₱{service.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary and Confirm */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Base Event Price:</span>
                <span className="font-semibold">₱{basePrice.toFixed(2)}</span>
              </div>
            </div>
            {selectedServices.length > 0 && (
              <>
                <div className="border-t border-blue-200 pt-4 mb-4 space-y-2">
                  <p className="font-semibold text-gray-800 mb-3">Selected Services:</p>
                  {selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    return (
                      <div key={serviceId} className="flex justify-between text-sm text-gray-700">
                        <span>{service?.name}</span>
                        <span>₱{service?.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="border-t border-blue-200 pt-4 flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-800">Total Price</p>
              <p className="text-3xl font-bold text-blue-600">₱{totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
