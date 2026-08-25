import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, Printer, Eye, Check, X } from 'lucide-react';
import { ReceiptModal } from '../../components/customer/receipt-modal';
import { showSuccessNotification, showErrorNotification } from '../../lib/notifications';

type PaymentType = 'room' | 'event' | 'facility';

interface UnifiedPayment {
  id: string;
  type: PaymentType;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  amount: number;
  paymentDate: string;
  status: string;
  method: string;
  reference?: string;
  screenshot?: string;
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { bookings, eventBookings, facilityBookings, updateBooking, updateEventBooking, updateFacilityBooking } = useBooking();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const payments = useMemo<UnifiedPayment[]>(() => {
    const roomPayments: UnifiedPayment[] = bookings.map((b) => ({
      id: b.id,
      type: 'room' as const,
      bookingRef: `ROOM-${b.id.substring(0, 8)}`,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      amount: b.totalPrice,
      paymentDate: b.checkInDate,
      status: b.paymentStatus || (b.status === 'checked-out' || b.status === 'confirmed' ? 'completed' : b.status === 'pending' ? 'pending' : 'failed'),
      method: b.paymentMethod ? b.paymentMethod.toUpperCase() : 'COUNTER PAYMENT',
      reference: b.paymentReference,
      screenshot: b.transactionScreenshot,
    }));

    const eventPayments: UnifiedPayment[] = eventBookings.map((b) => ({
      id: b.id,
      type: 'event' as const,
      bookingRef: `EVENT-${b.id.substring(0, 8)}`,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      amount: b.totalPrice,
      paymentDate: b.eventDate,
      status: b.paymentStatus || (b.status === 'completed' || b.status === 'confirmed' ? 'completed' : 'pending'),
      method: b.paymentMethod ? b.paymentMethod.toUpperCase() : 'COUNTER PAYMENT',
      reference: b.paymentReference,
      screenshot: b.transactionScreenshot,
    }));

    const facilityPayments: UnifiedPayment[] = facilityBookings.map((b) => ({
      id: b.id,
      type: 'facility' as const,
      bookingRef: `FAC-${b.id.substring(0, 8)}`,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      amount: b.totalPrice,
      paymentDate: b.bookingDate,
      status: b.paymentStatus || (b.status === 'completed' || b.status === 'confirmed' ? 'completed' : 'pending'),
      method: b.paymentMethod ? b.paymentMethod.toUpperCase() : 'COUNTER PAYMENT',
      reference: b.paymentReference,
      screenshot: b.transactionScreenshot,
    }));

    return [...roomPayments, ...eventPayments, ...facilityPayments];
  }, [bookings, eventBookings, facilityBookings]);

  const handleVerifyPayment = (payment: UnifiedPayment) => {
    const updates = { paymentStatus: 'completed' as const, status: 'confirmed' as const };
    if (payment.type === 'room') updateBooking(payment.id, updates);
    else if (payment.type === 'event') updateEventBooking(payment.id, updates);
    else updateFacilityBooking(payment.id, updates);
    showSuccessNotification({ title: 'Payment Verified', description: `Payment for ${payment.bookingRef} has been verified.` });
  };

  const handleRejectPayment = (payment: UnifiedPayment) => {
    const updates = { paymentStatus: 'pending' as const, status: 'pending' as const };
    if (payment.type === 'room') updateBooking(payment.id, updates);
    else if (payment.type === 'event') updateEventBooking(payment.id, updates);
    else updateFacilityBooking(payment.id, updates);
    showErrorNotification({ title: 'Payment Rejected', description: `Payment for ${payment.bookingRef} has been returned for review.` });
  };

  const handleGenerateReceipt = (payment: UnifiedPayment) => {
    const booking = payment.type === 'room'
      ? bookings.find(b => b.id === payment.id)
      : payment.type === 'event'
      ? eventBookings.find(b => b.id === payment.id)
      : facilityBookings.find(b => b.id === payment.id);
    if (booking) {
      setReceiptBooking({ ...booking, _paymentType: payment.type });
      setShowReceipt(true);
    }
  };

  const handleViewScreenshot = (screenshot: string) => {
    setSelectedScreenshot(screenshot);
    setShowScreenshotModal(true);
  };

  const filteredPayments = payments.filter((p) => {
    const statusMatch = filterStatus === 'all' ? true : p.status === filterStatus;
    const typeMatch = filterType === 'all' ? true : p.type === filterType;
    return statusMatch && typeMatch;
  });

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = filteredPayments.filter((p) => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter((p) => p.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: PaymentType) => {
    switch (type) {
      case 'room':
        return <Badge className="bg-blue-100 text-blue-800">Room</Badge>;
      case 'event':
        return <Badge className="bg-purple-100 text-purple-800">Event</Badge>;
      case 'facility':
        return <Badge className="bg-teal-100 text-teal-800">Facility</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Payment Management</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ₱{totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {filteredPayments.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Completed Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {completedPayments}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Verified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {pendingPayments}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Types</option>
                  <option value="room">Room Bookings</option>
                  <option value="event">Event Bookings</option>
                  <option value="facility">Facility Bookings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Payment Transactions</span>
                  <span className="text-sm text-gray-500">{filteredPayments.length} transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Booking Ref
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Guest Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Payment Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Method
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Details
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {payment.bookingRef}
                            </td>
                            <td className="px-4 py-3">
                              {getTypeBadge(payment.type)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              <div>
                                <p className="font-medium">{payment.guestName}</p>
                                <p className="text-sm text-gray-500">{payment.guestEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-semibold">
                              ₱{payment.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {payment.method}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {payment.method !== 'COUNTER PAYMENT' && (
                                <div className="text-xs space-y-1">
                                  <p><span className="font-medium">Account:</span> {payment.reference}</p>
                                  {payment.screenshot && (
                                    <button
                                      onClick={() => handleViewScreenshot(payment.screenshot!)}
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <Eye size={14} />
                                      View Proof
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={getStatusColor(payment.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(payment.status)}
                                  {payment.status.charAt(0).toUpperCase() +
                                    payment.status.slice(1)}
                                </div>
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 flex-wrap">
                                {payment.status === 'pending' && payment.method !== 'COUNTER PAYMENT' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyPayment(payment)}
                                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center gap-1"
                                    >
                                      <Check size={14} />
                                      Verify
                                    </button>
                                    <button
                                      onClick={() => handleRejectPayment(payment)}
                                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition flex items-center gap-1"
                                    >
                                      <X size={14} />
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleGenerateReceipt(payment)}
                                  className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                  title="Print Receipt"
                                >
                                  <Printer size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <ReceiptModal
          booking={receiptBooking}
          isOpen={showReceipt}
          onClose={() => { setShowReceipt(false); setReceiptBooking(null); }}
        />

        {/* Screenshot Modal */}
        {showScreenshotModal && selectedScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Payment Proof</h2>
                <button
                  onClick={() => {
                    setShowScreenshotModal(false);
                    setSelectedScreenshot(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <img
                  src={selectedScreenshot}
                  alt="Transaction proof"
                  className="w-full rounded-lg border border-gray-300 shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
