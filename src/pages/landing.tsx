import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../lib/context';
import { Users, Wifi, Wind, Tv, Star, ArrowRight, LogOut, Eye, CheckCircle2, Home, Sparkles, Facebook, Phone, MapPin, User as UserIcon, Waves, Music, PartyPopper, Utensils, Home as HomeIcon } from 'lucide-react';
import { BouncingText } from '../components/bouncing-text';
import type { Cottage, FoodMenuItem, Service } from '../lib/types';

const HERO_BG = '/login-bg.jpg';

const ROOM_IMAGES = [
  'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/2736384/pexels-photo-2736384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/6466484/pexels-photo-6466484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/97083/pexels-photo-97083.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const COTTAGE_IMAGES = [
  'https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const POOL_IMAGES = [
  'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/2549018/pexels-photo-2549018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const HALL_IMAGES = [
  'https://images.pexels.com/photos/4717550/pexels-photo-4717550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/15621210/pexels-photo-15621210.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32593148/pexels-photo-32593148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/12688993/pexels-photo-12688993.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16985178/pexels-photo-16985178.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14646752/pexels-photo-14646752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const FOOD_IMAGES = [
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  single: 'bg-white text-gray-800',
  double: 'bg-white text-gray-800',
  suite: 'bg-red-500 text-white',
};

function amenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('wi-fi')) return <Wifi size={13} />;
  if (lower.includes('air') || lower.includes('ac')) return <Wind size={13} />;
  if (lower.includes('tv') || lower.includes('television')) return <Tv size={13} />;
  return null;
}

// ── Category configuration ──
type CategoryKey = 'cottages' | 'swimming-pool' | 'function-hall' | 'videoke' | 'foods';

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; icon: typeof Home; fallbackImages: string[] }> = {
  'cottages':       { label: 'Cottages',        icon: HomeIcon,  fallbackImages: COTTAGE_IMAGES },
  'swimming-pool':  { label: 'Swimming Pool',   icon: Waves,     fallbackImages: POOL_IMAGES },
  'function-hall':  { label: 'Function Hall',   icon: PartyPopper, fallbackImages: HALL_IMAGES },
  'videoke':        { label: 'Videoke',         icon: Music,     fallbackImages: [] },
  'foods':          { label: 'Food Services',   icon: Utensils,  fallbackImages: FOOD_IMAGES },
};

