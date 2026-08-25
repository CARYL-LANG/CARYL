import { useMemo, useState } from 'react';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { useBooking } from '../../lib/context';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Users, Mail, Phone, BedDouble, Calendar, Pencil, Printer } from 'lucide-react';
import { EditGuestModal } from '../../components/admin/edit-guest-modal';
import { ReceiptModal } from '../../components/customer/receipt-modal';
import { showSuccessNotification } from '../../lib/notifications';

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-orange-100 text-orange-800',
};

export default function StaffGuestsPage() {
  const { bookings, updateBooking } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editGuest, setEditGuest] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const guests = useMemo(() => {
    const roomBookings = bookings.filter((b) => b.bookingType !== 'event');
    const map = new Map<string, {
      name: string;
      email: string;
      phone: string;
      bookings: typeof roomBookings;
    }>();

    for (const b of roomBookings) {
      const key = b.guestEmail.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: b.guestName, email: b.guestEmail, phone: b.guestPhone, bookings: [] });
      }
      map.get(key)!.bookings.push(b);
    }

    let list = Array.from(map.values());
    if (statusFilter !== 'all') {
      list = list.filter((g) => g.bookings.some((b) => b.status === statusFilter));
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.phone.includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings, searchTerm, statusFilter]);

  const handleEditGuest = (guest: { name: string; email: string; phone?: string }) => {
    setEditGuest(guest);
    setIsEditOpen(true);
  };

  const handleSaveGuest = (updated: { name: string; email: string; phone?: string }) => {
    const guestBookings = bookings.filter(b => b.guestEmail === editGuest?.email);
    guestBookings.forEach(b => {
      updateBooking(b.id, {
        guestName: updated.name,
        guestEmail: updated.email,
        guestPhone: updated.phone || '',
      });
    });
    showSuccessNotification({ title: 'Guest Updated', description: `Information for ${updated.name} has been updated across ${guestBookings.length} booking(s).` });
  };

  const handlePrintReceipt = (booking: any) => {
    setReceiptBooking(booking);
    setShowReceipt(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">Guest List</h2>
              <p className="text-gray-600">View all guests and their reservation history.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked-in</option>
                <option value="checked-out">Checked-out</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {guests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No guests found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {guests.map((g) => (
                  <Card key={g.email} className="hover:shadow-lg transition">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{g.name}</h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1"><Mail size={14} /> {g.email}</span>
                              <span className="flex items-center gap-1"><Phone size={14} /> {g.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 md:text-right flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-700">{g.bookings.length}</p>
                            <p>reservation{g.bookings.length !== 1 ? 's' : ''}</p>
                          </div>
                          <button
                            onClick={() => handleEditGuest({ name: g.name, email: g.email, phone: g.phone })}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            title="Edit guest info"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                        {g.bookings
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((b) => (
                            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-gray-700 font-medium">
                                  <BedDouble size={14} /> {b.roomNumber || 'Unassigned'}
                                </span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Calendar size={14} /> {b.checkInDate} → {b.checkOutDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePrintReceipt(b)}
                                  className="p-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                                  title="Print receipt"
                                >
                                  <Printer size={14} />
                                </button>
                                <Badge className={statusBadge[b.status]}>
                                  {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <EditGuestModal
        guest={editGuest}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditGuest(null); }}
        onSave={handleSaveGuest}
      />

      <ReceiptModal
        booking={receiptBooking}
        isOpen={showReceipt}
        onClose={() => { setShowReceipt(false); setReceiptBooking(null); }}
      />
    </div>
  );
}
