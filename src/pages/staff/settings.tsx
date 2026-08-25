import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useBooking } from '../../lib/context';
import { Settings, User, Bell, Lock } from 'lucide-react';
import { showSuccessNotification, showErrorNotification } from '../../lib/notifications';

export default function StaffSettingsPage() {
  const navigate = useNavigate();
  const { currentUser, staffAccounts, changeStaffPassword, updateStaffAccount } = useBooking();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editName, setEditName] = useState(currentUser.name || '');
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');

  const currentStaffAccount = staffAccounts.find((s) => s.id === currentUser.id);

  const handleSaveProfile = () => {
    if (!currentStaffAccount) return;
    const nameParts = editName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    updateStaffAccount(currentUser.id, {
      firstName,
      lastName,
      email: editEmail,
      phone: editPhone,
    });
    showSuccessNotification({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
      });
      return;
    }
    if (currentPassword !== currentStaffAccount?.password) {
      showErrorNotification({
        title: 'Invalid Current Password',
        description: 'The current password you entered is incorrect.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorNotification({
        title: 'Password Mismatch',
        description: 'New passwords do not match. Please try again.',
      });
      return;
    }
    changeStaffPassword(currentUser.id, newPassword);
    showSuccessNotification({
      title: 'Password Changed',
      description: 'Your password has been changed successfully. The new password will be used for your next login.',
    });
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Settings</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={24} className="text-blue-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Save Profile
                </button>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={24} className="text-orange-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email notifications for check-ins</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email notifications for check-outs</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Receive booking confirmations</span>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={24} className="text-red-600" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>

                {showChangePassword && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Update Password
                    </button>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Last login: 2024-04-30 at 09:30 AM
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