const CATEGORY_ORDER: CategoryKey[] = ['cottages', 'swimming-pool', 'function-hall', 'videoke', 'foods'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, rooms, services, cottages, foodMenuItems, businessInfo } = useBooking();
  const roomsRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);

  const handleExploreRooms = () => roomsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const handleExploreServices = () => facilitiesRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleViewBook = () => {
    if (isAuthenticated && currentUser.role === 'customer') {
      navigate('/customer');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = currentUser.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : currentUser.name || currentUser.email;

  const roomTypes = [...new Set(rooms.map((r) => r.type))].length || 3;

  // ── Build categorized facility/service lists ──
  const availableCottages = cottages.filter((c) => c.status !== 'maintenance');

  const servicesByCategory: Record<CategoryKey, Service[]> = {
    'cottages': [],
    'swimming-pool': services.filter((s) => s.category === 'swimming-pool' && s.available),
    'function-hall': services.filter((s) => s.category === 'function-hall' && s.available),
    'videoke':       services.filter((s) => s.category === 'videoke' && s.available),
    'foods':         [],
  };

  const availableFoodItems = foodMenuItems.filter((f) => f.available);

  // A category section is shown if it has items OR cottages/food have entries
  const hasCategoryContent = (cat: CategoryKey): boolean => {
    if (cat === 'cottages') return availableCottages.length > 0;
    if (cat === 'foods') return availableFoodItems.length > 0;
    return servicesByCategory[cat].length > 0;
  };

  const visibleCategories = CATEGORY_ORDER.filter(hasCategoryContent);

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/image%20copy.png" alt="Pring Kuyas Inn" className="logo-flip h-10 w-auto object-contain" />
            <BouncingText text="PRING KUYA'S INN" className="font-serif text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap" />
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className="text-sm font-semibold bg-amber-900 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative h-[580px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/62" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="flex justify-center gap-1.5 mb-5 landing-pop-up" style={{ animationDelay: '0.1s' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h1
            className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-5 landing-pop-up"
            style={{ animationDelay: '0.25s' }}
          >
            Your Perfect Stay<br />Awaits
          </h1>
          <p
            className="text-gray-200 text-lg mb-8 max-w-xl mx-auto leading-relaxed landing-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            Discover our beautifully appointed rooms, cottages, and curated services — everything you need for a perfect stay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 landing-pop-in" style={{ animationDelay: '0.7s' }}>
            <button
              onClick={handleExploreRooms}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              <Home size={17} /> Explore Rooms
            </button>
            <button
              onClick={handleExploreServices}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm"
            >
              <Sparkles size={17} /> Explore Facilities & Services
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 divide-x divide-gray-200 text-center">
          <div className="px-6 landing-fade-up">
            <p className="text-4xl font-bold text-gray-900">{roomTypes}</p>
            <p className="text-sm text-gray-500 mt-1">Room Types</p>
          </div>
          <div className="px-6 landing-fade-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-4xl font-bold text-gray-900">{availableCottages.length}</p>
            <p className="text-sm text-gray-500 mt-1">Cottages Available</p>
          </div>
          <div className="px-6 landing-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-4xl font-bold text-gray-900">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Concierge Service</p>
          </div>
        </div>
      </section>

      {/* ── Rooms ── */}
      <section ref={roomsRef} className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3 landing-fade-up">Our Rooms &amp; Suites</h2>
          <p className="text-gray-500 max-w-lg leading-relaxed landing-fade-up" style={{ animationDelay: '0.15s' }}>
            From cozy standard rooms to lavish suites — find the perfect space for your stay.
          </p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-lg">No rooms available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {rooms.map((room, idx) => {
              const imgSrc = room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length];
              const visibleAmenities = room.amenities.slice(0, 3);
              const extraCount = room.amenities.length - 3;

              return (
                <div
                  key={room.id}
                  className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer"
                  style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={`Room ${room.roomNumber}`}
                      className="room-card-img w-full h-full object-cover transition-transform duration-500"
                    />
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${TYPE_BADGE_COLORS[room.type] || 'bg-white text-gray-800'}`}
                    >
                      {TYPE_LABELS[room.type] || room.type}
                    </span>
                    <div className="room-card-overlay absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                      <span className="text-white text-sm font-medium flex items-center gap-1.5">
                        <Eye size={15} /> Click to view details
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug">
                        Room {room.roomNumber}
                      </h3>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xl font-bold text-gray-900">
                          ₱{room.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block">/night</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
                      {TYPE_LABELS[room.type]} room — a comfortable stay with all essential amenities for up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}.
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <Users size={13} />
                      <span>Up to {room.capacity} guest{room.capacity !== 1 ? 's' : ''}</span>
                    </div>

                    {room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {visibleAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                          >
                            {amenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="text-xs text-gray-400 self-center">+{extraCount} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      <button
                        onClick={handleViewBook}
                        className="room-card-book-btn w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 text-sm"
                      >
                        View &amp; Book
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Facilities & Services (categorized) ── */}
      <section ref={facilitiesRef} className="bg-[#f5f0eb] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3 landing-fade-up">Our Facilities &amp; Services</h2>
            <p className="text-gray-500 max-w-lg leading-relaxed landing-fade-up" style={{ animationDelay: '0.15s' }}>
              Explore our cottages, swimming pool, function hall, videoke, and food services — everything to make your stay memorable.
            </p>
          </div>

          {visibleCategories.length === 0 && availableCottages.length === 0 && availableFoodItems.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-lg">No facilities or services available at the moment.</div>
          ) : (
            <div className="space-y-14">
              {/* ── Cottages ── */}
              {availableCottages.length > 0 && (
                <CategorySection
                  title="Cottages"
                  icon={CATEGORY_CONFIG['cottages'].icon}
                  count={availableCottages.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {availableCottages.map((cottage, idx) => (
                      <FacilityCard
                        key={cottage.id}
                        name={cottage.name}
                        description={cottage.description || `Cozy cottage ${cottage.cottageNumber} — perfect for your getaway.`}
                        price={cottage.pricePerNight}
                        priceLabel="/night"
                        capacity={cottage.capacity}
                        image={cottage.image || COTTAGE_IMAGES[idx % COTTAGE_IMAGES.length]}
                        badge={`Cottage ${cottage.cottageNumber}`}
                        onBook={handleViewBook}
                        index={idx}
                      />
                    ))}
                  </div>
                </CategorySection>
              )}

              {/* ── Swimming Pool ── */}
              {servicesByCategory['swimming-pool'].length > 0 && (
                <CategorySection
                  title="Swimming Pool"
                  icon={CATEGORY_CONFIG['swimming-pool'].icon}
                  count={servicesByCategory['swimming-pool'].length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {servicesByCategory['swimming-pool'].map((service, idx) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        fallbackImage={POOL_IMAGES[idx % POOL_IMAGES.length]}
                        onBook={handleViewBook}
                        index={idx}
                      />
                    ))}
                  </div>
                </CategorySection>
              )}

              {/* ── Function Hall ── */}
              {(servicesByCategory['function-hall'].length > 0 || businessInfo.functionHallImage) && (
                <CategorySection
                  title="Function Hall"
                  icon={CATEGORY_CONFIG['function-hall'].icon}
                  count={servicesByCategory['function-hall'].length || 1}
                >
                  {businessInfo.functionHallImage && (
                    <div className="mb-6 overflow-hidden rounded-xl shadow-sm border border-gray-100">
                      <div className="relative h-72 sm:h-80 overflow-hidden group">
                        <img
                          src={businessInfo.functionHallImage}
                          alt="Function Hall"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-5 text-white">
                          <h4 className="font-serif text-xl font-bold">Function Hall</h4>
                          <p className="text-sm text-gray-200 mt-1">Book our elegant event venue for weddings, birthdays, and special gatherings.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {servicesByCategory['function-hall'].length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                      {servicesByCategory['function-hall'].map((service, idx) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          fallbackImage={HALL_IMAGES[idx % HALL_IMAGES.length]}
                          onBook={handleViewBook}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </CategorySection>
              )}

              {/* ── Videoke ── */}
              {servicesByCategory['videoke'].length > 0 && (
                <CategorySection
                  title="Videoke"
                  icon={CATEGORY_CONFIG['videoke'].icon}
                  count={servicesByCategory['videoke'].length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {servicesByCategory['videoke'].map((service, idx) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={handleViewBook}
                        index={idx}
                      />
                    ))}
                  </div>
                </CategorySection>
              )}

              {/* ── Food Services ── */}
              {availableFoodItems.length > 0 && (
                <CategorySection
                  title="Food Services"
                  icon={CATEGORY_CONFIG['foods'].icon}
                  count={availableFoodItems.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {availableFoodItems.map((item, idx) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        fallbackImage={FOOD_IMAGES[idx % FOOD_IMAGES.length]}
                        onBook={handleViewBook}
                        index={idx}
                      />
                    ))}
                  </div>
                </CategorySection>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
              {(businessInfo.ownerName || businessInfo.fbLink || businessInfo.contactNumber || businessInfo.location) && (
                <div className="flex flex-col gap-2.5 text-sm text-gray-600">
                  {businessInfo.ownerName && (
                    <span className="inline-flex items-center gap-2">
                      <UserIcon size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.ownerName}
                    </span>
                  )}
                  {businessInfo.contactNumber && (
                    <span className="inline-flex items-center gap-2">
                      <Phone size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.contactNumber}
                    </span>
                  )}
                  {businessInfo.location && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={15} className="text-amber-900 shrink-0" />
                      {businessInfo.location}
                    </span>
                  )}
                  {businessInfo.fbLink && (
                    <a
                      href={businessInfo.fbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors w-fit"
                    >
                      <Facebook size={15} />
                      Facebook
                    </a>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-400 text-right">
                &copy; {new Date().getFullYear()} Pring Kuya's Inn. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Category section wrapper ──
function CategorySection({ title, icon: Icon, count, children }: { title: string; icon: typeof Home; count: number; children: React.ReactNode }) {
  return (
    <div className="landing-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-900 text-white shadow-md">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{count} item{count !== 1 ? 's' : ''} available</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Cottage / facility card with image ──
function FacilityCard({ name, description, price, priceLabel, capacity, image, badge, onBook, index }: {
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  capacity: number;
  image: string;
  badge: string;
  onBook: () => void;
  index: number;
}) {
  return (
    <div
      className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={name} className="room-card-img w-full h-full object-cover transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-white text-gray-800">
          {badge}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug mb-2">{name}</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">{description}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Users size={13} />
          <span>Up to {capacity} guest{capacity !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₱{price.toLocaleString()}</span>
            <span className="text-xs text-gray-400 block">{priceLabel}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={14} /> Available
          </span>
        </div>
        <button
          onClick={onBook}
          className="room-card-book-btn mt-4 w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 text-sm"
        >
          View &amp; Book
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Service card (pool, function hall, videoke) ──
function ServiceCard({ service, fallbackImage, onBook, index }: {
  service: Service;
  fallbackImage?: string;
  onBook: () => void;
  index: number;
}) {
  const img = service.image || fallbackImage;
  return (
    <div
      className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      {img && (
        <div className="relative h-40 overflow-hidden">
          <img src={img} alt={service.name} className="room-card-img w-full h-full object-cover transition-transform duration-500" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug mb-2">{service.name}</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">{service.description}</p>
        {service.capacity && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Users size={13} />
            <span>Up to {service.capacity} guest{service.capacity !== 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₱{service.price.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={14} /> Available
          </span>
        </div>
        <button
          onClick={onBook}
          className="room-card-book-btn mt-4 w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 text-sm"
        >
          View &amp; Book
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Food card ──
function FoodCard({ item, fallbackImage, onBook, index }: {
  item: FoodMenuItem;
  fallbackImage: string;
  onBook: () => void;
  index: number;
}) {
  const img = item.image || fallbackImage;
  return (
    <div
      className="room-card-float landing-fade-up bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={img} alt={item.name} className="room-card-img w-full h-full object-cover transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-white text-gray-800 capitalize">
          {item.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug mb-2">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₱{item.price.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={14} /> Available
          </span>
        </div>
        <button
          onClick={onBook}
          className="room-card-book-btn mt-4 w-full flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 text-sm"
        >
          View &amp; Book
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
