import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  DoorOpen,
  Users,
  BarChart3,
  Settings,
  Menu,
  UserPlus,
  LogOut,
  Layers3,
  ClipboardList,
  Wrench,
  FileText,
} from 'lucide-react';
import { useState, useRef, useLayoutEffect } from 'react';
import { useBooking } from '../../lib/context';

let savedScrollTop = 0;

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Reservations', href: '/admin/reservations', icon: Calendar },
  { label: 'Rooms', href: '/admin/rooms', icon: DoorOpen },
  { label: 'Customers', href: '/admin/guests', icon: Users },
  { label: 'Staff', href: '/admin/staff', icon: UserPlus },
  { label: 'Facilities and Services', href: '/admin/facilities-services', icon: Layers3 },
  { label: 'Payments', href: '/admin/payments', icon: FileText },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Activity Logs', href: '/admin/activity-logs', icon: ClipboardList },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-700 text-white rounded-lg"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-800 to-slate-700 text-white transition-transform duration-300 md:translate-x-0 md:relative z-40 flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="logo-flip w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-200 hover:bg-slate-600'
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-200 hover:bg-red-600 hover:text-white transition-colors"
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
