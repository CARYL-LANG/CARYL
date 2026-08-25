'use client';

import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { Booking, EventBooking } from '../../lib/types';
import { useBooking } from '../../lib/context';

interface ReceiptModalProps {
  booking?: Booking | null;
  event?: EventBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ booking, event, isOpen, onClose }: ReceiptModalProps) {
  const { rooms, eventRooms, services, eventTypePrices } = useBooking();
  const getEventName = (type: string) => eventTypePrices.find((p) => p.type === type)?.name || type;
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || (!booking && !event)) return null;

  const isEvent = !!event;
  const data = event || booking;

  // Get room details
  const getRoomName = (roomId: string) => {
    const roomObj = isEvent
      ? eventRooms.find((r) => r.id === roomId)
      : rooms.find((r) => r.id === roomId);
    return roomObj ? roomObj.roomNumber : roomId;
  };

  // Get service details
  const getServiceDetails = (serviceIds: string[]) => {
    return serviceIds.map((id) => {
      const service = services.find((s) => s.id === id);
      return service ? { name: service.name, price: service.price } : null;
    }).filter(Boolean);
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(receiptRef.current.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const serviceDetails = isEvent ? getServiceDetails(event?.serviceIds || []) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEvent ? 'Event Receipt' : 'Booking Receipt'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8 bg-white">
          {/* Company Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-800">PRING KUYA&apos;S INN</h1>
            <p className="text-gray-600 mt-2">Premium Accommodation & Event Venue</p>
            <p className="text-sm text-gray-500">Email: info@pringkuya.com | Phone: +63-2-XXXX-XXXX</p>
          </div>

          {/* Receipt Title and Number */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isEvent ? 'EVENT BOOKING RECEIPT' : 'ROOM BOOKING RECEIPT'}
              </h2>
              <p className="text-gray-600">Receipt #{data?.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                <strong>Date:</strong> {new Date(data?.createdAt || '').toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <strong>Status:</strong>{' '}
                <span
                  className={`font-semibold ${
                    data?.status === 'completed'
                      ? 'text-green-600'
                      : data?.status === 'cancelled'
                      ? 'text-red-600'
                      : data?.status === 'confirmed'
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {data?.status?.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-purple-600 pb-2">
                GUEST INFORMATION
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Name:</strong> {data?.guestName}
                </p>
                <p>
                  <strong>Email:</strong> {data?.guestEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {data?.guestPhone}
                </p>
                <p>
                  <strong>Number of Guests:</strong> {data?.numberOfGuests}
                </p>
              </div>
            </div>

            {/* Event/Booking Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-purple-600 pb-2">
                {isEvent ? 'EVENT DETAILS' : 'BOOKING DETAILS'}
              </h3>
              <div className="space-y-2 text-gray-700">
                {isEvent ? (
                  <>
                    <p>
                      <strong>Event Type:</strong>{' '}
                      {getEventName(event?.eventType || '')}
                    </p>
                    <p>
                      <strong>Event Date:</strong>{' '}
                      {new Date(event?.eventDate || '').toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{' '}
                      {new Date(event?.eventEndDate || '').toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Room:</strong> Room {booking?.roomNumber}
                    </p>
                    <p>
                      <strong>Check-in:</strong>{' '}
                      {new Date(booking?.checkInDate || '').toLocaleDateString()}
                      {booking?.checkInTime && (
                        <span className="text-gray-600">
                          {' '}at{' '}
                          {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      )}
                    </p>
                    <p>
                      <strong>Check-out:</strong>{' '}
                      {new Date(booking?.checkOutDate || '').toLocaleDateString()}
                      {booking?.checkOutTime && (
                        <span className="text-gray-600">
                          {' '}at{' '}
                          {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Services/Rooms Summary */}
          {isEvent && (event?.selectedRooms?.length || 0) > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-purple-600 pb-2">
                EVENT ROOMS RESERVED
              </h3>
              <div className="space-y-2 text-gray-700">
                {event?.selectedRooms?.map((roomId, idx) => (
                  <p key={idx}>
                    <strong>Room {idx + 1}:</strong> {getRoomName(roomId)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {serviceDetails.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-purple-600 pb-2">
                SERVICES & ADD-ONS
              </h3>
              <div className="space-y-2">
                {serviceDetails.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>{service?.name}</span>
                    <span className="font-semibold">₱{service?.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="border-2 border-gray-300 rounded-lg p-6 mb-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-purple-600 pb-2">
              PAYMENT SUMMARY
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Base Price:</span>
                <span>₱{(event?.basePrice || booking?.totalPrice || 0).toFixed(2)}</span>
              </div>
              {serviceDetails.length > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Services:</span>
                  <span>
                    ₱
                    {serviceDetails
                      .reduce((sum, s) => sum + (s?.price || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-purple-600">
                <span>TOTAL AMOUNT:</span>
                <span>₱{data?.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {data?.paymentMethod && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">PAYMENT INFORMATION</h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Payment Method:</strong>{' '}
                  {data.paymentMethod === 'counter'
                    ? 'Cash at Venue'
                    : data.paymentMethod.toUpperCase()}
                </p>
                {data.paymentReference && (
                  <p>
                    <strong>Reference Number:</strong> {data.paymentReference}
                  </p>
                )}
                <p>
                  <strong>Payment Status:</strong>{' '}
                  <span
                    className={`font-semibold ${
                      data.paymentStatus === 'completed'
                        ? 'text-green-600'
                        : data.paymentStatus === 'cancelled'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {data.paymentStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-300 pt-6 mt-8">
            <p className="text-gray-600 text-sm mb-2">
              Thank you for choosing Pring Kuya&apos;s Inn!
            </p>
            <p className="text-gray-500 text-xs">
              This is an official receipt. Please keep it for your records.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex gap-4 justify-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
          >
            <Printer size={20} />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
