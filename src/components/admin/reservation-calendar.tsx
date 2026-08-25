'use client';

import { useState, useMemo } from 'react';
import { useBooking } from '../../lib/context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Booking, Room } from '../../lib/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-red-100 text-red-800 border-red-300',
  'checked-in': 'bg-green-100 text-green-800 border-green-300',
  'checked-out': 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-red-500',
  'checked-in': 'bg-green-500',
  'checked-out': 'bg-gray-400',
  cancelled: 'bg-red-500',
  rejected: 'bg-red-500',
};

function isSameDay(a: string, b: Date) {
  const dateA = new Date(a + 'T00:00:00');
  return dateA.getFullYear() === b.getFullYear() &&
    dateA.getMonth() === b.getMonth() &&
    dateA.getDate() === b.getDate();
}

function isInRange(booking: Booking, day: Date) {
  const checkIn = new Date(booking.checkInDate + 'T00:00:00');
  const checkOut = new Date(booking.checkOutDate + 'T00:00:00');
  const dayMid = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return dayMid >= checkIn && dayMid <= checkOut;
}

interface ReservationCalendarProps {
  bookings?: Booking[];
  rooms?: Room[];
}

export function ReservationCalendar({ bookings: propBookings }: ReservationCalendarProps = {}) {
  const { bookings: contextBookings } = useBooking();
  const bookings = propBookings ?? contextBookings;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const bookingsForDay = (day: Date) => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled' || b.status === 'rejected') return false;
      return isSameDay(b.checkInDate, day) || isInRange(b, day);
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day: Date) =>
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  const selectedDayBookings = selectedDay ? bookingsForDay(selectedDay) : [];

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-600" />
          Reservation Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={idx} className="min-h-[72px]" />;
          const dayBookings = bookingsForDay(day);
          const todayHighlight = isToday(day);
          const selected = selectedDay &&
            day.getDate() === selectedDay.getDate() &&
            day.getMonth() === selectedDay.getMonth() &&
            day.getFullYear() === selectedDay.getFullYear();

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(day)}
              className={`min-h-[72px] border rounded-lg p-1.5 text-left transition hover:border-blue-400 hover:shadow-sm ${
                selected ? 'border-blue-500 ring-1 ring-blue-300 bg-blue-50' :
                todayHighlight ? 'border-blue-300 bg-blue-50/50' :
                'border-gray-200'
              }`}
            >
              <div className={`text-xs font-semibold ${todayHighlight ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className={`text-[10px] px-1 py-0.5 rounded truncate border ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                  >
                    {b.roomNumber || b.guestName.split(' ')[0]}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[10px] text-gray-500 font-medium">
                    +{dayBookings.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-3">
        <span className="text-xs font-semibold text-gray-600">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${STATUS_DOT['checked-in']}`} />
          <span className="text-xs text-gray-700">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${STATUS_DOT['confirmed']}`} />
          <span className="text-xs text-gray-700">Reservation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${STATUS_DOT['pending']}`} />
          <span className="text-xs text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${STATUS_DOT['checked-out']}`} />
          <span className="text-xs text-gray-700">Checked-out</span>
        </div>
      </div>

      {selectedDay && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' '}— {selectedDayBookings.length} reservation{selectedDayBookings.length !== 1 ? 's' : ''}
          </h4>
          {selectedDayBookings.length === 0 ? (
            <p className="text-sm text-gray-400">No reservations for this day.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedDayBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium text-gray-800">{b.guestName}</span>
                    <span className="text-gray-500 ml-2">Room {b.roomNumber || 'N/A'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded border ${STATUS_COLORS[b.status] || ''}`}>
                    {b.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
