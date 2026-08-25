import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LogOut, Search, Edit2, Printer } from 'lucide-react';
import { EditReservationModal } from '../../components/admin/edit-reservation-modal';
import { ReceiptModal } from '../../components/customer/receipt-modal';
import { Booking } from '../../lib/types';
import { showSuccessNotification } from '../../lib/notifications';

export default function CheckOutPage() {
  const navigate = useNavigate();
  const { bookings, updateBooking } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const checkedInGuests = bookings.filter((b) => b.status === 'checked-in');

  const filteredBookings = checkedInGuests.filter(
    (b) =>
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.roomNumber || '').includes(searchTerm)
  );

  const handleOpenEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleSaveBooking = (updatedBooking: Booking) => {
    updateBooking(updatedBooking.id, updatedBooking);
    showSuccessNotification({
      title: 'Booking Updated',
      description: 'The booking has been updated successfully.',
    });
  };

  const handleCheckOut = (bookingId: string) => {
    updateBooking(bookingId, {
      status: 'checked-out',
      checkOutTime: new Date().toISOString(),
      assignedStaffId: null,
      roomId: null,
      roomNumber: null,
    });
    showSuccessNotification({
      title: 'Guest Checked Out',
      description: 'Guest has been checked out successfully. Staff and room assignments have been cleared.',
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Guest Check-Out
              </h2>
              <div className="relative">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by guest name or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <LogOut size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">
                    No checked-in guests found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl font-bold text-orange-600 bg-orange-50 w-16 h-16 rounded-lg flex items-center justify-center">
                              {booking.roomNumber}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-800">
                                {booking.guestName}
                              </h3>
                              <p className="text-gray-600">{booking.guestEmail}</p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>Check-Out: {booking.checkOutDate}</span>
                                <span>Guests: {booking.numberOfGuests}</span>
                                <Badge className="bg-green-100 text-green-800">
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1).replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Bill</p>
                            <p className="text-2xl font-bold text-gray-800">
                              ₱{booking.totalPrice}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditModal(booking)}
                              className="p-2 hover:bg-gray-200 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={18} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => { setReceiptBooking(booking); setShowReceipt(true); }}
                              className="p-2 hover:bg-purple-100 rounded transition"
                              title="Print receipt"
                            >
                              <Printer size={18} className="text-purple-600" />
                            </button>
                            <button
                              onClick={() => handleCheckOut(booking.id)}
                              disabled={booking.status === 'pending'}
                              className={`px-6 py-3 font-semibold rounded-lg transition whitespace-nowrap ${
                                booking.status === 'pending'
                                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                              }`}
                              title={booking.status === 'pending' ? 'Waiting for admin approval' : 'Check out guest'}
                            >
                              {booking.status === 'pending' ? 'Pending Approval' : 'Check-Out'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <EditReservationModal
          booking={selectedBooking}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBooking(null);
          }}
          onSave={handleSaveBooking}
        />

        <ReceiptModal
          booking={receiptBooking}
          isOpen={showReceipt}
          onClose={() => { setShowReceipt(false); setReceiptBooking(null); }}
        />
      </div>
    </div>
  );
}
