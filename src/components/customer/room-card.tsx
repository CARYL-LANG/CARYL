'use client';

import { Room } from '../../lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, Wifi, Tv } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onBook: (roomId: string) => void;
  isAvailable: boolean;
}

export function RoomCard({ room, onBook, isAvailable }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl overflow-hidden">
        {room.image ? (
          <img 
            src={room.image} 
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>🛏️</span>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-gray-800">Room {room.roomNumber}</h3>
          <Badge
            className={
              room.status === 'available'
                ? 'bg-green-100 text-green-800'
                : room.status === 'reserved'
                ? 'bg-blue-100 text-blue-800'
                : room.status === 'occupied'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {room.status === 'reserved' ? 'Reserved' : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </Badge>
        </div>

        <p className="text-gray-600 capitalize mb-4">{room.type} Room</p>

        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span>{room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Per Night</p>
            <p className="text-2xl font-bold text-gray-800">₱{room.pricePerNight}</p>
          </div>
          <Button
            onClick={() => onBook(room.id)}
            disabled={!isAvailable}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isAvailable ? 'Book Now' : 'Not Available'}
          </Button>
        </div>
      </div>
    </div>
  );
}
