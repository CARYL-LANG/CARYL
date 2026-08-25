import { useState, useMemo } from 'react';
import { useBooking } from '../../lib/context';
import { CustomerHeader } from '../../components/customer/customer-header';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Utensils, Plus, Minus, ShoppingCart, Search, Clock } from 'lucide-react';
import { FoodMenuItem, FoodOrder, FoodOrderItem } from '../../lib/types';

const CATEGORIES = ['all', 'meal', 'snack', 'beverage', 'dessert', 'package'] as const;

export default function CustomerFoodOrderPage() {
  const { foodMenuItems, addFoodOrder, currentUser, logActivity, bookings, foodOrders } = useBooking();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ menuItem: FoodMenuItem; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');

  const availableItems = foodMenuItems.filter((i) => i.available);
  const q = searchQuery.trim().toLowerCase();
  const filtered = availableItems.filter((i) => {
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesSearch = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0), [cart]);

  const addToCart = (menuItem: FoodMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((c) => c.menuItem.id === menuItem.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === menuItemId) {
            const newQty = c.quantity + delta;
            return newQty <= 0 ? null : { ...c, quantity: newQty };
          }
          return c;
        })
        .filter(Boolean) as { menuItem: FoodMenuItem; quantity: number }[];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== menuItemId));
  };

  const myBookings = bookings.filter(
    (b) => b.guestEmail === currentUser.email && (b.status === 'confirmed' || b.status === 'checked-in')
  );

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const items: FoodOrderItem[] = cart.map((c) => ({
      id: crypto.randomUUID(),
      foodOrderId: '',
      menuItemId: c.menuItem.id,
      menuItemName: c.menuItem.name,
      quantity: c.quantity,
      unitPrice: c.menuItem.price,
      subtotal: c.menuItem.price * c.quantity,
    }));

    const order: FoodOrder = {
      id: crypto.randomUUID(),
      customerName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || currentUser.email,
      status: 'preparing',
      totalPrice: cartTotal,
      notes: notes || undefined,
      items,
      createdAt: new Date().toISOString(),
      bookingId: selectedBookingId || undefined,
    };
    addFoodOrder(order);
    logActivity('Placed food order', 'food_order', order.id, `${cart.length} items, total ₱${cartTotal}${selectedBookingId ? ' (linked to booking)' : ''}`);
    setCart([]);
    setNotes('');
    setSelectedBookingId('');
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader currentPage="food" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Order</h1>
        <p className="text-gray-600 mb-6">Browse our menu and place an order</p>

        {orderPlaced && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 font-medium">
            Your order has been placed successfully! The kitchen will prepare it shortly.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-2 bg-white rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No food items available.</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Utensils size={16} className="text-orange-500" />
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 text-xs capitalize">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description || 'No description'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-orange-600">₱{item.price}</span>
                        <Button onClick={() => addToCart(item)} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                          <Plus size={16} /> Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} /> Your Order ({cart.length})
                </h2>

                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    {myBookings.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link to reservation (optional)</label>
                        <select
                          value={selectedBookingId}
                          onChange={(e) => setSelectedBookingId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                        >
                          <option value="">No specific reservation</option>
                          {myBookings.map((b) => (
                            <option key={b.id} value={b.id}>
                              Room {b.roomNumber || 'N/A'} · {b.checkInDate} → {b.checkOutDate} · {b.status}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="space-y-3 mb-4">
                      {cart.map((c) => (
                        <div key={c.menuItem.id} className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{c.menuItem.name}</p>
                            <p className="text-xs text-gray-500">₱{c.menuItem.price} x {c.quantity} = ₱{c.menuItem.price * c.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(c.menuItem.id, -1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{c.quantity}</span>
                            <button onClick={() => updateQuantity(c.menuItem.id, 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">
                              <Plus size={14} />
                            </button>
                            <button onClick={() => removeFromCart(c.menuItem.id)} className="p-1 rounded text-red-500 hover:bg-red-50 ml-1">
                              <Minus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <textarea
                      placeholder="Special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={2}
                    />

                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-orange-600">₱{cartTotal}</span>
                      </div>
                    </div>

                    <Button onClick={handlePlaceOrder} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Place Order
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Order History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={22} /> My Order History
          </h2>
          {(() => {
            const myOrders = foodOrders
              .filter((o) => o.customerName === `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || o.customerName === currentUser.email)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            if (myOrders.length === 0) {
              return (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    You have no food orders yet.
                  </CardContent>
                </Card>
              );
            }
            return (
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              order.status === 'served' ? 'bg-green-100 text-green-800' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {order.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {order.items.map((i) => `${i.menuItemName} x${i.quantity}`).join(', ')}
                          </p>
                          {order.notes && <p className="text-xs text-gray-500 mt-1 italic">Note: {order.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">₱{order.totalPrice}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
