export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // e.g., 'panels', 'batteries', 'inverters', 'accessories'
  price: number;
  installationFee?: number;
  images: string[];
  specifications: string[]; // formatted as "Label: Value"
  stock: number;
  sku: string;
  warranty: string;
  rating: number;
  reviewsCount: number;
  featured: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
  installationSelected: boolean;
  pickupOption: boolean; // true = pickup, false = home delivery
  deliveryFee?: number;
  selectedVariant?: string;
};

export type UserRole = 'CUSTOMER' | 'SUPER_ADMIN' | 'SALES_ADMIN' | 'INVENTORY_MANAGER' | 'SUPPORT_STAFF';

export type Address = {
  id: string;
  label: string; // e.g., "Default Office"
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: Address[];
  deliveryNotes?: string;
};

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  installationSelected: boolean;
  pickupOption: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  installationTotal: number;
  shippingTotal: number;
  grandTotal: number;
  status: OrderStatus;
  shippingAddress?: Address;
  pickupStation?: string;
  pickupDate?: string;
  paymentMethod: string;
  installationScheduledDate?: string;
  installerNotes?: string;
};

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  operatingHours: string;
};
