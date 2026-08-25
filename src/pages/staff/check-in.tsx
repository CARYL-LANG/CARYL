import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { LogIn, Search, Printer } from 'lucide-react';
import { Booking } from '../../lib/types';
import { showSuccessNotification, showErrorNotification } from '../../lib/notifications';
import { ReceiptModal } from '../../components/customer/receipt-modal';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { bookings, updateBooking } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptBooking, setReceiptBooking] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const pendingCheckIns = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const filteredBookings = pendingCheckIns.filter(
    (b) =>
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.roomNumber || '').includes(searchTerm)
  );

  const handleCheckIn = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate + 'T00:00:00');
    if (checkIn > today) {
      showErrorNotification({
        title: 'Cannot Check In Yet',
        description: `Check-in date is ${booking.checkInDate}. Guest cannot be checked in before the scheduled date.`,
      });
      return;
    }

    updateBooking(bookingId, {
      status: 'checked-in',
      paymentStatus: 'completed',
      checkInTime: new Date().toISOString(),
    });

    showSuccessNotification({
      title: 'Guest Checked In',
      description: `Guest ${booking.guestName} has been checked in to Room ${booking.roomNumber}. Room status changed to OCCUPIED.`,
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
                Guest Check-In
              </h2>
              <div className="relative">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by guest name or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <LogIn size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">
                    No pending check-ins found
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
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-semibold text-gray-600 uppercase mb-1">Room</span>
                              <div className="text-3xl font-bold text-blue-600 bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center">
                                {booking.roomNumber}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-800">
                                {booking.guestName}
                              </h3>
                              <p className="text-gray-600">{booking.guestEmail}</p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>Check-In: {booking.checkInDate}</span>
                                <span>Guests: {booking.numberOfGuests}</span>
                                <Badge className="bg-orange-100 text-orange-800">
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1).replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setReceiptBooking(booking); setShowReceipt(true); }}
                            className="p-2 hover:bg-purple-100 rounded transition"
                            title="Print receipt"
                          >
                            <Printer size={18} className="text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            disabled={booking.status === 'pending'}
                            className={`px-6 py-3 font-semibold rounded-lg transition whitespace-nowrap ${
                              booking.status === 'pending'
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={booking.status === 'pending' ? 'Waiting for admin approval' : 'Check in guest'}
                          >
                            {booking.status === 'pending' ? 'Pending Approval' : 'Check-In'}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ReceiptModal
        booking={receiptBooking}
        isOpen={showReceipt}
        onClose={() => { setShowReceipt(false); setReceiptBooking(null); }}
      />
    </div>
  );
}
