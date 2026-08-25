import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  FileText,
  Settings,
  Menu,
  Calendar,
  CalendarPlus,
  LayoutDashboard,
  Users,
  Waves,
  Utensils,
  Wrench,
} from 'lucide-react';
import { useState, useRef, useLayoutEffect } from 'react';
import { useBooking } from '../../lib/context';

let savedScrollTop = 0;

const menuItems = [
  { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { label: 'Reservations', href: '/staff/reservations', icon: CalendarPlus },
  { label: 'Check-In', href: '/staff/check-in', icon: LogIn },
  { label: 'Check-Out', href: '/staff/check-out', icon: LogOut },
  { label: 'Guests', href: '/staff/guests', icon: Users },
  { label: 'Events', href: '/staff/events', icon: Calendar },
  { label: 'Facilities', href: '/staff/facilities', icon: Waves },
  { label: 'Food Orders', href: '/staff/food-orders', icon: Utensils },
  { label: 'Maintenance', href: '/staff/maintenance', icon: Wrench },
  { label: 'Reports', href: '/staff/reports', icon: FileText },
  { label: 'Settings', href: '/staff/settings', icon: Settings },
];

export function StaffSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useBooking();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (navRef.current) {
      navRef.current.scrollTop = savedScrollTop;
    }
    return () => {
      if (navRef.current) {
        savedScrollTop = navRef.current.scrollTop;
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-600 text-white transition-transform duration-300 md:translate-x-0 md:relative z-40 flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-blue-500">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="logo-flip w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold">Staff Portal</h1>
        </div>

        <nav ref={navRef} className="no-scrollbar mt-8 px-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors duration-0 ${
                  isActive
                    ? 'bg-white text-blue-700'
                    : 'text-blue-100 hover:bg-blue-500'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
