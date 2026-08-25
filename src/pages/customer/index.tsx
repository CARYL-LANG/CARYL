import { CustomerHeader } from '../../components/customer/customer-header';
import { RoomCard } from '../../components/customer/room-card';
import { BookingModal } from '../../components/customer/booking-modal';
import { PaymentModal } from '../../components/customer/payment-modal';
import { EditProfileModal } from '../../components/customer/edit-profile-modal';
import { useBooking } from '../../lib/context';
import { Room, Booking } from '../../lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { User, Lock } from 'lucide-react';
import { showSuccessNotification, showErrorNotification, showInfoNotification } from '../../lib/notifications';

export default function CustomerPage() {
  const { rooms, addBooking, bookings, deleteBooking, currentUser, customerAccounts, changeCustomerPassword, eventBookings } = useBooking();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchCapacity, setSearchCapacity] = useState<string>('');
  const [searchPrice, setSearchPrice] = useState<string>('');
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: currentUser.firstName || 'John',
    lastName: currentUser.lastName || 'Doe',
    email: currentUser.email || 'john.doe@email.com',
    phone: currentUser.phone || '09123456789',
  });

  useEffect(() => {
    setMyBookings(bookings.filter((b) => b.bookingType === 'room' && b.guestEmail === currentUser.email));
  }, [bookings, currentUser.email]);

  const currentCustomerAccount = customerAccounts.find((c) => c.id === currentUser.id);

  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = (updatedProfile: any) => {
    setProfileData(updatedProfile);
    showSuccessNotification({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.',
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
      });
      return;
    }
    if (currentPassword !== currentCustomerAccount?.password) {
      showErrorNotification({
        title: 'Invalid Current Password',
        description: 'The current password you entered is incorrect.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorNotification({
        title: 'Password Mismatch',
        description: 'New passwords do not match. Please try again.',
      });
      return;
    }
    changeCustomerPassword(currentUser.id, newPassword);
    showSuccessNotification({
      title: 'Password Changed',
      description: 'Your password has been changed successfully. The new password will be used for your next login.',
    });
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBookRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    if (room.status === 'maintenance') {
      showErrorNotification({
        title: 'Room Unavailable',
        description: `Room ${room.roomNumber} is under maintenance. Please choose another room.`,
      });
      return;
    }

    // 'available', 'reserved', and 'occupied' rooms can all be booked;
    // the booking modal checks date conflicts so a room can be booked
    // for dates that don't overlap with existing reservations.
    setSelectedRoom(room);
    setIsModalOpen(true);
    showInfoNotification({
      title: 'Book Room',
      description: `Booking Room ${room.roomNumber} (${room.type})`,
    });
  };

  const handleConfirmBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `BOOKING-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    addBooking(newBooking);
    setMyBookings([...myBookings, newBooking]);
    setIsModalOpen(false);
    setSelectedBookingForPayment(newBooking);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = () => {
    showSuccessNotification({
      title: 'Booking Confirmed',
      description: 'Your booking has been confirmed. Payment details have been recorded.',
    });
  };

  const handleViewReservation = (bookingId: string) => {
    const booking = myBookings.find((b) => b.id === bookingId);
    if (booking) {
      showInfoNotification({
        title: 'Reservation Details',
        description: `Room ${booking.roomNumber} | ${booking.checkInDate} to ${booking.checkOutDate}`,
      });
    }
  };

  const handleCancelReservation = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      deleteBooking(bookingId);
      setMyBookings(myBookings.filter((b) => b.id !== bookingId));
      showErrorNotification({
        title: 'Reservation Cancelled',
        description: 'Your reservation has been cancelled successfully.',
      });
    }
  };

  const availableRooms = rooms.filter((r) => r.status === 'available');
  const myEventBookings = eventBookings.filter((b) => b.guestEmail === currentUser.email);

  const filteredRooms = rooms.filter((room) => {
    const typeMatch = filterType === 'all' || room.type === filterType;
    const capacityMatch = !searchCapacity || room.capacity >= parseInt(searchCapacity);
    const priceMatch = !searchPrice || room.pricePerNight <= parseInt(searchPrice);
    return typeMatch && capacityMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader currentPage="rooms" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-2 justify-end">
          <button
            onClick={() => setShowAccountSettings(!showAccountSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex items-center gap-2"
          >
            <User size={18} />
            Account Settings
          </button>
        </div>

        {showAccountSettings && (
          <Card className="mb-8 border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                <button
                  onClick={handleOpenEditProfileModal}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  Security
                </h3>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>

                {showChangePassword && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="w-full px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Search & Filter Rooms</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Room Type</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setFilterType('single')}
                  className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                    filterType === 'single'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setFilterType('double')}
                  className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                    filterType === 'double'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Double
                </button>
                <button
                  onClick={() => setFilterType('suite')}
                  className={`px-4 py-2 rounded-lg transition ${
                    filterType === 'suite'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Suite
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Minimum Capacity</label>
                <input
                  type="number"
                  placeholder="Filter by capacity"
                  value={searchCapacity}
                  onChange={(e) => setSearchCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Maximum Price (PHP)</label>
                <input
                  type="number"
                  placeholder="Filter by price"
                  value={searchPrice}
                  onChange={(e) => setSearchPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{availableRooms.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{myBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Lowest Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                PHP {rooms.length > 0 ? Math.min(...rooms.map((r) => r.pricePerNight)) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Available Rooms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={handleBookRoom}
                isAvailable={room.status !== 'maintenance'}
              />
            ))}
          </div>
        </div>


      </main>

      <BookingModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />

      <PaymentModal
        booking={selectedBookingForPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedBookingForPayment(null);
        }}
        onConfirm={handlePaymentConfirm}
      />

      <EditProfileModal
        profile={profileData}
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
