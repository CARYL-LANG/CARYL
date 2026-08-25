import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useBooking } from '../lib/context';
import { supabase } from '../lib/supabase';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ADMIN_EMAIL = 'admin@gmail.com';

type Step = 'email' | 'otp' | 'reset' | 'done';
type AccountType = 'admin' | 'staff' | 'customer';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { customerAccounts, staffAccounts } = useBooking();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const findAccount = (inputEmail: string): AccountType | null => {
    const lower = inputEmail.toLowerCase();
    if (lower === ADMIN_EMAIL.toLowerCase()) return 'admin';
    if (staffAccounts.some((s) => s.email.toLowerCase() === lower)) return 'staff';
    if (customerAccounts.some((c) => c.email.toLowerCase() === lower)) return 'customer';
    return null;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const type = findAccount(email);
    if (!type) {
      setError('No account found with that email address');
      return;
    }

    setIsLoading(true);
    setAccountType(type);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code. Please try again.');
      }

      setStep('otp');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send code. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired code. Please try again.');
      }

      setStep('reset');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired code. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (accountType === 'admin') {
        const { error: updateError } = await supabase
          .from('app_settings')
          .update({ admin_password: newPassword })
          .neq('id', '00000000-0000-0000-0000-000000000000');
        if (updateError) throw updateError;
      } else if (accountType === 'staff') {
        const staff = staffAccounts.find(
          (s) => s.email.toLowerCase() === email.toLowerCase()
        );
        if (!staff) throw new Error('Staff account not found');
        const { error: updateError } = await supabase
          .from('staff_accounts')
          .update({ password_hash: newPassword })
          .eq('id', staff.id);
        if (updateError) throw updateError;
      } else {
        const customer = customerAccounts.find(
          (c) => c.email.toLowerCase() === email.toLowerCase()
        );
        if (!customer) throw new Error('Customer account not found');
        const { error: updateError } = await supabase
          .from('customers')
          .update({ password_hash: newPassword })
          .eq('id', customer.id);
        if (updateError) throw updateError;
      }

      setStep('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'pl-10 h-9 text-sm bg-amber-950/60 border-amber-700 text-amber-50 placeholder-amber-300/60 focus:border-amber-400 focus:ring-amber-400 rounded-md';

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
            <h1 className="text-xl font-bold text-amber-50 mb-1">
              {step === 'done' ? 'PASSWORD RESET' : 'FORGOT PASSWORD'}
            </h1>
            <p className="text-amber-200 text-xs">
              {step === 'email' && 'Enter your registered email to receive a code'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'reset' && 'Choose a new password for your account'}
              {step === 'done' && 'Your password has been changed successfully'}
            </p>
          </div>

          {error && (
            <div className="p-2 bg-red-900/40 border border-red-700 rounded text-red-200 text-xs mb-4">
              {error}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
                <Input
                  type="email"
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-amber-950 font-bold py-2 h-9 text-sm rounded-md transition"
              >
                {isLoading ? 'Sending code...' : 'Send Code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`${inputClass} tracking-[0.3em] text-center font-bold`}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-amber-950 font-bold py-2 h-9 text-sm rounded-md transition"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-amber-300 hover:text-amber-200 text-xs transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Use a different email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-300" />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-amber-950 font-bold py-2 h-9 text-sm rounded-md transition"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-amber-950 font-bold py-2 h-9 text-sm rounded-md transition"
              >
                Back to Login
              </Button>
            </div>
          )}

          {step !== 'done' && (
            <div className="text-center text-amber-100 text-xs mt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-300 hover:text-amber-200 font-bold transition">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
