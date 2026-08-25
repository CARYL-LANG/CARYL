import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useBooking } from '../lib/context';

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useBooking();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
}
