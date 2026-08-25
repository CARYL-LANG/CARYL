import { useState } from 'react';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ClipboardList, Search } from 'lucide-react';

export default function AdminActivityLogsPage() {
  const { activityLogs } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const q = searchQuery.trim().toLowerCase();
  const filtered = activityLogs.filter((log) => {
    const matchesSearch = !q || log.action.toLowerCase().includes(q) || (log.details || '').toLowerCase().includes(q) || (log.userName || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
    const logCategory = log.entityType || '';
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'login' && log.action.toLowerCase().includes('login')) ||
      (categoryFilter === 'reservation' && (logCategory === 'booking' || log.action.toLowerCase().includes('reservation') || log.action.toLowerCase().includes('check-in') || log.action.toLowerCase().includes('check-out'))) ||
      (categoryFilter === 'payment' && (logCategory === 'payment' || log.action.toLowerCase().includes('payment') || log.action.toLowerCase().includes('verify'))) ||
      (categoryFilter === 'account' && (log.action.toLowerCase().includes('account') || log.action.toLowerCase().includes('profile') || log.action.toLowerCase().includes('customer') || log.action.toLowerCase().includes('staff')));
    return matchesSearch && matchesRole && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const roleColor = (role?: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-800';
    if (role === 'staff') return 'bg-blue-100 text-blue-800';
    if (role === 'customer') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-gray-600 mt-2">Audit trail of all user actions in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Categories</option>
                <option value="login">Login History</option>
                <option value="reservation">Reservation Logs</option>
                <option value="payment">Payment Logs</option>
                <option value="account">Account Activity</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No activity logs found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtered.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{log.userName || 'Unknown'}</td>
                          <td className="px-6 py-4">
                            <Badge className={roleColor(log.userRole)}>{log.userRole || 'unknown'}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{log.entityType || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
