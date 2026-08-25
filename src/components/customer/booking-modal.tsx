'use client';

import { useState, useEffect } from 'react';
import { Room, Booking } from '../../lib/types';
import { Button } from '../ui/button';
import { X, AlertCircle, BedDouble, CalendarDays, Users, Wifi } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface BookingModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  onPaymentRequired?: (booking: Booking) => void;
}

const datesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 < e2 && s2 < e1;
};

export function BookingModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  onPaymentRequired,
}: BookingModalProps) {
  const { bookings, currentUser } = useBooking();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [bookingConflict, setBookingConflict] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setGuestName(currentUser.name || currentUser.firstName || '');
      setGuestEmail(currentUser.email || '');
      setGuestPhone(currentUser.phone || '');
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const checkForConflicts = (startDate = checkInDate, endDate = checkOutDate) => {
    if (!startDate || !endDate) return null;

    const conflict = bookings.find(
      (booking) =>
        booking.roomId === room.id &&
        booking.status !== 'cancelled' &&
        booking.status !== 'checked-out' &&
        booking.status !== 'rejected' &&
        datesOverlap(startDate, endDate, booking.checkInDate, booking.checkOutDate)
    );

    return conflict || null;
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    setBookingConflict(checkForConflicts(startDate, endDate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !guestEmail || !guestPhone || !checkInDate || !checkOutDate || numberOfGuests === 0) {
      alert('Please fill in all fields');
      return;
    }

    const conflict = checkForConflicts();
    if (conflict) {
      alert(
        `BOOKING CONFLICT!\n\nThis room is already booked from ${conflict.checkInDate} to ${conflict.checkOutDate}.\n\nPlease select different dates.`
      );
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const totalPrice = nights * room.pricePerNight;
    const bookingData: Booking = {
      id: 'temp_' + Date.now(),
      guestName,
      guestEmail,
      guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      checkInDate,
      checkOutDate,
      status: 'pending',
      totalPrice,
      numberOfGuests,
      bookingType: 'room',
      createdAt: new Date().toISOString(),
    };

    onConfirm({
      guestName,
      guestEmail,
      guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      checkInDate,
      checkOutDate,
      status: 'pending',
      totalPrice,
      numberOfGuests,
      bookingType: 'room',
    });

    if (onPaymentRequired) {
      setTimeout(() => onPaymentRequired(bookingData), 100);
    }

    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setCheckInDate('');
    setCheckOutDate('');
    setNumberOfGuests(1);
  };

  return (
    <div className="booking-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-6">
      <div className="booking-modal-shell relative my-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#f7f4ef] shadow-2xl lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
        <button
          onClick={onClose}
          aria-label="Close booking dialog"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
        >
          <X size={21} />
        </button>

        <section className="booking-modal-panel overflow-y-auto p-4 sm:p-7 lg:p-9">
          <div className="booking-modal-photo relative h-56 overflow-hidden rounded-2xl bg-slate-200 sm:h-80 lg:h-[390px]">
            {room.image ? (
              <img src={room.image} alt={`Room ${room.roomNumber}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-500 text-white">
                <BedDouble size={76} strokeWidth={1.2} />
              </div>
            )}
            <span className="absolute left-5 top-5 rounded-full bg-[#75451f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {room.type}
            </span>
          </div>

          <div className="mt-7 flex items-start justify-between gap-5 border-b border-[#dfd5ca] pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5a2b]">Room {room.roomNumber}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#24170e] sm:text-4xl">{room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room</h2>
            </div>
            <div className="shrink-0 text-right text-[#75451f]">
              <p className="text-2xl font-bold sm:text-3xl">₱{room.pricePerNight}</p>
              <p className="text-sm text-[#765f4e]">per night</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-[#dfd5ca] py-5 text-sm text-[#765f4e]">
            <span className="flex items-center gap-2"><Users size={17} /> Up to {room.capacity} guests</span>
            <span className="flex items-center gap-2"><CalendarDays size={17} /> Flexible dates</span>
          </div>

          <div className="pt-5">
            <p className="leading-7 text-[#765f4e]">A comfortable {room.type} room prepared for a restful stay with everything you need.</p>
            <h3 className="mt-6 font-serif text-xl font-bold text-[#24170e]">Amenities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <span key={amenity} className="rounded-full border border-[#d8c7b8] bg-white/70 px-3 py-1.5 text-sm text-[#765f4e]">{amenity}</span>
              ))}
              {room.amenities.length === 0 && <span className="flex items-center gap-2 text-sm text-[#765f4e]"><Wifi size={16} /> Comfortable essentials included</span>}
            </div>
          </div>
        </section>

        <section className="booking-modal-panel border-t border-[#dfd5ca] bg-white p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-9">
          <div className="mb-7 pr-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5a2b]">Your stay</p>
            <h3 className="mt-2 font-serif text-3xl font-bold text-[#24170e]">Reserve This Room</h3>
            <p className="mt-2 text-sm leading-6 text-[#765f4e]">Choose your dates and tell us who will be staying.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#352319]">Full Name</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3.5 py-3 text-sm text-[#24170e] outline-none transition focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#352319]">Email</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3.5 py-3 text-sm text-[#24170e] outline-none transition focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#352319]">Phone Number</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3.5 py-3 text-sm text-[#24170e] outline-none transition focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#352319]">Check-In</label>
                <input type="date" value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); handleDateChange(e.target.value, checkOutDate); }} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3 py-3 text-sm text-[#24170e] outline-none focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#352319]">Check-Out</label>
                <input type="date" value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); handleDateChange(checkInDate, e.target.value); }} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3 py-3 text-sm text-[#24170e] outline-none focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
              </div>
            </div>

            {bookingConflict && (
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={19} />
                <div className="text-sm"><p className="font-semibold">Booking Conflict!</p><p className="mt-1">This room is reserved from {bookingConflict.checkInDate} to {bookingConflict.checkOutDate}. Please select different dates.</p></div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#352319]">Number of Guests</label>
              <input type="number" min="1" max={room.capacity} value={numberOfGuests} onChange={(e) => setNumberOfGuests(Number(e.target.value))} className="w-full rounded-lg border border-[#d8c7b8] bg-[#fffdfa] px-3.5 py-3 text-sm text-[#24170e] outline-none focus:border-[#8b5a2b] focus:ring-2 focus:ring-[#8b5a2b]/15" />
            </div>

            <div className="rounded-xl border border-[#e4d6c9] bg-[#fbf7f2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b5a2b]">Price per night</p>
              <p className="mt-1 text-2xl font-bold text-[#24170e]">₱{room.pricePerNight}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-[#d8c7b8] text-[#765f4e] hover:bg-[#fbf7f2]">Cancel</Button>
              <Button type="submit" className="flex-1 bg-[#75451f] text-white hover:bg-[#5d3518] disabled:bg-[#b7a99d]" disabled={!!bookingConflict}>{bookingConflict ? 'Fix Conflict First' : 'Confirm Booking'}</Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
