'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '../../lib/types';
import { X } from 'lucide-react';

interface EditRoomModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRoom: Room) => void;
}

export function EditRoomModal({
  room,
  isOpen,
  onClose,
  onSave,
}: EditRoomModalProps) {
  const [formData, setFormData] = useState<Room | null>(null);
  const [amenitiesInput, setAmenitiesInput] = useState('');

  useEffect(() => {
    if (room) {
      setFormData({ ...room });
      setAmenitiesInput(room.amenities.join(', '));
    }
  }, [room]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof Room, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleAmenitiesChange = (value: string) => {
    setAmenitiesInput(value);
    const amenitiesList = value
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a);
    setFormData({
      ...formData,
      amenities: amenitiesList,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Room</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Night (₱)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.pricePerNight === 0 ? '' : formData.pricePerNight}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  handleChange('pricePerNight', raw === '' ? 0 : parseFloat(raw));
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  handleChange('capacity', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities (comma-separated)
            </label>
            <textarea
              value={amenitiesInput}
              onChange={(e) => handleAmenitiesChange(e.target.value)}
              rows={3}
              placeholder="e.g., WiFi, TV, Bathroom, Balcony"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Image
            </label>
            {formData.image && (
              <div className="mb-3">
                <img 
                  src={formData.image} 
                  alt="Room preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    handleChange('image', event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">Upload a JPG, PNG, or other image format to display as the room preview</p>
          </div>

          <div className="flex gap-3 justify-end mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
