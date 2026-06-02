"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Users, Settings, Plus, Wrench, ShieldAlert, Check, RefreshCw, AlertCircle, Search, Edit3, Trash2, ShieldCheck, BatteryCharging, Bolt, LogOut } from "lucide-react";
import Link from "next/link";
import LayoutShell from "../../components/shared/LayoutShell";
import { useAuthStore } from "../../store/authStore";
import { ProductService, OrderService } from "../../services/api";
import { MOCK_PRODUCTS, MOCK_ORDERS } from "../../lib/mockData";
import { Product, Order, OrderStatus } from "../../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { user, login, logout } = useAuthStore();

  // Tab State: "overview" | "inventory" | "orders" | "products" | "customers"
  const [activeTab, setActiveTab] = useState("overview");
  
  // Dashboard entity states
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Search queries
  const [inventorySearch, setInventorySearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Product Form states (Add/Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "panels",
    price: 350000,
    installationFee: 50000,
    description: "",
    stock: 20,
    sku: "",
    warranty: "25-Year Performance",
    specifications: "" // String input split by comma
  });

  // Load Admin Data
  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const prods = await ProductService.getAll();
      const ords = await OrderService.getAll();
      setProductsList([...prods]);
      setOrdersList([...ords]);
    }
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI calculations
  const totalRevenue = ordersList
    .filter(o => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + o.grandTotal, 0);

  const lowStockProducts = productsList.filter(p => p.stock < 15);
  const lowStockCount = lowStockProducts.length;

  // Chart data format
  const chartData = [
    { name: "Mon", Sales: 1200000 },
    { name: "Tue", Sales: 2400000 },
    { name: "Wed", Sales: 1800000 },
    { name: "Thu", Sales: 4200000 },
    { name: "Fri", Sales: 6800000 },
    { name: "Sat", Sales: 3100000 },
    { name: "Sun", Sales: 1500000 }
  ];

  // Restock action
  const handleRestock = async (id: string) => {
    const success = await ProductService.updateStock(id, 25);
    if (success) {
      const updated = await ProductService.getAll();
      setProductsList([...updated]);
      triggerToast("Inventory replenished: +25 Units");
    }
  };

  // Order status update
  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus) => {
    const updatedOrder = await OrderService.updateStatus(orderId, status);
    if (updatedOrder) {
      const updated = await OrderService.getAll();
      setOrdersList([...updated]);
      triggerToast(`Order status updated to: ${status}`);
    }
  };

  // Product Add / Edit Submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsArray = productForm.specifications
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const slug = productForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newSku = productForm.sku || `SSO-${productForm.category.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const mockImg = productForm.category === "panels"
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAmXCg-8spqoWGWowxUWQ1_5JBYVhMBsKuCetFNHk5nhYspu65qPrRcmNaMKTshU8G51UP7R3oiK1KXYcJueXkmHxl_9lFJo1xw8RnZdtG9wp5aI1zTW9Ju71jqMGmAEe80WmPeJSEdQIvRIVnIrPMHACf9ktJzPcu2m1RpaRh5f8__OK3g-wQNvKRZxRALKmImB2kpz0eDMIN_TkYG-Rg_CshCTzfCyDIl_1ZQIic5xCxrWmkF7t38uJV4hD9lSIXQA7CTTsZKURY"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuBtf4q27e2QDTSAiH8CJY8wxTK46Gvl2hecKvPMkett7-5mFK82ERs_zvF9H1qY-7J14Gai4sTR497NJ96RBFwXTrk_HAuQwAqug-5hPArygqGKbvsTSqBsrJ-2mBXDocz-Zl0PMd_Hhy020jCjbfZljqM_ffIjZTH9BcdiaGGGH1OeO1iUgOjRnarxbQjdWBo9JCf-7zD3AS1T4F2TahZ-a8mQqkxGp3H-oFYmHcN9XMKBL1oq7uQdEXOsD2TBBrnM31XxOJLPKNs";

    if (editingProductId) {
      // Edit
      await ProductService.update(editingProductId, {
        name: productForm.name,
        category: productForm.category,
        price: productForm.price,
        installationFee: productForm.installationFee,
        description: productForm.description,
        stock: productForm.stock,
        sku: newSku,
        warranty: productForm.warranty,
        specifications: specsArray
      });
      triggerToast("Infrastructure specs modified");
    } else {
      // Create
      await ProductService.create({
        name: productForm.name,
        slug,
        category: productForm.category,
        price: productForm.price,
        installationFee: productForm.installationFee,
        description: productForm.description,
        images: [mockImg],
        specifications: specsArray,
        stock: productForm.stock,
        sku: newSku,
        warranty: productForm.warranty,
        featured: false
      });
      triggerToast("New hardware added to E-commerce catalog");
    }

    const updatedProds = await ProductService.getAll();
    setProductsList([...updatedProds]);
    setShowProductModal(false);
    setEditingProductId(null);
    setProductForm({
      name: "",
      category: "panels",
      price: 350000,
      installationFee: 50000,
      description: "",
      stock: 20,
      sku: "",
      warranty: "25-Year Performance",
      specifications: ""
    });
  };

  const handleEditClick = (product: Product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      installationFee: product.installationFee || 0,
      description: product.description,
      stock: product.stock,
      sku: product.sku,
      warranty: product.warranty,
      specifications: product.specifications.join(", ")
    });
    setEditingProductId(product.id);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await ProductService.delete(id);
    if (success) {
      const updated = await ProductService.getAll();
      setProductsList([...updated]);
      triggerToast("Product removed from catalog");
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(val);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-eco-emerald border-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-200";
      case "PROCESSING":
      case "PAID":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-amber-50 text-sunlight-amber border-amber-200";
    }
  };

  // Lock panel if role check fails
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "INVENTORY_MANAGER";
  if (!user || !isAdmin) {
    return (
      <LayoutShell>
        <div className="py-24 text-center space-y-5 max-w-md mx-auto px-4">
          <ShieldAlert className="w-12 h-12 text-primary mx-auto animate-bounce" />
          <h2 className="font-headline text-2xl font-black text-deep-obsidian">Administrative Access Locked</h2>
          <p className="text-sm text-text-slate">
            You do not possess security clearance credentials for the administrative catalog panel.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={async () => {
                await login("SUPER_ADMIN");
                triggerToast("Signed in as Super Admin");
              }}
              className="px-6 py-3 bg-deep-obsidian hover:bg-black text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Sign In as Admin
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-stroke-soft bg-white text-deep-obsidian hover:bg-slate-surface font-bold rounded-xl text-xs transition-colors"
            >
              Go to Storefront
            </Link>
          </div>
        </div>
      </LayoutShell>
    );
  }

  // Filter lists based on search
  const filteredInventory = productsList.filter(p =>
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const filteredOrders = ordersList.filter(o =>
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-deep-obsidian flex flex-col py-8 shadow-xl z-50 justify-between">
        <div className="space-y-8">
          <div className="px-6 space-y-1">
            <img
              src="/logo.png"
              alt="SolarShopoffice Ltd"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="font-label-caps text-[9px] text-slate-400 tracking-widest uppercase block">
              Enterprise Control
            </span>
          </div>

          <nav className="space-y-1">
            {[
              { name: "Overview Network", id: "overview", icon: LayoutDashboard },
              { name: "Inventory Stock", id: "inventory", icon: Package },
              { name: "Orders Control", id: "orders", icon: ShoppingBag },
              { name: "Customers", id: "customers", icon: Users },
              { name: "System Settings", id: "settings", icon: Settings }
            ].map(tab => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3.5 text-xs font-bold transition-all text-left cursor-pointer ${
                    active
                      ? "bg-slate-800 text-white border-r-4 border-sunlight-amber"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <TabIcon className="w-4.5 h-4.5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-4 space-y-6">
          <button
            onClick={() => {
              setEditingProductId(null);
              setShowProductModal(true);
            }}
            className="w-full bg-sunlight-amber hover:bg-amber-500 text-deep-obsidian font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow transition-all active:scale-[0.98] cursor-pointer text-xs"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3px]" />
            Add New Product
          </button>

          <div className="flex items-center gap-3 border-t border-slate-800 pt-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-white text-xs font-bold truncate max-w-[120px]">{user.fullName}</p>
                <Link href="/" className="text-[10px] text-primary hover:underline font-semibold block mt-0.5">
                  Back to Storefront
                </Link>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="p-2 text-text-slate hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 md:p-12 bg-slate-surface">
        {/* Header grid metrics */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h1 className="font-headline text-3xl font-extrabold text-deep-obsidian capitalize">
              {activeTab} Operations
            </h1>
            <p className="text-sm text-text-slate mt-1">
              Monitoring grids, stock thresholds, and logistics dispatches.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white border border-stroke-soft px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm text-xs font-semibold text-text-slate">
              <Bolt className="w-4.5 h-4.5 text-eco-emerald" />
              <div>
                <p className="text-[9px] font-black uppercase text-text-slate">Live Generation</p>
                <p className="font-mono text-deep-obsidian font-bold">142.8 GW</p>
              </div>
            </div>
            <div className="bg-white border border-stroke-soft px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm text-xs font-semibold text-text-slate">
              <BatteryCharging className="w-4.5 h-4.5 text-sunlight-amber" />
              <div>
                <p className="text-[9px] font-black uppercase text-text-slate">Storage Level</p>
                <p className="font-mono text-deep-obsidian font-bold">88% Capacity</p>
              </div>
            </div>
          </div>
        </header>

        {/* TAB 0: OVERVIEW NETWORK */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Total Revenue", val: formatPrice(totalRevenue), change: "+12.5%", color: "text-eco-emerald" },
                { name: "Total Orders", val: ordersList.length, change: "+8.2%", color: "text-eco-emerald" },
                { name: "Low Stock Items", val: lowStockCount, change: `${lowStockCount} warning`, color: lowStockCount > 0 ? "text-red-500" : "text-text-slate" },
                { name: "Registered Customers", val: "24", change: "+3 this week", color: "text-eco-emerald" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-stroke-soft shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-text-slate uppercase tracking-wider">{kpi.name}</p>
                    <span className={`text-[10px] font-black ${kpi.color}`}>{kpi.change}</span>
                  </div>
                  <h3 className="font-headline text-2xl font-black text-deep-obsidian">{kpi.val}</h3>
                </div>
              ))}
            </div>

            {/* Bento charts and warnings layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales trends graph */}
              <div className="lg:col-span-2 bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline text-base font-bold text-deep-obsidian">Sales Trends</h3>
                  <p className="text-xs text-text-slate">Weekly overview of solar hardware transactions.</p>
                </div>
                <div className="w-full h-80 pt-4">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₦${v/1000000}M`} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => formatPrice(Number(value))} contentStyle={{ background: "#0F172A", color: "#fff", borderRadius: "8px" }} />
                        <Bar dataKey="Sales" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-text-slate text-xs font-semibold rounded-xl border border-stroke-soft">
                      Loading Analytics...
                    </div>
                  )}
                </div>
              </div>

              {/* Low stock alerts panel */}
              <div className="bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-sm font-bold text-deep-obsidian">Inventory Alerts</h3>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 border border-red-200 rounded text-[9px] font-black uppercase">
                      {lowStockCount} ALERT
                    </span>
                  </div>
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 3).map((prod) => (
                      <div key={prod.id} className="flex gap-3 p-3 bg-slate-surface rounded-xl border border-stroke-soft items-center">
                        <img src={prod.images[0]} alt="alert" className="w-10 h-10 object-cover rounded bg-white" />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-deep-obsidian truncate">{prod.name}</p>
                          <p className="text-[10px] text-red-500 font-mono font-bold mt-0.5">Stock: {prod.stock} units</p>
                        </div>
                        <button
                          onClick={() => handleRestock(prod.id)}
                          className="p-1.5 hover:bg-white text-primary border border-transparent hover:border-stroke-soft rounded-lg cursor-pointer"
                          title="Restock +25"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="w-full mt-4 py-3 border border-stroke-soft hover:bg-slate-surface text-deep-obsidian rounded-xl text-xs font-bold block text-center"
                >
                  Manage All Stock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: INVENTORY CONTROL */}
        {activeTab === "inventory" && (
          <div className="bg-white border border-stroke-soft rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-stroke-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline text-base font-bold text-deep-obsidian">Inventory Management</h3>
                <p className="text-xs text-text-slate mt-0.5">CRUD items, upload specifications, and track stock levels.</p>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search by name or SKU..."
                  className="pl-9 pr-4 py-2 border border-stroke-soft rounded-lg text-xs w-64 focus:ring-1 focus:ring-sunlight-amber focus:border-sunlight-amber outline-none bg-slate-surface"
                />
              </div>
            </div>

            {/* Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-surface text-text-slate font-headline text-[10px] font-black uppercase tracking-wider border-b border-stroke-soft">
                  <tr>
                    <th className="px-6 py-4">Item SKU</th>
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft text-xs font-medium">
                  {filteredInventory.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-surface/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-text-slate">{prod.sku}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={prod.images[0]} alt="" className="w-8 h-8 object-cover rounded bg-slate-100" />
                          <span className="font-bold text-deep-obsidian truncate max-w-[200px] block">{prod.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">{prod.category}</td>
                      <td className="px-6 py-4 font-mono font-bold text-deep-obsidian">{formatPrice(prod.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            prod.stock < 15 ? "bg-red-500 animate-pulse" : "bg-eco-emerald"
                          }`} />
                          <span className={prod.stock < 15 ? "text-red-500 font-bold" : "text-deep-obsidian"}>
                            {prod.stock} units
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => handleRestock(prod.id)}
                          className="px-2.5 py-1.5 border border-stroke-soft bg-white hover:bg-slate-surface rounded-lg font-bold text-[10px] text-deep-obsidian cursor-pointer transition-colors"
                        >
                          Restock +25
                        </button>
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="p-1.5 hover:bg-slate-surface text-text-slate hover:text-primary rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 hover:bg-red-50 text-text-slate hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS CONTROL */}
        {activeTab === "orders" && (
          <div className="bg-white border border-stroke-soft rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-stroke-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline text-base font-bold text-deep-obsidian">Order Fulfillment Dashboard</h3>
                <p className="text-xs text-text-slate mt-0.5">Control fulfillment stages, update payments, and check dispatches.</p>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order #, payment..."
                  className="pl-9 pr-4 py-2 border border-stroke-soft rounded-lg text-xs w-64 focus:ring-1 focus:ring-sunlight-amber focus:border-sunlight-amber outline-none bg-slate-surface"
                />
              </div>
            </div>

            {/* Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-surface text-text-slate font-headline text-[10px] font-black uppercase tracking-wider border-b border-stroke-soft">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Fulfillment Details</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Fulfillment Status</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft text-xs font-medium">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-surface/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-deep-obsidian">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-deep-obsidian">Date: {order.date}</p>
                          <p className="text-[10px] text-text-slate leading-relaxed">
                            {order.items.map((i, idx) => (
                              <span key={idx} className="block">{i.quantity}x {i.name}</span>
                            ))}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{order.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as OrderStatus)}
                          className={`border border-stroke-soft rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider focus:ring-0 outline-none cursor-pointer ${
                            getStatusColor(order.status)
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-deep-obsidian">{formatPrice(order.grandTotal)}</td>
                      <td className="px-6 py-4 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => triggerToast(`Fulfillment log logged for ${order.orderNumber}`)}
                          className="px-3 py-1.5 bg-slate-surface border border-stroke-soft hover:border-deep-obsidian rounded-lg font-bold text-[10px] text-deep-obsidian cursor-pointer transition-colors"
                        >
                          Fulfillment log
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="bg-white border border-stroke-soft rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-stroke-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline text-base font-bold text-deep-obsidian">Customer Management</h3>
                <p className="text-xs text-text-slate mt-0.5">Manage registered accounts, permissions, and roles.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-surface text-text-slate font-headline text-[10px] font-black uppercase tracking-wider border-b border-stroke-soft">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-soft text-xs font-medium">
                  <tr className="hover:bg-slate-surface/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-deep-obsidian">Adebayo Kolawole</td>
                    <td className="px-6 py-4">kola@solarshopoffice.com</td>
                    <td className="px-6 py-4">+234 803 123 4567</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black tracking-wider uppercase">Customer</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 border border-stroke-soft bg-white hover:bg-slate-surface rounded-lg font-bold text-[10px] text-deep-obsidian cursor-pointer">Edit Role</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-surface/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-deep-obsidian">Chidi Okafor</td>
                    <td className="px-6 py-4">admin@solarshopoffice.com</td>
                    <td className="px-6 py-4">+234 809 999 8888</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-eco-emerald rounded-md text-[10px] font-black tracking-wider uppercase">Super Admin</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 border border-stroke-soft bg-white hover:bg-slate-surface rounded-lg font-bold text-[10px] text-deep-obsidian cursor-pointer">Edit Role</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white border border-stroke-soft rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-stroke-soft">
              <h3 className="font-headline text-base font-bold text-deep-obsidian">System Configuration</h3>
              <p className="text-xs text-text-slate mt-0.5">Adjust VAT, global shipping logic, and site constants.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-slate">Default VAT Rate (%)</label>
                  <input type="number" defaultValue={7.5} className="w-full border border-stroke-soft rounded-lg h-10 px-3 text-sm focus:ring-1 focus:ring-sunlight-amber outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-slate">Standard Shipping Fee (NGN)</label>
                  <input type="number" defaultValue={75000} className="w-full border border-stroke-soft rounded-lg h-10 px-3 text-sm focus:ring-1 focus:ring-sunlight-amber outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-text-slate">Base Installation Fee (NGN)</label>
                  <input type="number" defaultValue={50000} className="w-full border border-stroke-soft rounded-lg h-10 px-3 text-sm focus:ring-1 focus:ring-sunlight-amber outline-none" />
                </div>
                <button className="px-6 py-2.5 bg-deep-obsidian text-white font-bold rounded-xl text-xs" onClick={() => triggerToast("System settings saved")}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal Overlay Dialog */}
      {showProductModal && (
        <div className="fixed inset-0 bg-deep-obsidian/50 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white border border-stroke-soft rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-stroke-soft flex justify-between items-center bg-slate-surface/50">
              <h3 className="font-headline text-base font-bold text-deep-obsidian">
                {editingProductId ? "Modify Product Specifications" : "Add Hardware to Catalog"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 hover:bg-slate-surface text-text-slate hover:text-deep-obsidian rounded-full cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold text-text-slate">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Tesla 400W Ultra-Efficiency Solar Panel"
                  required
                  className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                  >
                    <option value="panels">Solar Panels</option>
                    <option value="batteries">Battery Cabinets</option>
                    <option value="inverters">Phase Inverters</option>
                    <option value="chargers">EV Chargers</option>
                    <option value="mounting">Mounting Gear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Item SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="SSO-PAN-TS400"
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Base Price (₦)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Install Fee (₦)</label>
                  <input
                    type="number"
                    value={productForm.installationFee}
                    onChange={(e) => setProductForm({ ...productForm, installationFee: Number(e.target.value) })}
                    required
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    required
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Warranty details</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    placeholder="25-Year Output Warranty"
                    className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Enter dynamic e-commerce details description..."
                  rows={3}
                  className="w-full border border-stroke-soft rounded-lg p-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">
                  Technical Specifications (Comma-separated)
                </label>
                <input
                  type="text"
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  placeholder="Power Output: 400W, Efficiency: 22.8%, Cell Type: Monocrystalline"
                  className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-deep-obsidian text-white rounded-xl font-bold hover:bg-black transition-colors cursor-pointer"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-3.5 border border-stroke-soft bg-white text-text-slate rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
