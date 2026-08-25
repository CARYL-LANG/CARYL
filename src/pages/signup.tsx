import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useBooking } from '../lib/context';
import { Mail, Lock, User, Phone } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setCurrentUser, addCustomerAccount } = useBooking();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'customer' as const,
      };

      addCustomerAccount(userData);
      setCurrentUser(userData);
      navigate('/');
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
            <h1 className="text-xl font-bold text-amber-50 mb-1">CREATE ACCOUNT</h1>
            <p className="text-amber-200 text-xs">Join Pring Kuyas Inn Online</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md"
                required
              />
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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="text-center text-amber-100 text-xs mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-300 hover:text-amber-200 font-bold transition">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
