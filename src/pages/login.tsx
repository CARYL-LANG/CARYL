import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { useBooking } from '../lib/context';
import { Mail, Lock } from 'lucide-react';
import { BouncingText } from '../components/bouncing-text';

type UserRole = 'admin' | 'staff' | 'customer';

const ADMIN_EMAIL = 'admin@gmail.com';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser, staffAccounts, customerAccounts, adminPassword } = useBooking();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let role: UserRole | null = null;
      let userId = '';
      let userName = '';
      let userEmail = '';
      let userPhone = '';
      let userFirstName = '';
      let userLastName = '';

      if (
        email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === adminPassword
      ) {
        role = 'admin';
        userId = '1';
        userName = 'Admin User';
        userFirstName = 'Admin';
        userLastName = 'User';
      } else {
        const staffAccount = staffAccounts.find(
          (staff) =>
            staff.email.toLowerCase() === email.toLowerCase() &&
            staff.password === password &&
            staff.status === 'active'
        );

        if (staffAccount) {
          role = 'staff';
          userId = staffAccount.id;
          userName = `${staffAccount.firstName} ${staffAccount.lastName}`;
          userFirstName = staffAccount.firstName;
          userLastName = staffAccount.lastName;
        } else {
          const customerAccount = customerAccounts.find(
            (customer) =>
              customer.email.toLowerCase() === email.toLowerCase() &&
              customer.password === password
          );

          if (customerAccount) {
            if (customerAccount.status === 'inactive') {
              setIsLoading(false);
              setError('Your account has been deactivated. Please contact the hotel administrator.');
              return;
            }
            role = 'customer';
            userId = customerAccount.id;
            userFirstName = customerAccount.firstName || '';
            userLastName = customerAccount.lastName || '';
            userName = `${userFirstName} ${userLastName}`;
            userEmail = customerAccount.email;
            userPhone = customerAccount.phone || '';
          }
        }
      }

      if (!role) {
        setIsLoading(false);
        setError('Invalid email or password');
        return;
      }

      const userData = {
        id: userId,
        firstName: userFirstName || userName.split(' ')[0] || '',
        lastName: userLastName || userName.split(' ')[1] || '',
        name: userName,
        email: userEmail || email,
        phone: userPhone,
        role,
      };

      setCurrentUser(userData);

      if (rememberMe) {
        localStorage.setItem('userCredentials', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('userCredentials');
      }

      const dashboardMap: Record<UserRole, string> = {
        admin: '/admin',
        staff: '/staff',
        customer: '/',
      };
      navigate(dashboardMap[role]);
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-sm h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="flex justify-center mb-4 flex-shrink-0">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="logo-flip w-32 h-32 object-contain drop-shadow-lg"
          />
        </div>

        <div className="bg-amber-900/85 backdrop-blur-sm border-2 border-amber-700 rounded-lg shadow-2xl p-6 w-full flex-shrink-0">
          <div className="text-center mb-6">
            <BouncingText text="PRING KUYAS INN ONLINE" className="text-xl font-bold text-amber-50 mb-1" />
            <p className="text-amber-200 text-xs">
              A Web-Based Booking and Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-amber-400"
                />
                <label htmlFor="remember" className="text-amber-100 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-amber-300 hover:text-amber-200 transition">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-2 bg-red-900/40 border border-red-700 rounded text-red-200 text-xs">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-amber-950 font-bold py-2 h-9 text-sm rounded-md transition"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="text-center text-amber-100 text-xs mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-300 hover:text-amber-200 font-bold transition">
              Sign up
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
}
