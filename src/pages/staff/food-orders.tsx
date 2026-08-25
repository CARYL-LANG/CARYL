import { useState } from 'react';
import { useBooking } from '../../lib/context';
import { StaffSidebar } from '../../components/staff/staff-sidebar';
import { StaffHeader } from '../../components/staff/staff-header';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Utensils, Search, UtensilsCrossed } from 'lucide-react';
import { showSuccessNotification } from '../../lib/notifications';

export default function StaffFoodOrdersPage() {
  const { foodOrders, updateFoodOrder, logActivity } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const q = searchQuery.trim().toLowerCase();
  const filtered = foodOrders.filter((o) => {
    const matchesSearch = !q || o.customerName.toLowerCase().includes(q) || o.items.some((i) => i.menuItemName.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateFoodOrder(id, { status: status as any });
    logActivity('Updated food order status', 'food_order', id, `Status changed to ${status}`);
  };

  const handleServe = (id: string, customerName: string) => {
    updateFoodOrder(id, { status: 'served' });
    logActivity('Served food order', 'food_order', id, `Order for ${customerName} marked as served`);
    showSuccessNotification({ title: 'Order Served', description: `Order for ${customerName} has been marked as served.` });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex-1 overflow-auto">
        <StaffHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Food Orders</h1>
              <p className="text-gray-600 mt-2">Process and track customer food orders</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{foodOrders.filter((o) => o.status === 'pending').length}</p><p className="text-xs text-gray-500">Pending</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{foodOrders.filter((o) => o.status === 'preparing').length}</p><p className="text-xs text-gray-500">Preparing</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{foodOrders.filter((o) => o.status === 'served').length}</p><p className="text-xs text-gray-500">Served</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-2xl font-bold text-gray-900">{foodOrders.length}</p><p className="text-xs text-gray-500">Total Orders</p></CardContent></Card>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-gray-500"><Utensils size={40} className="mx-auto mb-3 text-gray-300" />No food orders found.</CardContent></Card>
            ) : (
              filtered.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-gray-900">{order.customerName}</h3>
                          <Badge className={
                            order.status === 'served' ? 'bg-green-100 text-green-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-sm text-gray-700">
                              {item.menuItemName} x{item.quantity} — ₱{item.subtotal}
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">Note: {order.notes}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900 mt-2">Total: ₱{order.totalPrice}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:w-48">
                        {order.status !== 'served' && order.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleServe(order.id, order.customerName)}
                            className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <UtensilsCrossed size={16} />
                            Serve
                          </button>
                        ) : (
                          <div className="flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                            {order.status === 'served' ? 'Served' : 'Cancelled'}
                          </div>
                        )}
                        <label className="text-xs font-medium text-gray-500 mt-1">Update Status</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="served">Served</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
