import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Edit2, Trash2, Plus, Search, Copy } from 'lucide-react';
import { EditStaffModal } from '../../components/admin/edit-staff-modal';
import { showSuccessNotification, showErrorNotification } from '../../lib/notifications';
import { useBooking } from '../../lib/context';

interface StaffData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  phone: string;
  status: string;
  joinDate: string;
}

export default function StaffManagementPage() {
  const navigate = useNavigate();
  const { staffAccounts, addStaffAccount, updateStaffAccount, deleteStaffAccount } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ firstName: string; lastName: string; email: string; password: string } | null>(null);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    position: '',
    phone: '',
    password: '',
  });

  // Generate random password
  const generatePassword = (length: number = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Add User Account
  const handleAddStaff = () => {
    if (
      !newStaff.firstName ||
      !newStaff.lastName ||
      !newStaff.email ||
      !newStaff.position
    ) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (staffAccounts.some((s) => s.email.toLowerCase() === newStaff.email.toLowerCase())) {
      showErrorNotification({
        title: 'Email Already Exists',
        description: 'A staff account with this email already exists.',
      });
      return;
    }

    const finalPassword = newStaff.password || generatePassword();
    const staff = {
      id: `staff-${Date.now()}`,
      firstName: newStaff.firstName,
      middleInitial: newStaff.middleInitial,
      lastName: newStaff.lastName,
      email: newStaff.email,
      position: newStaff.position,
      phone: newStaff.phone,
      status: 'active' as const,
      joinDate: new Date().toISOString().split('T')[0],
      password: finalPassword,
    };

    addStaffAccount(staff);

    setGeneratedCredentials({
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      email: newStaff.email,
      password: finalPassword,
    });
    setShowCredentialsModal(true);

    setNewStaff({ firstName: '', middleInitial: '', lastName: '', email: '', position: '', phone: '', password: '' });
    setShowAddForm(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (staff: StaffData) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  // Save Edited Staff
  const handleSaveStaff = (updatedStaffData: any) => {
    updateStaffAccount(updatedStaffData.id, updatedStaffData);
    showSuccessNotification({
      title: 'User Updated',
      description: `${updatedStaffData.firstName} ${updatedStaffData.lastName}'s information has been updated.`,
    });
  };

  // Deactivate/Delete Staff
  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to deactivate this staff member?')) {
      deleteStaffAccount(staffId);
      showSuccessNotification({
        title: 'User Deactivated',
        description: 'User account has been deactivated successfully.',
      });
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (email: string, password: string | undefined) => {
    if (!password) {
      showErrorNotification({
        title: 'No Password',
        description: 'This staff account does not have a password assigned.',
      });
      return;
    }
    const credentials = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000);
    showSuccessNotification({
      title: 'Copied',
      description: 'Credentials copied to clipboard.',
    });
  };

  // Search Staff
  const filteredStaff = staffAccounts.filter(
    (staff) =>
      staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Staff Management</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Add Staff
              </button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
              <Card className="mb-6 border-l-4 border-blue-500">
                <CardHeader>
                  <CardTitle>Add New Staff</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={newStaff.firstName}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Initial
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="MI"
                        value={newStaff.middleInitial}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, middleInitial: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={newStaff.lastName}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={newStaff.email}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-gray-500 text-xs">(leave empty to auto-generate)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter password or leave empty"
                        value={newStaff.password}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, password: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position *
                      </label>
                      <select
                        value={newStaff.position}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, position: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select Position</option>
                        <option value="Manager">Manager</option>
                        <option value="Front Desk Officer">Front Desk Officer</option>
                        <option value="Housekeeper">Housekeeper</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={newStaff.phone}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddStaff}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {staffAccounts.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {staffAccounts.filter((s) => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Inactive Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {staffAccounts.filter((s) => s.status === 'inactive').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by first name, last name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-gray-50 border-0 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Staff Table */}
            <Card>
              <CardHeader>
                <CardTitle>Staff List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Position
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Join Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {staff.firstName} {staff.middleInitial ? `${staff.middleInitial}. ` : ''}{staff.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {staff.email}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {staff.position}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {staff.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                staff.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {staff.status === 'active' ? 'Activate' : 'Deactivate'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(staff.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopyCredentials(staff.email, staff.password)}
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Copy credentials"
                              >
                                <Copy size={16} className={copiedId === staff.email ? 'text-green-600' : 'text-blue-600'} />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(staff)}
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Edit user"
                              >
                                <Edit2 size={16} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Delete user"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStaff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No staff members found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Credentials Modal */}
        {showCredentialsModal && generatedCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-center text-green-600">
                  Staff Account Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share these credentials with {generatedCredentials.firstName} {generatedCredentials.lastName}:
                </p>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={generatedCredentials.email}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCredentials.email);
                          showSuccessNotification({
                            title: 'Copied',
                            description: 'Email copied to clipboard',
                          });
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={generatedCredentials.password}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCredentials.password);
                          showSuccessNotification({
                            title: 'Copied',
                            description: 'Password copied to clipboard',
                          });
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Important:</strong> Make sure the staff member saves these credentials securely. They can be found later by copying credentials from the staff list.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setGeneratedCredentials(null);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Done
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        <EditStaffModal
          staff={selectedStaff}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStaff(null);
          }}
          onSave={handleSaveStaff}
        />
      </div>
    </div>
  );
}
