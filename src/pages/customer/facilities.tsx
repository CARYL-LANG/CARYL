import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { CustomerHeader } from '../../components/customer/customer-header';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Waves, Music, Calendar, Users, Clock, Home, Bath, Utensils, ChevronDown } from 'lucide-react';
import { Booking, FacilityBooking, EventBooking } from '../../lib/types';
import { EventBookingModal } from '../../components/customer/event-booking-modal';
import { CustomerEventPaymentModal } from '../../components/customer/event-payment-modal';

export default function CustomerFacilitiesPage() {
  const { services, cottages, bookings, facilityBookings, addFacilityBooking, addBooking, addEventBooking, currentUser, businessInfo, logActivity, eventTypePrices, eventBookings } = useBooking();
  const [activeCategory, setActiveCategory] = useState<'cottages' | 'videoke' | 'swimming-pool' | 'function-hall' | 'foods'>('cottages');
  const [selectedType, setSelectedType] = useState<'swimming-pool' | 'videoke'>('swimming-pool');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCottageModal, setShowCottageModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCottageId, setSelectedCottageId] = useState<string | null>(null);
  const [cottageCheckIn, setCottageCheckIn] = useState('');
  const [cottageCheckOut, setCottageCheckOut] = useState('');
  const [cottageGuests, setCottageGuests] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [showHallEvents, setShowHallEvents] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventPayment, setShowEventPayment] = useState(false);
  const [newEventBooking, setNewEventBooking] = useState<EventBooking | null>(null);

  const facilityServices = services.filter((s) => s.category === selectedType && s.available);
  const functionHallServices = services.filter((s) => s.category === 'function-hall' && s.available);
  const foodServices = services.filter((s) => s.category === 'foods' && s.available);
  const myBookings = facilityBookings.filter((b) => b.guestEmail === currentUser.email);
  const myCottageBookings = bookings.filter((b) => b.guestEmail === currentUser.email && b.bookingType === 'cottage');
  const myEventBookings = eventBookings.filter((b) => b.guestEmail === currentUser.email);

  const categories = [
    { id: 'cottages' as const, label: 'Cottages', icon: Home },
    { id: 'videoke' as const, label: 'Videoke', icon: Music },
    { id: 'swimming-pool' as const, label: 'Swimming Pool', icon: Waves },
    { id: 'function-hall' as const, label: 'Function Hall', icon: Bath },
    { id: 'foods' as const, label: 'Food Services', icon: Utensils },
  ];

  const handleBook = (serviceId: string, type: 'swimming-pool' | 'videoke') => {
    setSelectedServiceId(serviceId);
    setSelectedType(type);
    setShowBookingModal(true);
  };

  const handleCottageBook = (cottageId: string) => {
    setSelectedCottageId(cottageId);
    setShowCottageModal(true);
  };

  const handleConfirmCottageBooking = () => {
    const cottage = cottages.find((item) => item.id === selectedCottageId);
    if (!cottage || !cottageCheckIn || !cottageCheckOut) return;
    const checkIn = new Date(cottageCheckIn);
    const checkOut = new Date(cottageCheckOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return;
    const booking: Booking = {
      id: crypto.randomUUID(),
      guestName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || currentUser.email,
      guestEmail: currentUser.email,
      guestPhone: currentUser.phone || '',
      bookingType: 'cottage',
      cottageId: cottage.id,
      cottageNumber: cottage.cottageNumber,
      checkInDate: cottageCheckIn,
      checkOutDate: cottageCheckOut,
      status: 'pending',
      totalPrice: nights * cottage.pricePerNight,
      numberOfGuests: cottageGuests,
      createdAt: new Date().toISOString(),
      createdBy: 'customer',
    };
    addBooking(booking);
    logActivity('Booked cottage', 'booking', booking.id, `${cottage.name} on ${cottageCheckIn}`);
    setShowCottageModal(false);
    setCottageCheckIn('');
    setCottageCheckOut('');
    setCottageGuests(1);
  };

  const handleConfirmBooking = () => {
    if (!selectedServiceId || !bookingDate) return;
    const service = services.find((s) => s.id === selectedServiceId);
    if (!service) return;

    const booking: FacilityBooking = {
      id: crypto.randomUUID(),
      facilityType: selectedType,
      facilityId: service.id,
      guestName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || currentUser.email,
      guestEmail: currentUser.email,
      guestPhone: currentUser.phone || undefined,
      bookingDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      numberOfGuests: numGuests,
      status: 'pending',
      totalPrice: service.price,
      createdAt: new Date().toISOString(),
    };
    addFacilityBooking(booking);
    logActivity('Booked facility', 'facility_booking', booking.id, `${service.name} on ${bookingDate}`);
    setShowBookingModal(false);
    setBookingDate('');
    setStartTime('');
    setEndTime('');
    setNumGuests(1);
  };

  const handleEventSelect = (eventType: string) => {
    setSelectedEventType(eventType);
    setShowEventModal(true);
  };

  const handleEventBookingConfirm = (bookingData: any) => {
    const newBooking: EventBooking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    addEventBooking(newBooking);
    setNewEventBooking(newBooking);
    setShowEventModal(false);
    setSelectedEventType(null);
    setShowEventPayment(true);
  };

  const handleEventPaymentConfirm = () => {
    setShowEventPayment(false);
    setNewEventBooking(null);
  };

  const getEventName = (type: string) => {
    const et = eventTypePrices.find((p) => p.type === type);
    return et?.name || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader currentPage="facilities" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Facilities & Services</h1>
        <p className="text-gray-600 mb-6">Book your favorite facilities, reserve a cottage, or order food for your stay.</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors ${activeCategory === category.id ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Icon size={18} /> {category.label}
              </button>
            );
          })}
        </div>

        {activeCategory === 'swimming-pool' && businessInfo.poolOperatingHours && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <span className="text-sm text-blue-800">Operating Hours: {businessInfo.poolOperatingHours}</span>
          </div>
        )}

        {activeCategory === 'cottages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cottages.filter((cottage) => cottage.status === 'available').map((cottage) => (
              <Card key={cottage.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {cottage.image ? <img src={cottage.image} alt={cottage.name} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-blue-50 text-blue-600"><Home size={48} /></div>}
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900">{cottage.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Cottage {cottage.cottageNumber} · Up to {cottage.capacity} guests</p>
                  <p className="my-4 text-sm text-gray-600">{cottage.description || 'A comfortable cottage for your stay.'}</p>
                  <div className="flex items-center justify-between"><span className="text-2xl font-bold text-blue-600">₱{cottage.pricePerNight}<span className="text-sm font-normal text-gray-500"> / night</span></span><Button onClick={() => handleCottageBook(cottage.id)} className="bg-blue-600 hover:bg-blue-700 text-white">Book Now</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(activeCategory === 'videoke' || activeCategory === 'swimming-pool') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(activeCategory === 'swimming-pool' ? facilityServices : services.filter((s) => s.category === 'videoke' && s.available)).map((service) => {
              const Icon = service.category === 'swimming-pool' ? Waves : Music;
              return <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow"><CardContent className="p-6"><div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><Icon size={24} className="text-blue-600" /></div><div><h3 className="font-bold text-gray-900">{service.name}</h3><Badge className="bg-green-100 text-green-800 text-xs">Available</Badge></div></div><p className="text-sm text-gray-600 mb-4">{service.description}</p>{service.capacity && <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5"><Users size={14} /> Up to {service.capacity} guests</p>}<div className="flex justify-between items-center"><span className="text-2xl font-bold text-blue-600">₱{service.price}</span><Button onClick={() => handleBook(service.id, activeCategory)} className="bg-blue-600 hover:bg-blue-700 text-white">Book Now</Button></div></CardContent></Card>;
            })}
          </div>
        )}

        {activeCategory === 'function-hall' && (
          <div className="mb-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Function Hall</h2>
              <p className="mt-1 text-gray-600">Click the image to view available events and book your celebration.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHallEvents((v) => !v)}
              className="group relative block h-64 w-full overflow-hidden rounded-2xl bg-slate-100 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 sm:h-80"
            >
              {businessInfo.functionHallImage ? (
                <img src={businessInfo.functionHallImage} alt="Function Hall" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <Bath size={40} />
                  <span className="mt-3 text-sm font-semibold">No Function Hall image available</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent px-5 pb-5 pt-12 text-white">
                <span className="font-semibold">{showHallEvents ? 'Function Hall events' : 'Click to view events'}</span>
                <ChevronDown size={20} className={`transition-transform ${showHallEvents ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showHallEvents && (
              <div className="mt-6">
                {eventTypePrices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                    No events available yet. Please check back later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventTypePrices.map((evt) => (
                      <Card key={evt.type} className="border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer overflow-hidden" onClick={() => handleEventSelect(evt.type)}>
                        <CardContent className="p-6 text-center">
                          <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <h3 className="font-bold text-gray-900">{evt.name}</h3>
                          <p className="mt-2 text-sm text-gray-600">{evt.description}</p>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Starting Price:</p>
                            <p className="text-2xl font-bold text-blue-600">₱{evt.price.toLocaleString()}</p>
                            {evt.capacity && <p className="text-xs text-gray-500 mt-1">Up to {evt.capacity} guests</p>}
                          </div>
                          <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">Book This Event</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {myEventBookings.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Event Bookings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myEventBookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-blue-500">
                          <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900">{getEventName(booking.eventType)}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><p className="text-gray-600">Date</p><p className="font-semibold text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</p></div>
                              <div><p className="text-gray-600">Guests</p><p className="font-semibold text-gray-900">{booking.numberOfGuests}</p></div>
                              <div><p className="text-gray-600">Total</p><p className="font-semibold text-blue-600">₱{booking.totalPrice.toLocaleString()}</p></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeCategory === 'foods' && <CategoryLink title="Food Services" description="Choose meals, snacks, drinks, and packages for your stay." to="/customer/food-order" label="Order Food" services={foodServices} />}

        {/* My Facility Bookings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Facility Bookings</h2>
          </div>
          {myBookings.length === 0 ? (
            <p className="p-8 text-center text-gray-500">You have no facility bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.facilityType === 'swimming-pool' ? 'Swimming Pool' : 'Videoke'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.bookingDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.numberOfGuests}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">₱{booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCottageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book Cottage</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label><input type="date" value={cottageCheckIn} onChange={(event) => setCottageCheckIn(event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label><input type="date" value={cottageCheckOut} onChange={(event) => setCottageCheckOut(event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label><input type="number" min="1" value={cottageGuests} onChange={(event) => setCottageGuests(Number(event.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            </div>
            <div className="flex gap-3 mt-6"><Button onClick={handleConfirmCottageBooking} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Confirm Booking</Button><Button variant="outline" onClick={() => setShowCottageModal(false)} className="flex-1">Cancel</Button></div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book Facility</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} /> Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Users size={14} /> Number of Guests
                </label>
                <input
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleConfirmBooking} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Confirm Booking</Button>
              <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && selectedEventType && (
        <EventBookingModal
          eventType={selectedEventType}
          services={functionHallServices}
          onClose={() => { setShowEventModal(false); setSelectedEventType(null); }}
          onConfirm={handleEventBookingConfirm}
        />
      )}

      <CustomerEventPaymentModal
        event={newEventBooking}
        isOpen={showEventPayment}
        onClose={() => { setShowEventPayment(false); setNewEventBooking(null); }}
        onConfirm={handleEventPaymentConfirm}
      />
    </div>
  );
}

function CategoryLink({ title, description, to, label, services }: { title: string; description: string; to: string; label: string; services: { id: string; name: string; description: string; price: number }[] }) {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.length > 0 ? services.map((service) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900">{service.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{service.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xl font-bold text-blue-600">₱{service.price}</span>
              <Link to={to}><Button className="bg-blue-600 hover:bg-blue-700 text-white">{label}</Button></Link>
            </div>
          </CardContent>
        </Card>
      )) : (
        <div className="col-span-full rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">{description}</div>
      )}
    </div>
  );
}
