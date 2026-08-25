'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '../../lib/types';
import { X } from 'lucide-react';

interface EditCustomerBookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
}

export function EditCustomerBookingModal({
  booking,
  isOpen,
  onClose,
  onSave,
}: EditCustomerBookingModalProps) {
  const [formData, setFormData] = useState<Booking | null>(null);

  useEffect(() => {
    if (booking) {
      setFormData({ ...booking });
    }
  }, [booking]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof Booking, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  // Only allow editing if booking is still pending or confirmed
  const isEditable = formData.status === 'pending' || formData.status === 'confirmed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {!isEditable && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              This booking cannot be edited as it is {formData.status}. Please contact support to make changes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => handleChange('guestName', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleChange('guestEmail', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => handleChange('guestPhone', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests
              </label>
              <input
                type="number"
                value={formData.numberOfGuests}
                onChange={(e) =>
                  handleChange('numberOfGuests', parseInt(e.target.value))
                }
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => handleChange('checkInDate', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                <p className="text-gray-700 capitalize font-semibold">{formData.status}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Close
            </button>
            {isEditable && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
