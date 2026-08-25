import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { User, Booking, Room, DashboardMetrics, EventBooking, Service, PaymentConfig, PaymentMethod, StaffAccount, BusinessInfo, FacilityBooking, FoodMenuItem, FoodOrder, FoodOrderItem, ActivityLog, MaintenanceReport, Cottage } from './types';
import type {
  DatabaseRoom,
  DatabaseService,
  DatabaseCottage,
  DatabaseBooking,
  DatabaseEventBooking,
  DatabaseStaffAccount,
  DatabaseCustomer,
  DatabaseEventTypePrice,
  DatabasePaymentConfig,
  DatabaseAppSettings,
  DatabaseFacilityBooking,
  DatabaseFoodMenuItem,
  DatabaseFoodOrder,
  DatabaseFoodOrderItem,
  DatabaseActivityLog,
  DatabaseMaintenanceReport
} from './supabase';

interface EventTypePrice {
  type: string;
  name: string;
  description: string;
  price: number;
  capacity?: number;
}

export interface BookingContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  bookings: Booking[];
  eventBookings: EventBooking[];
  rooms: Room[];
  eventRooms: Room[];
  services: Service[];
  cottages: Cottage[];
  facilityBookings: FacilityBooking[];
  foodMenuItems: FoodMenuItem[];
  foodOrders: FoodOrder[];
  activityLogs: ActivityLog[];
  maintenanceReports: MaintenanceReport[];
  eventTypePrices: EventTypePrice[];
  staffAccounts: StaffAccount[];
  customerAccounts: (User & { password?: string })[];
  addCustomerAccount: (user: User & { password: string }) => void;
  paymentConfig: PaymentConfig;
  setPaymentConfig: (config: PaymentConfig) => void;
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  recordPayment: (bookingId: string, method: PaymentMethod, amount: number, reference?: string, screenshot?: string) => void;
  recordEventPayment: (eventId: string, method: PaymentMethod, amount: number, reference?: string, screenshot?: string) => void;
  recordFacilityPayment: (facilityBookingId: string, method: PaymentMethod, amount: number, reference?: string, screenshot?: string) => void;
  addEventBooking: (booking: EventBooking) => void;
  updateEventBooking: (id: string, booking: Partial<EventBooking>) => void;
  deleteEventBooking: (id: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addCottage: (cottage: Cottage) => void;
  updateCottage: (id: string, cottage: Partial<Cottage>) => void;
  deleteCottage: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addFacilityBooking: (booking: FacilityBooking) => void;
  updateFacilityBooking: (id: string, updates: Partial<FacilityBooking>) => void;
  deleteFacilityBooking: (id: string) => void;
  addFoodMenuItem: (item: FoodMenuItem) => void;
  updateFoodMenuItem: (id: string, updates: Partial<FoodMenuItem>) => void;
  deleteFoodMenuItem: (id: string) => void;
  addFoodOrder: (order: FoodOrder) => void;
  updateFoodOrder: (id: string, updates: Partial<FoodOrder>) => void;
  deleteFoodOrder: (id: string) => void;
  addMaintenanceReport: (report: MaintenanceReport) => void;
  updateMaintenanceReport: (id: string, updates: Partial<MaintenanceReport>) => void;
  deleteMaintenanceReport: (id: string) => void;
  logActivity: (action: string, entityType?: string, entityId?: string, details?: string) => void;
  setEventTypePrice: (type: string, price: number) => void;
  addEventType: (type: string, name: string, description: string, price: number, capacity?: number) => void;
  updateEventType: (type: string, name: string, description: string, price: number, capacity?: number) => void;
  deleteEventType: (type: string) => void;
  addStaffAccount: (staffAccount: StaffAccount) => void;
  updateStaffAccount: (id: string, staffAccount: Partial<StaffAccount>) => void;
  deleteStaffAccount: (id: string) => void;
  changeAdminPassword: (newPassword: string) => void;
  changeStaffPassword: (staffId: string, newPassword: string) => void;
  changeCustomerPassword: (customerId: string, newPassword: string) => void;
  updateCustomerStatus: (customerId: string, status: 'active' | 'inactive') => void;
  updateAdminProfile: (name: string) => void;
  adminPassword: string;
  getMetrics: () => DashboardMetrics;
  isLoading: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper functions to convert between database and app types
const dbRoomToRoom = (db: DatabaseRoom): Room => ({
  id: db.id,
  roomNumber: db.room_number,
  type: db.type,
  pricePerNight: Number(db.price_per_night),
  capacity: db.capacity,
  amenities: db.amenities,
  status: db.status,
  image: db.image_url || undefined,
});

const dbServiceToService = (db: DatabaseService): Service => ({
  id: db.id,
  name: db.name,
  category: db.category,
  description: db.description,
  price: Number(db.price),
  capacity: db.capacity || undefined,
  available: db.available,
  status: db.status || (db.available ? 'available' : 'unavailable'),
  image: db.image_url || undefined,
  durationHours: db.duration_hours || undefined,
  operatingHours: db.operating_hours || undefined,
});

const dbCottageToCottage = (db: DatabaseCottage): Cottage => ({
  id: db.id,
  cottageNumber: db.cottage_number,
  name: db.name,
  description: db.description || undefined,
  pricePerNight: Number(db.price_per_night),
  capacity: db.capacity,
  status: db.status,
  image: db.image_url || undefined,
});

const dbFacilityBookingToFacilityBooking = (db: DatabaseFacilityBooking): FacilityBooking => ({
  id: db.id,
  facilityType: db.facility_type,
  facilityId: db.facility_id || undefined,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone || undefined,
  bookingDate: db.booking_date,
  startTime: db.start_time || undefined,
  endTime: db.end_time || undefined,
  numberOfGuests: db.number_of_guests,
  status: db.status,
  totalPrice: Number(db.total_price),
  paymentMethod: (db.payment_method as PaymentMethod) || undefined,
  paymentReference: db.payment_reference || undefined,
  paymentStatus: (db.payment_status as FacilityBooking['paymentStatus']) || undefined,
  transactionScreenshot: db.transaction_screenshot || undefined,
  createdAt: db.created_at,
});

const dbFoodMenuItemToFoodMenuItem = (db: DatabaseFoodMenuItem): FoodMenuItem => ({
  id: db.id,
  name: db.name,
  category: db.category,
  description: db.description || '',
  price: Number(db.price),
  available: db.available,
  status: db.status || (db.available ? 'available' : 'unavailable'),
  image: db.image_url || undefined,
  packageItems: db.package_items ? (() => { try { return JSON.parse(db.package_items); } catch { return undefined; } })() : undefined,
});

const dbFoodOrderToFoodOrder = (db: DatabaseFoodOrder, items: DatabaseFoodOrderItem[]): FoodOrder => ({
  id: db.id,
  bookingId: db.booking_id || undefined,
  eventBookingId: db.event_booking_id || undefined,
  customerName: db.customer_name,
  status: db.status,
  totalPrice: Number(db.total_price),
  notes: db.notes || undefined,
  items: items.map((item) => ({
    id: item.id,
    foodOrderId: item.food_order_id,
    menuItemId: item.menu_item_id || undefined,
    menuItemName: item.menu_item_name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.subtotal),
  })),
  createdAt: db.created_at,
});

