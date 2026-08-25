import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Badge } from '../../components/ui/badge';
import { Edit2, Trash2, Plus, MoreVertical, Search, BedDouble, Users, ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification } from '../../lib/notifications';
import { EditRoomModal } from '../../components/admin/edit-room-modal';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import { Room } from '../../lib/types';

const statusColors: { [key: string]: string } = {
  available: 'bg-green-100 text-green-800 border-green-200',
  reserved: 'bg-blue-100 text-blue-800 border-blue-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function RoomsPage() {
  const navigate = useNavigate();
  const { rooms, addRoom, updateRoom, deleteRoom } = useBooking();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'single',
    pricePerNight: '',
    capacity: '',
    image: '',
  });

  // Add Room/Facility
  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.pricePerNight || !newRoom.capacity) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const roomData: Room = {
      id: Date.now().toString(),
      roomNumber: newRoom.roomNumber,
      type: newRoom.type as 'single' | 'double' | 'suite',
      pricePerNight: parseFloat(newRoom.pricePerNight.toString()),
      capacity: parseInt(newRoom.capacity.toString()),
      amenities: [],
      status: 'available',
      image: newRoom.image,
    };

    addRoom(roomData);

    showSuccessNotification({
      title: 'Room Added',
      description: `Room ${newRoom.roomNumber} has been added successfully.`,
    });
    setNewRoom({ roomNumber: '', type: 'single', pricePerNight: '', capacity: '', image: '' });
    setShowAddRoom(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  // Save Edited Room
  const handleSaveRoom = (updatedRoom: Room) => {
    updateRoom(updatedRoom.id, updatedRoom);
    showSuccessNotification({
      title: 'Room Updated',
      description: `Room ${updatedRoom.roomNumber} has been updated successfully.`,
    });
  };

  // Update Room Status (Available / Occupied / Maintenance)
  const handleStatusChange = (id: string, newStatus: string) => {
    updateRoom(id, { status: newStatus as any });
    showSuccessNotification({
      title: 'Status Updated',
      description: `Room status changed to ${newStatus}.`,
    });
  };

  // Block Room for Maintenance
  const handleBlockMaintenance = (id: string) => {
    updateRoom(id, { status: 'maintenance' });
    showWarningNotification({
      title: 'Maintenance Mode',
      description: 'Room has been blocked for maintenance.',
    });
  };

  // Mark Room as Available
  const handleMarkAvailable = (id: string) => {
    updateRoom(id, { status: 'available' });
    showSuccessNotification({
      title: 'Room Available',
      description: 'Room is now available for booking.',
    });
  };

  // Delete/Deactivate Room - Open Dialog
  const handleDeleteClick = (id: string) => {
    setRoomToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete);
      showErrorNotification({
        title: 'Room Deleted',
        description: 'The room has been permanently deleted.',
      });
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesType = !searchType || room.type === searchType;
    const matchesQuery = !searchQuery || room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
              <button
                onClick={() => setShowAddRoom(!showAddRoom)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                Add Room
              </button>
            </div>

            {/* Add Room Form */}
            {showAddRoom && (
              <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Room</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 101"
                        value={newRoom.roomNumber}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, roomNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type
                      </label>
                      <select
                        value={newRoom.type}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="suite">Suite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price/Night (₱) *
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g., 1500"
                        value={newRoom.pricePerNight}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, pricePerNight: e.target.value.replace(/[^0-9.]/g, '') })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 2"
                        value={newRoom.capacity}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, capacity: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Image
                    </label>
                    {newRoom.image && (
                      <div className="mb-3">
                        <img
                          src={newRoom.image}
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
                            setNewRoom({ ...newRoom, image: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a JPG, PNG, or other image to display as the room preview</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRoom}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Add Room
                    </button>
                    <button
                      onClick={() => setShowAddRoom(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by room number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 sm:w-44"
                >
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>

            {/* Summary bar */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </p>
            </div>

            {/* Room Card Grid - with photos like customer view */}
            {filteredRooms.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <BedDouble size={42} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No rooms found. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-lg transition group"
                  >
                    {/* Room image */}
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                      {room.image ? (
                        <img
                          src={room.image}
                          alt={`Room ${room.roomNumber}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-blue-300">
                          <BedDouble size={48} />
                        </div>
                      )}
                      {/* Status badge overlay */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${statusColors[room.status]} border`}>
                          {room.status === 'reserved' ? 'Reserved' : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                      </div>
                      {/* Action menu overlay */}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="bg-white/90 backdrop-blur p-2 rounded-lg shadow hover:bg-white transition flex items-center gap-1 text-gray-700">
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleOpenEditModal(room)}>
                              <Edit2 size={16} className="mr-2 text-blue-600" />
                              <span>Edit Room</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockMaintenance(room.id)}>
                              <span className="text-yellow-600 font-medium">Block Maintenance</span>
                            </DropdownMenuItem>
                            {room.status !== 'available' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMarkAvailable(room.id)}>
                                  <span className="text-green-600 font-medium">Mark Available</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(room.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" />
                              <span>Delete Room</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Room details */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 capitalize">
                          {room.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Users size={16} />
                          <span>{room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BedDouble size={16} />
                          <span className="capitalize">{room.type} room</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{room.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price and actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Per Night</p>
                          <p className="text-lg font-bold text-gray-800">₱{room.pricePerNight}</p>
                        </div>
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <EditRoomModal
          room={selectedRoom}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
        />

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Room"
          description="Are you sure you want to delete this room? This action cannot be undone and all associated data will be permanently removed."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setRoomToDelete(null);
          }}
        />
      </div>
    </div>
  );
}
