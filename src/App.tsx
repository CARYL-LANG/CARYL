import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './lib/context';
import { Toaster } from './components/ui/toaster';
import { TransitionProvider } from './providers/transition-provider';
import type { ReactNode } from 'react';
import LandingPage from './pages/landing';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import ForgotPasswordPage from './pages/forgot-password';
import AdminPage from './pages/admin';
import AdminGuestsPage from './pages/admin/guests';
import AdminRoomsPage from './pages/admin/rooms';
import AdminReservationsPage from './pages/admin/reservations';
import AdminStaffPage from './pages/admin/staff';
import AdminPaymentsPage from './pages/admin/payments';
import AdminReportsPage from './pages/admin/reports';
import AdminSettingsPage from './pages/admin/settings';
import AdminFacilitiesServicesPage from './pages/admin/facilities-services';
import AdminActivityLogsPage from './pages/admin/activity-logs';
import CustomerPage from './pages/customer/index';
import CustomerMyBookingsPage from './pages/customer/my-bookings';
import CustomerEventsPage from './pages/customer/events';
import CustomerFacilitiesPage from './pages/customer/facilities';
import CustomerFoodOrderPage from './pages/customer/food-order';
import StaffPage from './pages/staff';
import StaffCheckInPage from './pages/staff/check-in';
import StaffCheckOutPage from './pages/staff/check-out';
import StaffEventsPage from './pages/staff/events';
import StaffReservationsPage from './pages/staff/reservations';
import StaffGuestsPage from './pages/staff/guests';
import StaffReportsPage from './pages/staff/reports';
import StaffSettingsPage from './pages/staff/settings';
import StaffFacilitiesPage from './pages/staff/facilities';
import StaffFoodOrdersPage from './pages/staff/food-orders';
import StaffMaintenancePage from './pages/staff/maintenance';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-800 to-amber-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
        <p className="text-amber-100 text-lg font-medium">Loading data...</p>
        <p className="text-amber-200/60 text-sm mt-2">Connecting to database</p>
      </div>
    </div>
  );
}

const homeForRole = (role: string): string =>
  role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, currentUser } = useBooking();
  if (isAuthenticated) {
    return <Navigate to={homeForRole(currentUser.role)} replace />;
  }
  return <>{children}</>;
}

function Protected({ children, allow }: { children: ReactNode; allow: string[] }) {
  const { isAuthenticated, currentUser } = useBooking();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!allow.includes(currentUser.role)) {
    return <Navigate to={homeForRole(currentUser.role)} replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const { isLoading } = useBooking();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<PublicOnly><LandingPage /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Protected allow={['admin']}><AdminPage /></Protected>} />
      <Route path="/admin/guests" element={<Protected allow={['admin']}><AdminGuestsPage /></Protected>} />
      <Route path="/admin/rooms" element={<Protected allow={['admin']}><AdminRoomsPage /></Protected>} />
      <Route path="/admin/reservations" element={<Protected allow={['admin']}><AdminReservationsPage /></Protected>} />
      <Route path="/admin/services" element={<Navigate to="/admin/facilities-services" replace />} />
      <Route path="/admin/staff" element={<Protected allow={['admin']}><AdminStaffPage /></Protected>} />
      <Route path="/admin/payments" element={<Protected allow={['admin']}><AdminPaymentsPage /></Protected>} />
      <Route path="/admin/reports" element={<Protected allow={['admin']}><AdminReportsPage /></Protected>} />
      <Route path="/admin/settings" element={<Protected allow={['admin']}><AdminSettingsPage /></Protected>} />
      <Route path="/admin/facilities" element={<Navigate to="/admin/facilities-services" replace />} />
      <Route path="/admin/food-menu" element={<Navigate to="/admin/facilities-services" replace />} />
      <Route path="/admin/facilities-services" element={<Protected allow={['admin']}><AdminFacilitiesServicesPage /></Protected>} />
      <Route path="/admin/activity-logs" element={<Protected allow={['admin']}><AdminActivityLogsPage /></Protected>} />

      {/* Customer Routes */}
      <Route path="/customer" element={<Protected allow={['customer']}><CustomerPage /></Protected>} />
      <Route path="/customer/my-bookings" element={<Protected allow={['customer']}><CustomerMyBookingsPage /></Protected>} />
      <Route path="/customer/events" element={<Protected allow={['customer']}><CustomerEventsPage /></Protected>} />
      <Route path="/customer/facilities" element={<Protected allow={['customer']}><CustomerFacilitiesPage /></Protected>} />
      <Route path="/customer/food-order" element={<Protected allow={['customer']}><CustomerFoodOrderPage /></Protected>} />

      {/* Staff Routes */}
      <Route path="/staff" element={<Protected allow={['staff']}><StaffPage /></Protected>} />
      <Route path="/staff/check-in" element={<Protected allow={['staff']}><StaffCheckInPage /></Protected>} />
      <Route path="/staff/check-out" element={<Protected allow={['staff']}><StaffCheckOutPage /></Protected>} />
      <Route path="/staff/reservations" element={<Protected allow={['staff']}><StaffReservationsPage /></Protected>} />
      <Route path="/staff/guests" element={<Protected allow={['staff']}><StaffGuestsPage /></Protected>} />
      <Route path="/staff/events" element={<Protected allow={['staff']}><StaffEventsPage /></Protected>} />
      <Route path="/staff/reports" element={<Protected allow={['staff']}><StaffReportsPage /></Protected>} />
      <Route path="/staff/settings" element={<Protected allow={['staff']}><StaffSettingsPage /></Protected>} />
      <Route path="/staff/facilities" element={<Protected allow={['staff']}><StaffFacilitiesPage /></Protected>} />
      <Route path="/staff/food-orders" element={<Protected allow={['staff']}><StaffFoodOrdersPage /></Protected>} />
      <Route path="/staff/maintenance" element={<Protected allow={['staff']}><StaffMaintenancePage /></Protected>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <TransitionProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
        <Toaster />
      </TransitionProvider>
    </Router>
  );
}

export default App;