const dbActivityLogToActivityLog = (db: DatabaseActivityLog): ActivityLog => ({
  id: db.id,
  userId: db.user_id || undefined,
  userName: db.user_name || undefined,
  userRole: (db.user_role as ActivityLog['userRole']) || undefined,
  action: db.action,
  entityType: db.entity_type || undefined,
  entityId: db.entity_id || undefined,
  details: db.details || undefined,
  createdAt: db.created_at,
});

const dbMaintenanceReportToMaintenanceReport = (db: DatabaseMaintenanceReport): MaintenanceReport => ({
  id: db.id,
  itemType: db.item_type,
  itemId: db.item_id || undefined,
  itemName: db.item_name,
  reportedBy: db.reported_by || undefined,
  reporterName: db.reporter_name || undefined,
  issueDescription: db.issue_description,
  status: db.status,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const dbBookingToBooking = (db: DatabaseBooking): Booking => ({
  id: db.id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone,
  bookingType: db.booking_type,
  roomId: db.room_id || undefined,
  roomNumber: db.room_number || undefined,
  cottageId: db.cottage_id || undefined,
  cottageNumber: db.cottage_number || undefined,
  checkInDate: db.check_in_date,
  checkOutDate: db.check_out_date,
  status: db.status,
  totalPrice: Number(db.total_price),
  numberOfGuests: db.number_of_guests,
  createdAt: db.created_at,
  paymentMethod: db.payment_method || undefined,
  paymentReference: db.payment_reference || undefined,
  paymentStatus: db.payment_status || undefined,
  transactionScreenshot: db.transaction_screenshot || undefined,
  checkInTime: db.checked_in_at || undefined,
  checkOutTime: db.checked_out_at || undefined,
  createdBy: (db.created_by as 'staff' | 'customer' | null) ?? null,
  assignedStaffId: (db as { assigned_staff_id?: string }).assigned_staff_id || undefined,
});

const dbEventBookingToEventBooking = (db: DatabaseEventBooking): EventBooking => ({
  id: db.id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone,
  eventType: db.event_type,
  eventName: db.event_name || undefined,
  eventDate: db.event_date,
  eventEndDate: db.event_end_date,
  status: db.status,
  basePrice: Number(db.base_price),
  totalPrice: Number(db.total_price),
  numberOfGuests: db.number_of_guests,
  serviceIds: db.service_ids,
  selectedRooms: db.selected_rooms,
  createdAt: db.created_at,
  paymentMethod: db.payment_method || undefined,
  paymentReference: db.payment_reference || undefined,
  paymentStatus: db.payment_status || undefined,
  transactionScreenshot: db.transaction_screenshot || undefined,
});

const dbStaffToStaff = (db: DatabaseStaffAccount): StaffAccount => ({
  id: db.id,
  firstName: db.first_name,
  middleInitial: db.middle_initial,
  lastName: db.last_name,
  email: db.email,
  phone: db.phone,
  position: db.position,
  status: db.status,
  joinDate: db.join_date,
  password: db.password_hash,
});

const dbCustomerToUser = (db: DatabaseCustomer): User & { password: string } => ({
  id: db.id,
  firstName: db.first_name,
  lastName: db.last_name,
  email: db.email,
  phone: db.phone || undefined,
  password: db.password_hash,
  role: 'customer',
  status: (db.status as 'active' | 'inactive') || 'active',
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',
    role: 'admin',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [adminPassword, setAdminPassword] = useState('admin123');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [eventRooms, setEventRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>([]);
  const [foodMenuItems, setFoodMenuItems] = useState<FoodMenuItem[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<(User & { password?: string })[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ gcashNumber: '', mayaNumber: '' });
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>({});
  const [eventTypePrices, setEventTypePrices] = useState<EventTypePrice[]>([
    { type: 'birthday', name: 'Birthday Party', description: 'Celebrate with us! Perfect for your special day', price: 5000 },
    { type: 'wedding', name: 'Wedding', description: 'Make your dream wedding a reality', price: 15000 },
    { type: 'normal', name: 'Normal Event', description: 'Corporate events, seminars, gatherings', price: 3000 },
  ]);
  const [eventTypeLoading, setEventTypeLoading] = useState(false);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [
          roomsData,
          servicesData,
          bookingsData,
          eventBookingsData,
          staffData,
          customersData,
          eventPricesData,
          paymentConfigData,
          appSettingsData,
          facilityBookingsData,
          foodMenuData,
          foodOrdersData,
          foodOrderItemsData,
          activityLogsData,
          maintenanceData,
          cottagesData
        ] = await Promise.all([
          supabase.from('rooms').select('*').order('room_number'),
          supabase.from('services').select('*').order('name'),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('event_bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('staff_accounts').select('*').order('created_at', { ascending: false }),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('event_type_prices').select('*'),
          supabase.from('payment_config').select('*').limit(1),
          supabase.from('app_settings').select('*').limit(1),
          supabase.from('facility_bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('food_menu_items').select('*').order('name'),
          supabase.from('food_orders').select('*').order('created_at', { ascending: false }),
          supabase.from('food_order_items').select('*'),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(500),
          supabase.from('maintenance_reports').select('*').order('created_at', { ascending: false }),
          supabase.from('cottages').select('*').order('cottage_number'),
        ]);

        // Set rooms
        if (roomsData.data) {
          setRooms(roomsData.data.map(dbRoomToRoom));
        }

        // Set services
        if (servicesData.data) {
          setServices(servicesData.data.map(dbServiceToService));
        }

        // Set cottages
        if (cottagesData.data) {
          setCottages(cottagesData.data.map((row) => dbCottageToCottage(row as DatabaseCottage)));
        }

        // Set facility bookings
        if (facilityBookingsData.data) {
          setFacilityBookings(facilityBookingsData.data.map((fb) => dbFacilityBookingToFacilityBooking(fb as DatabaseFacilityBooking)));
        }

        // Set food menu items
        if (foodMenuData.data) {
          setFoodMenuItems(foodMenuData.data.map((mi) => dbFoodMenuItemToFoodMenuItem(mi as DatabaseFoodMenuItem)));
        }

        // Set food orders (with items)
        if (foodOrdersData.data && foodOrderItemsData.data) {
          const orders = foodOrdersData.data.map((fo) => {
            const items = foodOrderItemsData.data.filter((item) => item.food_order_id === fo.id);
            return dbFoodOrderToFoodOrder(fo as DatabaseFoodOrder, items as DatabaseFoodOrderItem[]);
          });
          setFoodOrders(orders);
        }

        // Set activity logs
        if (activityLogsData.data) {
          setActivityLogs(activityLogsData.data.map((al) => dbActivityLogToActivityLog(al as DatabaseActivityLog)));
        }

        // Set maintenance reports
        if (maintenanceData.data) {
          setMaintenanceReports(maintenanceData.data.map((mr) => dbMaintenanceReportToMaintenanceReport(mr as DatabaseMaintenanceReport)));
        }

        // Set bookings
        if (bookingsData.data) {
          setBookings(bookingsData.data.map(dbBookingToBooking));
        }

        // Set event bookings
        if (eventBookingsData.data) {
          setEventBookings(eventBookingsData.data.map(dbEventBookingToEventBooking));
        }

        // Set staff accounts
        if (staffData.data) {
          setStaffAccounts(staffData.data.map(dbStaffToStaff));
        }

        // Set customers
        if (customersData.data) {
          setCustomerAccounts(customersData.data.map(dbCustomerToUser));
        }

        // Set event type prices
        if (eventPricesData.data && eventPricesData.data.length > 0) {
          setEventTypePrices(eventPricesData.data.map((p: DatabaseEventTypePrice) => ({
            type: p.event_type,
            name: p.name || p.event_type,
            description: p.description || '',
            price: Number(p.price),
            capacity: p.capacity || undefined,
          })));
        }

        // Set payment config
        if (paymentConfigData.data && paymentConfigData.data.length > 0) {
          const config = paymentConfigData.data[0] as DatabasePaymentConfig;
          setPaymentConfig({
            gcashNumber: config.gcash_number || '',
            mayaNumber: config.maya_number || '',
          });
        }

        // Set admin password and business info
        if (appSettingsData.data && appSettingsData.data.length > 0) {
          const settings = appSettingsData.data[0] as DatabaseAppSettings;
          setAdminPassword(settings.admin_password);
          setBusinessInfoState({
            adminName: settings.admin_name || undefined,
            ownerName: settings.owner_name || undefined,
            fbLink: settings.fb_link || undefined,
            businessPermitUrl: settings.business_permit_url || undefined,
            contactNumber: settings.contact_number || undefined,
            location: settings.location || undefined,
            checkInTime: settings.check_in_time || undefined,
            checkOutTime: settings.check_out_time || undefined,
            cancellationPolicy: settings.cancellation_policy || undefined,
            poolOperatingHours: settings.pool_operating_hours || undefined,
            functionHallImage: (settings as DatabaseAppSettings & { function_hall_image_url?: string }).function_hall_image_url || undefined,
          });
        }

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Realtime subscriptions: keep rooms, cottages, and services in sync
  // so the landing page reflects additions/edits from any session automatically.
  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    const roomsChannel = supabase
      .channel('rooms-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setRooms(prev => {
              if (prev.some(r => r.id === (payload.new as DatabaseRoom).id)) return prev;
              return [...prev, dbRoomToRoom(payload.new as DatabaseRoom)];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setRooms(prev => prev.map(r => r.id === (payload.new as DatabaseRoom).id ? dbRoomToRoom(payload.new as DatabaseRoom) : r));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setRooms(prev => prev.filter(r => r.id !== (payload.old as DatabaseRoom).id));
          }
        })
      .subscribe();
    channels.push(roomsChannel);

    const servicesChannel = supabase
      .channel('services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setServices(prev => {
              if (prev.some(s => s.id === (payload.new as DatabaseService).id)) return prev;
              return [...prev, dbServiceToService(payload.new as DatabaseService)];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setServices(prev => prev.map(s => s.id === (payload.new as DatabaseService).id ? dbServiceToService(payload.new as DatabaseService) : s));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setServices(prev => prev.filter(s => s.id !== (payload.old as DatabaseService).id));
          }
        })
      .subscribe();
    channels.push(servicesChannel);

    const cottagesChannel = supabase
      .channel('cottages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cottages' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setCottages(prev => {
              if (prev.some(c => c.id === (payload.new as DatabaseCottage).id)) return prev;
              return [...prev, dbCottageToCottage(payload.new as DatabaseCottage)];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setCottages(prev => prev.map(c => c.id === (payload.new as DatabaseCottage).id ? dbCottageToCottage(payload.new as DatabaseCottage) : c));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setCottages(prev => prev.filter(c => c.id !== (payload.old as DatabaseCottage).id));
          }
        })
      .subscribe();
    channels.push(cottagesChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  // Restore current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser({ id: '', name: '', email: '', role: 'customer' });
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userCredentials');
  };

  // Customer accounts
  const addCustomerAccount = async (user: User & { password: string }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          email: user.email,
          phone: user.phone || null,
          password_hash: user.password,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCustomer = dbCustomerToUser(data as DatabaseCustomer);
        setCustomerAccounts(prev => [...prev, newCustomer]);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  // Bookings
  const addBooking = async (booking: Booking) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          guest_name: booking.guestName,
          guest_email: booking.guestEmail,
          guest_phone: booking.guestPhone,
          booking_type: booking.bookingType,
          room_id: booking.roomId || null,
          room_number: booking.roomNumber || null,
          cottage_id: booking.cottageId || null,
          cottage_number: booking.cottageNumber || null,
          check_in_date: booking.checkInDate,
          check_out_date: booking.checkOutDate,
          status: booking.status,
          total_price: booking.totalPrice,
          number_of_guests: booking.numberOfGuests,
          payment_method: booking.paymentMethod || null,
          payment_reference: booking.paymentReference || null,
          payment_status: booking.paymentStatus || null,
          created_by: booking.createdBy || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBooking = dbBookingToBooking(data as DatabaseBooking);
        const next = [...bookings, newBooking];
        setBookings(prev => [...prev, newBooking]);

        // Update room status against the post-insert snapshot
        if (newBooking.roomId) {
          updateRoomStatus(newBooking.roomId, next);
        }
      }
    } catch (error) {
      console.error('Error adding booking:', error);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.transactionScreenshot !== undefined) dbUpdates.transaction_screenshot = updates.transactionScreenshot || null;
      if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId || null;
      if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber || null;
      if (updates.cottageId !== undefined) dbUpdates.cottage_id = updates.cottageId || null;
      if (updates.cottageNumber !== undefined) dbUpdates.cottage_number = updates.cottageNumber || null;
      if (updates.guestName) dbUpdates.guest_name = updates.guestName;
      if (updates.guestEmail) dbUpdates.guest_email = updates.guestEmail;
      if (updates.guestPhone) dbUpdates.guest_phone = updates.guestPhone;
      if (updates.checkInDate) dbUpdates.check_in_date = updates.checkInDate;
      if (updates.checkOutDate) dbUpdates.check_out_date = updates.checkOutDate;
      if (updates.numberOfGuests !== undefined) dbUpdates.number_of_guests = updates.numberOfGuests;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      if (updates.assignedStaffId !== undefined) dbUpdates.assigned_staff_id = updates.assignedStaffId || null;

      const { error } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      const updatedBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

      // Update room status against the post-update snapshot
      const booking = updatedBookings.find(b => b.id === id);
      if (booking?.roomId) {
        updateRoomStatus(booking.roomId, updatedBookings);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id);

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const remaining = bookings.filter(b => b.id !== id);
      setBookings(prev => prev.filter(b => b.id !== id));

      // Update room status against the post-delete snapshot
      if (booking?.roomId) {
        updateRoomStatus(booking.roomId, remaining);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  // Event Bookings
  const addEventBooking = async (booking: EventBooking) => {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .insert({
          guest_name: booking.guestName,
          guest_email: booking.guestEmail,
          guest_phone: booking.guestPhone,
          event_type: booking.eventType,
          event_name: booking.eventName || null,
          event_date: booking.eventDate,
          event_end_date: booking.eventEndDate,
          status: booking.status,
          base_price: booking.basePrice,
          total_price: booking.totalPrice,
          number_of_guests: booking.numberOfGuests,
          service_ids: booking.serviceIds,
          selected_rooms: booking.selectedRooms,
          payment_method: booking.paymentMethod || null,
          payment_reference: booking.paymentReference || null,
          payment_status: booking.paymentStatus || null,
          transaction_screenshot: booking.transactionScreenshot || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newBooking = dbEventBookingToEventBooking(data as DatabaseEventBooking);
        setEventBookings(prev => [...prev, newBooking]);
      }
    } catch (error) {
      console.error('Error adding event booking:', error);
    }
  };

  const updateEventBooking = async (id: string, updates: Partial<EventBooking>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.transactionScreenshot !== undefined) dbUpdates.transaction_screenshot = updates.transactionScreenshot || null;

      const { error } = await supabase
        .from('event_bookings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setEventBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating event booking:', error);
    }
  };

  const deleteEventBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEventBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting event booking:', error);
    }
  };

  // Rooms
  const addRoom = async (room: Room) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_number: room.roomNumber,
          type: room.type,
          price_per_night: room.pricePerNight,
          capacity: room.capacity,
          amenities: room.amenities,
          status: room.status,
          image_url: room.image || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newRoom = dbRoomToRoom(data as DatabaseRoom);
        setRooms(prev => [...prev, newRoom]);
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.roomNumber) dbUpdates.room_number = updates.roomNumber;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.amenities) dbUpdates.amenities = updates.amenities;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;

      const { error } = await supabase
        .from('rooms')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Cottages
  const addCottage = async (cottage: Cottage) => {
    try {
      const { data, error } = await supabase
        .from('cottages')
        .insert({
          cottage_number: cottage.cottageNumber,
          name: cottage.name,
          description: cottage.description || null,
          price_per_night: cottage.pricePerNight,
          capacity: cottage.capacity,
          status: cottage.status,
          image_url: cottage.image || null,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        const newCottage = dbCottageToCottage(data as DatabaseCottage);
        setCottages(prev => [...prev, newCottage]);
      }
    } catch (error) {
      console.error('Error adding cottage:', error);
      throw error;
    }
  };

  const updateCottage = async (id: string, updates: Partial<Cottage>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.cottageNumber) dbUpdates.cottage_number = updates.cottageNumber;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image || null;
      const { error } = await supabase.from('cottages').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setCottages(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error('Error updating cottage:', error);
      throw error;
    }
  };

  const deleteCottage = async (id: string) => {
    try {
      const { error } = await supabase.from('cottages').delete().eq('id', id);
      if (error) throw error;
      setCottages(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting cottage:', error);
      throw error;
    }
  };

  // Helper to update room status based on bookings. Accepts an explicit
  // bookings snapshot so callers can pass the post-update state and avoid
  // reading a stale closure value.
  const updateRoomStatus = async (roomId: string, snapshot?: Booking[]) => {
    const source = snapshot ?? bookings;
    const roomBookings = source.filter(
      b => b.roomId === roomId && ['pending', 'confirmed', 'checked-in'].includes(b.status)
    );

    let newStatus: 'available' | 'reserved' | 'occupied' = 'available';

    if (roomBookings.some(b => b.status === 'checked-in')) {
      newStatus = 'occupied';
    } else if (roomBookings.length > 0) {
      newStatus = 'reserved';
    }

    await updateRoom(roomId, { status: newStatus });
  };

  // Facility Bookings
  const addFacilityBooking = async (booking: FacilityBooking) => {
    try {
      const { data, error } = await supabase.from('facility_bookings').insert({
        facility_type: booking.facilityType,
        facility_id: booking.facilityId || null,
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone || null,
        booking_date: booking.bookingDate,
        start_time: booking.startTime || null,
        end_time: booking.endTime || null,
        number_of_guests: booking.numberOfGuests,
        status: booking.status,
        total_price: booking.totalPrice,
        payment_method: booking.paymentMethod || null,
        payment_reference: booking.paymentReference || null,
        payment_status: booking.paymentStatus || null,
        transaction_screenshot: booking.transactionScreenshot || null,
      }).select().single();
      if (error) throw error;
      if (data) {
        const newBooking = dbFacilityBookingToFacilityBooking(data as DatabaseFacilityBooking);
        setFacilityBookings(prev => [newBooking, ...prev]);
      }
    } catch (error) {
      console.error('Error adding facility booking:', error);
    }
  };

  const updateFacilityBooking = async (id: string, updates: Partial<FacilityBooking>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.transactionScreenshot !== undefined) dbUpdates.transaction_screenshot = updates.transactionScreenshot || null;
      if (updates.numberOfGuests !== undefined) dbUpdates.number_of_guests = updates.numberOfGuests;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      const { error } = await supabase.from('facility_bookings').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setFacilityBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating facility booking:', error);
    }
  };

  const deleteFacilityBooking = async (id: string) => {
    try {
      const { error } = await supabase.from('facility_bookings').delete().eq('id', id);
      if (error) throw error;
      setFacilityBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting facility booking:', error);
    }
  };

  // Food Menu Items
  const addFoodMenuItem = async (item: FoodMenuItem) => {
    try {
      const { data, error } = await supabase.from('food_menu_items').insert({
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        available: item.available,
        status: item.status || (item.available ? 'available' : 'unavailable'),
        image_url: item.image || null,
        package_items: item.packageItems ? JSON.stringify(item.packageItems) : null,
      }).select().single();
      if (error) throw error;
      if (data) {
        const newItem = dbFoodMenuItemToFoodMenuItem(data as DatabaseFoodMenuItem);
        setFoodMenuItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Error adding food menu item:', error);
    }
  };

  const updateFoodMenuItem = async (id: string, updates: Partial<FoodMenuItem>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.available !== undefined) dbUpdates.available = updates.available;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image || null;
      if (updates.packageItems !== undefined) dbUpdates.package_items = updates.packageItems ? JSON.stringify(updates.packageItems) : null;
      const { error } = await supabase.from('food_menu_items').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setFoodMenuItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    } catch (error) {
      console.error('Error updating food menu item:', error);
    }
  };

  const deleteFoodMenuItem = async (id: string) => {
    try {
      const { error } = await supabase.from('food_menu_items').delete().eq('id', id);
      if (error) throw error;
      setFoodMenuItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting food menu item:', error);
    }
  };

  // Food Orders
  const addFoodOrder = async (order: FoodOrder) => {
    try {
      const { data, error } = await supabase.from('food_orders').insert({
        booking_id: order.bookingId || null,
        event_booking_id: order.eventBookingId || null,
        customer_name: order.customerName,
        status: order.status,
        total_price: order.totalPrice,
        notes: order.notes || null,
      }).select().single();
      if (error) throw error;
      if (data) {
        const orderId = data.id;
        if (order.items.length > 0) {
          await supabase.from('food_order_items').insert(
            order.items.map(item => ({
              food_order_id: orderId,
              menu_item_id: item.menuItemId || null,
              menu_item_name: item.menuItemName,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              subtotal: item.subtotal,
            }))
          );
        }
        const newOrder: FoodOrder = {
          ...order,
          id: orderId,
          createdAt: data.created_at,
        };
        setFoodOrders(prev => [newOrder, ...prev]);
      }
    } catch (error) {
      console.error('Error adding food order:', error);
    }
  };

  const updateFoodOrder = async (id: string, updates: Partial<FoodOrder>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      const { error } = await supabase.from('food_orders').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setFoodOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    } catch (error) {
      console.error('Error updating food order:', error);
    }
  };

  const deleteFoodOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('food_orders').delete().eq('id', id);
      if (error) throw error;
      setFoodOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting food order:', error);
    }
  };

  // Maintenance Reports
  const addMaintenanceReport = async (report: MaintenanceReport) => {
    try {
      const { data, error } = await supabase.from('maintenance_reports').insert({
        item_type: report.itemType,
        item_id: report.itemId || null,
        item_name: report.itemName,
        reported_by: report.reportedBy || null,
        reporter_name: report.reporterName || null,
        issue_description: report.issueDescription,
        status: report.status,
      }).select().single();
      if (error) throw error;
      if (data) {
        const newReport = dbMaintenanceReportToMaintenanceReport(data as DatabaseMaintenanceReport);
        setMaintenanceReports(prev => [newReport, ...prev]);
      }
    } catch (error) {
      console.error('Error adding maintenance report:', error);
    }
  };

  const updateMaintenanceReport = async (id: string, updates: Partial<MaintenanceReport>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) dbUpdates.status = updates.status;
      const { error } = await supabase.from('maintenance_reports').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setMaintenanceReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (error) {
      console.error('Error updating maintenance report:', error);
    }
  };

  const deleteMaintenanceReport = async (id: string) => {
    try {
      const { error } = await supabase.from('maintenance_reports').delete().eq('id', id);
      if (error) throw error;
      setMaintenanceReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting maintenance report:', error);
    }
  };

  // Activity Logging
  const logActivity = useCallback(async (action: string, entityType?: string, entityId?: string, details?: string) => {
    try {
      const user = currentUser;
      const { data, error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        user_role: user.role,
        action,
        entity_type: entityType || null,
        entity_id: entityId || null,
        details: details || null,
      }).select().single();
      if (error) throw error;
      if (data) {
        const newLog = dbActivityLogToActivityLog(data as DatabaseActivityLog);
        setActivityLogs(prev => [newLog, ...prev]);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [currentUser]);

  // Services
  const addService = async (service: Service) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          category: service.category,
          description: service.description,
          price: service.price,
          capacity: service.capacity || null,
          available: service.available,
          status: service.status || (service.available ? 'available' : 'unavailable'),
          image_url: service.image || null,
          duration_hours: service.durationHours || null,
          operating_hours: service.operatingHours || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newService = dbServiceToService(data as DatabaseService);
        setServices(prev => [...prev, newService]);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.available !== undefined) dbUpdates.available = updates.available;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image || null;
      if (updates.durationHours !== undefined) dbUpdates.duration_hours = updates.durationHours || null;
      if (updates.operatingHours !== undefined) dbUpdates.operating_hours = updates.operatingHours || null;

      const { error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Staff Accounts
  const addStaffAccount = async (staffAccount: StaffAccount) => {
    try {
      const { data, error } = await supabase
        .from('staff_accounts')
        .insert({
          first_name: staffAccount.firstName,
          middle_initial: staffAccount.middleInitial || null,
          last_name: staffAccount.lastName,
          email: staffAccount.email,
          phone: staffAccount.phone,
          position: staffAccount.position,
          status: staffAccount.status,
          join_date: staffAccount.joinDate,
          password_hash: staffAccount.password || '',
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newStaff = dbStaffToStaff(data as DatabaseStaffAccount);
        setStaffAccounts(prev => [...prev, newStaff]);
      }
    } catch (error) {
      console.error('Error adding staff account:', error);
    }
  };

  const updateStaffAccount = async (id: string, updates: Partial<StaffAccount>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if ('middleInitial' in updates) dbUpdates.middle_initial = updates.middleInitial || null;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.password) dbUpdates.password_hash = updates.password;

      const { error } = await supabase
        .from('staff_accounts')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setStaffAccounts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating staff account:', error);
    }
  };

  const deleteStaffAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStaffAccounts(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting staff account:', error);
    }
  };

  // Payment methods
  const recordPayment = async (bookingId: string, method: PaymentMethod, _amount: number, reference?: string, screenshot?: string) => {
    await updateBooking(bookingId, {
      paymentMethod: method,
      paymentReference: reference,
      transactionScreenshot: screenshot,
      paymentStatus: method === 'counter' ? 'completed' : 'pending',
      status: method === 'counter' ? 'confirmed' : 'pending',
    });
  };

  const recordEventPayment = async (eventId: string, method: PaymentMethod, _amount: number, reference?: string, screenshot?: string) => {
    await updateEventBooking(eventId, {
      paymentMethod: method,
      paymentReference: reference,
      transactionScreenshot: screenshot,
      paymentStatus: method === 'counter' ? 'completed' : 'pending',
    });
  };

  const recordFacilityPayment = async (facilityBookingId: string, method: PaymentMethod, _amount: number, reference?: string, screenshot?: string) => {
    await updateFacilityBooking(facilityBookingId, {
      paymentMethod: method,
      paymentReference: reference,
      transactionScreenshot: screenshot,
      paymentStatus: method === 'counter' ? 'completed' : 'pending',
    });
  };

  // Admin password
  const changeAdminPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ admin_password: newPassword })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

      if (error) throw error;

      setAdminPassword(newPassword);
    } catch (error) {
      console.error('Error changing admin password:', error);
    }
  };

  const changeStaffPassword = async (staffId: string, newPassword: string) => {
    await updateStaffAccount(staffId, { password: newPassword });
  };

  const changeCustomerPassword = async (customerId: string, newPassword: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ password_hash: newPassword })
        .eq('id', customerId);

      if (error) throw error;

      setCustomerAccounts(prev => prev.map(c => c.id === customerId ? { ...c, password: newPassword } : c));
    } catch (error) {
      console.error('Error changing customer password:', error);
    }
  };

  const updateCustomerStatus = async (customerId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status })
        .eq('id', customerId);

      if (error) throw error;

      setCustomerAccounts(prev => prev.map(c => c.id === customerId ? { ...c, status } : c));
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const updateAdminProfile = async (name: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ admin_name: name })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      const updatedUser = { ...currentUser, name, firstName: name };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating admin profile:', error);
    }
  };

  // Event type prices
  const handleSetEventTypePrice = async (type: string, price: number) => {
    try {
      const { error } = await supabase
        .from('event_type_prices')
        .update({ price })
        .eq('event_type', type);

      if (error) throw error;

      setEventTypePrices(prev => prev.map(p => p.type === type ? { ...p, price } : p));
    } catch (error) {
      console.error('Error setting event type price:', error);
    }
  };

  const handleAddEventType = async (type: string, name: string, description: string, price: number, capacity?: number) => {
    setEventTypeLoading(true);
    try {
      const slug = type.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const { error } = await supabase
        .from('event_type_prices')
        .insert({ event_type: slug, name, description, price, capacity: capacity || null });

      if (error) throw error;

      setEventTypePrices(prev => [...prev, { type: slug, name, description, price, capacity: capacity || undefined }]);
    } catch (error) {
      console.error('Error adding event type:', error);
      throw error;
    } finally {
      setEventTypeLoading(false);
    }
  };

  const handleUpdateEventType = async (type: string, name: string, description: string, price: number, capacity?: number) => {
    try {
      const { error } = await supabase
        .from('event_type_prices')
        .update({ name, description, price, capacity: capacity || null })
        .eq('event_type', type);

      if (error) throw error;

      setEventTypePrices(prev => prev.map(p => p.type === type ? { ...p, name, description, price, capacity: capacity || undefined } : p));
    } catch (error) {
      console.error('Error updating event type:', error);
      throw error;
    }
  };

  const handleDeleteEventType = async (type: string) => {
    try {
      const { error } = await supabase
        .from('event_type_prices')
        .delete()
        .eq('event_type', type);

      if (error) throw error;

      setEventTypePrices(prev => prev.filter(p => p.type !== type));
    } catch (error) {
      console.error('Error deleting event type:', error);
      throw error;
    }
  };

  // Business info
  const handleSetBusinessInfo = async (info: BusinessInfo) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          admin_name: info.adminName || null,
          owner_name: info.ownerName || null,
          fb_link: info.fbLink || null,
          business_permit_url: info.businessPermitUrl || null,
          contact_number: info.contactNumber || null,
          location: info.location || null,
          check_in_time: info.checkInTime || null,
          check_out_time: info.checkOutTime || null,
          cancellation_policy: info.cancellationPolicy || null,
          pool_operating_hours: info.poolOperatingHours || null,
          function_hall_image_url: info.functionHallImage || null,
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setBusinessInfoState(info);
    } catch (error) {
      console.error('Error saving business info:', error);
      throw error;
    }
  };

  // Payment config
  const handleSetPaymentConfig = async (config: PaymentConfig) => {
    try {
      const { error } = await supabase
        .from('payment_config')
        .update({
          gcash_number: config.gcashNumber || null,
          maya_number: config.mayaNumber || null,
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setPaymentConfig(config);
    } catch (error) {
      console.error('Error setting payment config:', error);
    }
  };

  // Metrics
  const getMetrics = useCallback((): DashboardMetrics => {
    const today = new Date().toISOString().split('T')[0];
    const todaysBookings = bookings.filter(
      (b) => b.checkInDate === today || (b.checkInDate <= today && b.checkOutDate >= today)
    ).length;

    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const checkedInGuests = bookings.filter((b) => b.status === 'checked-in').length;
    const pendingPayments = bookings.filter((b) => b.status === 'pending').length;
    const monthlyRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const occupancyRate = rooms.length > 0 ? ((rooms.length - availableRooms) / rooms.length) * 100 : 0;

    return {
      todaysBookings,
      availableRooms,
      checkedInGuests,
      pendingPayments,
      monthlyRevenue,
      occupancyRate: Math.round(occupancyRate),
    };
  }, [bookings, rooms]);

  const value: BookingContextType = {
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    logout,
    isAuthenticated,
    bookings,
    eventBookings,
    rooms,
    eventRooms,
    services,
    cottages,
    facilityBookings,
    foodMenuItems,
    foodOrders,
    activityLogs,
    maintenanceReports,
    eventTypePrices,
    staffAccounts,
    customerAccounts,
    addCustomerAccount,
    paymentConfig,
    setPaymentConfig: handleSetPaymentConfig,
    businessInfo,
    setBusinessInfo: handleSetBusinessInfo,
    addBooking,
    updateBooking,
    deleteBooking,
    recordPayment,
    recordEventPayment,
    recordFacilityPayment,
    addEventBooking,
    updateEventBooking,
    deleteEventBooking,
    addRoom,
    updateRoom,
    deleteRoom,
    addCottage,
    updateCottage,
    deleteCottage,
    addService,
    updateService,
    deleteService,
    addFacilityBooking,
    updateFacilityBooking,
    deleteFacilityBooking,
    addFoodMenuItem,
    updateFoodMenuItem,
    deleteFoodMenuItem,
    addFoodOrder,
    updateFoodOrder,
    deleteFoodOrder,
    addMaintenanceReport,
    updateMaintenanceReport,
    deleteMaintenanceReport,
    logActivity,
    setEventTypePrice: handleSetEventTypePrice,
    addEventType: handleAddEventType,
    updateEventType: handleUpdateEventType,
    deleteEventType: handleDeleteEventType,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    changeAdminPassword,
    changeStaffPassword,
    changeCustomerPassword,
    updateCustomerStatus,
    updateAdminProfile,
    adminPassword,
    getMetrics,
    isLoading,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
