import { Product, Order, UserProfile, PickupStation, OrderStatus } from "../types";
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_STATIONS, DEMO_USER } from "../lib/mockData";

// Simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ProductService = {
  async getAll(): Promise<Product[]> {
    await delay(300);
    return MOCK_PRODUCTS;
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    await delay(200);
    return MOCK_PRODUCTS.find((p) => p.slug === slug);
  },

  async getById(id: string): Promise<Product | undefined> {
    await delay(100);
    return MOCK_PRODUCTS.find((p) => p.id === id);
  },

  async updateStock(id: string, amount: number): Promise<boolean> {
    await delay(200);
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (product) {
      product.stock = Math.max(0, product.stock + amount);
      return true;
    }
    return false;
  },

  async create(product: Omit<Product, "id" | "rating" | "reviewsCount">): Promise<Product> {
    await delay(400);
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0
    };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    await delay(300);
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index !== -1) {
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updates };
      return MOCK_PRODUCTS[index];
    }
    return undefined;
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index !== -1) {
      MOCK_PRODUCTS.splice(index, 1);
      return true;
    }
    return false;
  }
};

export const OrderService = {
  async getAll(): Promise<Order[]> {
    await delay(400);
    return MOCK_ORDERS;
  },

  async getById(id: string): Promise<Order | undefined> {
    await delay(200);
    return MOCK_ORDERS.find((o) => o.id === id);
  },

  async create(order: Omit<Order, "id" | "orderNumber" | "date" | "status">): Promise<Order> {
    await delay(500);
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `SSO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING"
    };
    MOCK_ORDERS.unshift(newOrder);
    return newOrder;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    await delay(300);
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (order) {
      order.status = status;
      return order;
    }
    return undefined;
  },

  async cancelOrder(id: string): Promise<boolean> {
    await delay(300);
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (order && order.status === "PENDING") {
      order.status = "CANCELLED";
      return true;
    }
    return false;
  }
};

export const StationService = {
  async getAll(): Promise<PickupStation[]> {
    await delay(100);
    return MOCK_STATIONS;
  }
};

export const UserService = {
  async getProfile(): Promise<UserProfile> {
    await delay(200);
    return DEMO_USER;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay(300);
    Object.assign(DEMO_USER, updates);
    return DEMO_USER;
  }
};
