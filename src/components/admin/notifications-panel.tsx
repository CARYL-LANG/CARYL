'use client';

import { useState, useMemo } from 'react';
import { useBooking } from '../../lib/context';
import { Bell, CalendarPlus, CreditCard, XCircle, Settings as SettingsIcon, ChevronRight, Clock, CalendarClock } from 'lucide-react';
import { Booking, EventBooking } from '../../lib/types';

type NotificationType = 'reservation' | 'payment' | 'cancellation' | 'system' | 'reminder';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

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

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  reservation: { icon: CalendarPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
  payment: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
  cancellation: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  reminder: { icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  system: { icon: SettingsIcon, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export function NotificationsPanel() {
  const { bookings, eventBookings, rooms } = useBooking();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    const roomBookings = bookings as Booking[];
    const allEvents = eventBookings as EventBooking[];

    // New reservation notifications (pending bookings)
    roomBookings
      .filter((b) => b.status === 'pending')
      .forEach((b) => {
        items.push({
          id: `res-${b.id}`,
          type: 'reservation',
          title: 'New Reservation Request',
          description: `${b.guestName} requested Room ${b.roomNumber || 'N/A'} (${b.checkInDate} → ${b.checkOutDate})`,
          timestamp: b.createdAt,
          read: false,
        });
      });

    // Event reservations
    allEvents
      .filter((e) => e.status === 'pending')
      .forEach((e) => {
        items.push({
          id: `evt-${e.id}`,
          type: 'reservation',
          title: 'New Event Booking Request',
          description: `${e.guestName} requested an event (${e.eventType}) on ${e.eventDate}`,
          timestamp: e.createdAt,
          read: false,
        });
      });

    // Payment notifications
    roomBookings
      .filter((b) => b.paymentMethod && b.paymentStatus === 'pending')
      .forEach((b) => {
        items.push({
          id: `pay-${b.id}`,
          type: 'payment',
          title: 'Payment Awaiting Verification',
          description: `${b.guestName} submitted ${b.paymentMethod?.toUpperCase()} payment of ₱${b.totalPrice} — ref: ${b.paymentReference || 'N/A'}`,
          timestamp: b.createdAt,
          read: false,
        });
      });

    roomBookings
      .filter((b) => b.paymentStatus === 'completed')
      .slice(0, 10)
      .forEach((b) => {
        items.push({
          id: `payc-${b.id}`,
          type: 'payment',
          title: 'Payment Completed',
          description: `${b.guestName} paid ₱${b.totalPrice} via ${b.paymentMethod || 'counter'}`,
          timestamp: b.createdAt,
          read: true,
        });
      });

    // Cancellation notifications
    roomBookings
      .filter((b) => b.status === 'cancelled')
      .slice(0, 10)
      .forEach((b) => {
        items.push({
          id: `can-${b.id}`,
          type: 'cancellation',
          title: 'Reservation Cancelled',
          description: `${b.guestName}'s booking for Room ${b.roomNumber || 'N/A'} was cancelled`,
          timestamp: b.createdAt,
          read: false,
        });
      });

    // System notifications — rooms under maintenance
    rooms
      .filter((r) => r.status === 'maintenance')
      .forEach((r) => {
        items.push({
          id: `sys-${r.id}`,
          type: 'system',
          title: 'Room Under Maintenance',
          description: `Room ${r.roomNumber} is currently marked as under maintenance`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      });

    // Check-in reminders — bookings confirmed with check-in within 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    roomBookings
      .filter((b) => b.status === 'confirmed')
      .forEach((b) => {
        const checkIn = new Date(b.checkInDate + 'T00:00:00');
        const diffHr = (checkIn.getTime() - now.getTime()) / 3600000;
        if (diffHr >= 0 && diffHr <= 24) {
          items.push({
            id: `rem-ci-${b.id}`,
            type: 'reminder',
            title: 'Upcoming Check-In',
            description: `${b.guestName} is scheduled to check in to Room ${b.roomNumber || 'N/A'} ${diffHr < 1 ? 'within an hour' : 'today'} (${b.checkInDate})`,
            timestamp: b.createdAt,
            read: false,
          });
        }
      });

    // Check-out reminders — guests currently checked in with check-out today or tomorrow
    roomBookings
      .filter((b) => b.status === 'checked-in')
      .forEach((b) => {
        const checkOut = new Date(b.checkOutDate + 'T00:00:00');
        const diffHr = (checkOut.getTime() - now.getTime()) / 3600000;
        if (diffHr >= 0 && diffHr <= 24) {
          items.push({
            id: `rem-co-${b.id}`,
            type: 'reminder',
            title: 'Upcoming Check-Out',
            description: `${b.guestName} in Room ${b.roomNumber || 'N/A'} is scheduled to check out ${diffHr < 1 ? 'within an hour' : 'today'} (${b.checkOutDate})`,
            timestamp: b.createdAt,
            read: false,
          });
        }
      });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [bookings, eventBookings, rooms]);

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs: { key: NotificationType | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'reservation', label: 'Reservations' },
    { key: 'payment', label: 'Payments' },
    { key: 'cancellation', label: 'Cancellations' },
    { key: 'reminder', label: 'Reminders' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            No notifications
          </div>
        ) : (
          filtered.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition hover:shadow-sm ${
                  n.read ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50/40'
                }`}
              >
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${meta.bg}`}>
                  <Icon size={16} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    {!n.read && <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{n.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
