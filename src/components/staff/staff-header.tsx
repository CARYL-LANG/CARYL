import { useState, useMemo } from 'react';
import { useBooking } from '../../lib/context';
import { Bell, CalendarPlus, CalendarClock, X } from 'lucide-react';
import { BouncingText } from '../bouncing-text';

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function StaffHeader() {
  const { currentUser, bookings } = useBooking();
  const [showNotifications, setShowNotifications] = useState(false);

  const assignedNotifications = useMemo(() => {
    const items: { id: string; type: 'assigned' | 'checkin'; title: string; description: string; timestamp: string }[] = [];

    // Assigned reservations
    bookings
      .filter((b) => b.assignedStaffId === currentUser.id && b.status !== 'checked-out' && b.status !== 'cancelled' && b.status !== 'rejected')
      .forEach((b) => {
        items.push({
          id: `assigned-${b.id}`,
          type: 'assigned',
          title: 'Assigned Reservation',
          description: `${b.guestName} — Room ${b.roomNumber || 'N/A'} (${b.checkInDate} → ${b.checkOutDate}) — ${b.status}`,
          timestamp: b.createdAt,
        });
      });

    // Check-in reminders — assigned bookings with check-in within 24 hours
    const now = new Date();
    bookings
      .filter((b) => b.assignedStaffId === currentUser.id && b.status === 'confirmed')
      .forEach((b) => {
        const checkIn = new Date(b.checkInDate + 'T00:00:00');
        const diffHr = (checkIn.getTime() - now.getTime()) / 3600000;
        if (diffHr >= 0 && diffHr <= 24) {
          items.push({
            id: `reminder-${b.id}`,
            type: 'checkin',
            title: 'Upcoming Check-In',
            description: `${b.guestName} in Room ${b.roomNumber || 'N/A'} is scheduled to check in ${diffHr < 1 ? 'within an hour' : 'today'} (${b.checkInDate})`,
            timestamp: b.createdAt,
          });
        }
      });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bookings, currentUser.id]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="logo-flip w-10 h-10 object-contain"
          />
          <BouncingText text="PRING KUYA'S INN" className="text-2xl font-bold text-gray-800" />
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              title="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              {assignedNotifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {assignedNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Bell size={16} /> Notifications
                    </h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {assignedNotifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        <Bell size={28} className="mx-auto mb-2 opacity-30" />
                        No new notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {assignedNotifications.map((n) => (
                          <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition">
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.type === 'assigned' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                              {n.type === 'assigned' ? (
                                <CalendarPlus size={14} className="text-blue-600" />
                              ) : (
                                <CalendarClock size={14} className="text-amber-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{n.description}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-700">{currentUser.firstName || currentUser.name || 'Staff'}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Staff
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
