"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Receipt, Heart, Settings, Power, HelpCircle, ShieldAlert, Check, Plus, Trash2, MapPin, Building, ShieldCheck, Mail, Phone, Calendar, FileText, ArrowRight, Eye, RefreshCw, XCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import LayoutShell from "../../components/shared/LayoutShell";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { OrderService } from "../../services/api";
import { MOCK_PRODUCTS } from "../../lib/mockData";
import { Order, OrderStatus } from "../../types";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";

  // Zustand State hooks
  const { user, logout, updateProfile, addAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const { addToCart } = useCartStore();
  const { items: wishlistIds, removeFromWishlist } = useWishlistStore();

  // Local dashboard states
  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile forms state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.fullName?.split(" ")[0] || "",
    lastName: user?.fullName?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    deliveryNotes: user?.deliveryNotes || ""
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Address modal/form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "Lagos State",
    zipCode: ""
  });

  // Sync tab from URL
  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "overview");
  }, [searchParams]);

  // Redirect admin users
  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      router.push("/admin");
    }
  }, [user, router]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const list = await OrderService.getAll();
        setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  // Sync profile details if auth store updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.fullName?.split(" ")[0] || "",
        lastName: user.fullName?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone: user.phone,
        deliveryNotes: user.deliveryNotes || ""
      });
    }
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    router.push(`/dashboard?tab=${tabName}`);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      await updateProfile({
        fullName: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        phone: profileForm.phone,
        deliveryNotes: profileForm.deliveryNotes
      });
      triggerToast("Profile details updated successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.fullName) return;
    addAddress({
      ...newAddress,
      isDefault: false
    });
    setNewAddress({
      label: "",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "Lagos State",
      zipCode: ""
    });
    setShowAddressForm(false);
    triggerToast("Saved new address to address book");
  };

  const handleCancelOrder = async (orderId: string) => {
    const success = await OrderService.cancelOrder(orderId);
    if (success) {
      const updated = await OrderService.getAll();
      setOrders(updated);
      triggerToast("Order cancelled successfully");
    } else {
      triggerToast("Only pending orders can be cancelled.");
    }
  };

  const handleMoveWishlistToCart = (productId: string, name: string) => {
    addToCart({
      productId,
      quantity: 1,
      installationSelected: false,
      pickupOption: false
    });
    removeFromWishlist(productId);
    triggerToast(`Moved ${name} to Shopping Cart`);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        quantity: item.quantity,
        installationSelected: item.installationSelected,
        pickupOption: item.pickupOption
      });
    });
    triggerToast("Order items added to Cart!");
    router.push("/cart");
  };

  // Status Badge styler
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

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(val);
  };

  // Wishlist item resolver
  const wishlistedItems = wishlistIds.map(id => {
    return MOCK_PRODUCTS.find(p => p.id === id);
  }).filter(p => p !== undefined);

  // If user is not logged in, redirect or display a clean gateway
  if (!user) {
    return (
      <LayoutShell>
        <div className="py-24 text-center space-y-4 max-w-md mx-auto px-4">
          <ShieldAlert className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-headline text-2xl font-bold text-deep-obsidian">Dashboard Locked</h2>
          <p className="text-sm text-text-slate">
            You must be logged in to inspect your order histories, saved address credentials, or track active systems.
          </p>
          <Link
            href="/login?redirect=/dashboard"
            className="inline-block px-8 py-3.5 bg-deep-obsidian hover:bg-black text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Sign In to Account
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      {/* Toast popup overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 max-w-container-max mx-auto w-full flex-col md:flex-row">
        {/* Sidebar sub-nav */}
        <aside className="w-full md:w-64 bg-slate-surface border-b md:border-b-0 md:border-r border-stroke-soft flex flex-col py-8 px-4 justify-start self-stretch shrink-0">
          <div className="space-y-6">
            <div className="px-2">
              <p className="text-xs text-text-slate font-bold uppercase tracking-wider">Welcome back,</p>
              <h3 className="font-headline text-lg font-bold text-deep-obsidian mt-0.5 truncate">{user.fullName}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-stroke-soft rounded-full text-[9px] font-black uppercase text-primary tracking-widest">
                {user.role}
              </span>
            </div>

            {/* Nav list links */}
            <nav className="space-y-1">
              {[
                { name: "Dashboard Overview", tab: "overview", icon: LayoutDashboard },
                { name: "Browse Catalog", href: "/shop", icon: ShoppingBag },
                { name: "Order History", tab: "orders", icon: Receipt },
                { name: "Wishlist", tab: "wishlist", icon: Heart },
                { name: "Profile & Addresses", tab: "profile", icon: Settings }
              ].map((t) => {
                const TabIcon = t.icon;
                const active = t.tab ? activeTab === t.tab : false;
                
                const baseClass = `w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  active
                    ? "bg-white text-primary border-r-4 border-sunlight-amber shadow-sm"
                    : "text-text-slate hover:bg-slate-200 hover:text-deep-obsidian"
                }`;

                if (t.href) {
                  return (
                    <Link key={t.name} href={t.href} className={baseClass}>
                      <TabIcon className="w-4.5 h-4.5" />
                      {t.name}
                    </Link>
                  );
                }

                return (
                  <button
                    key={t.tab}
                    onClick={() => handleTabChange(t.tab as string)}
                    className={baseClass}
                  >
                    <TabIcon className="w-4.5 h-4.5" />
                    {t.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-stroke-soft pt-4 mt-4 space-y-4">
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-text-slate hover:text-red-500 transition-colors py-2 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content body */}
        <main className="flex-grow p-4 sm:p-8 bg-slate-surface">
          {/* Header message */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold text-deep-obsidian">Hello, {user.fullName.split(" ")[0]}.</h1>
            <p className="text-sm text-text-slate mt-1">
              Your renewable energy systems and order dispatches are currently active.
            </p>
          </div>

          {/* TAB 0: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-stroke-soft shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-sunlight-amber flex items-center justify-center mb-4">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-text-slate uppercase tracking-wider">Active Orders</p>
                  <h3 className="font-headline text-2xl font-black text-deep-obsidian mt-1">
                    {orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stroke-soft shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                    <Heart className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-text-slate uppercase tracking-wider">Wishlist Items</p>
                  <h3 className="font-headline text-2xl font-black text-deep-obsidian mt-1">
                    {wishlistIds.length}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stroke-soft shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-eco-emerald flex items-center justify-center mb-4">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-text-slate uppercase tracking-wider">Completed Orders</p>
                  <h3 className="font-headline text-2xl font-black text-deep-obsidian mt-1">
                    {orders.filter(o => o.status === "DELIVERED").length}
                  </h3>
                </div>
              </div>

              {/* Bento layout summary split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent orders */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-headline text-base font-bold text-deep-obsidian">Recent Orders</h3>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      View All History
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div className="h-44 bg-white border border-stroke-soft rounded-2xl flex items-center justify-center text-xs text-text-slate">
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="h-44 bg-white border border-stroke-soft rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs font-bold text-deep-obsidian">No orders placed yet</p>
                      <Link href="/shop" className="text-xs text-primary hover:underline font-semibold mt-1">
                        Go to Catalog shop
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 2).map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border border-stroke-soft rounded-2xl p-5 shadow-sm hover:shadow transition-shadow space-y-4"
                        >
                          <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-xs text-deep-obsidian font-mono">{order.orderNumber}</p>
                              <p className="text-[10px] text-text-slate font-semibold mt-0.5">Placed: {order.date}</p>
                            </div>
                            <span className={`px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-wider ${
                              getStatusColor(order.status)
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-text-slate font-medium">
                                <span className="font-bold text-deep-obsidian">{item.quantity}x</span> {item.name}
                              </p>
                            ))}
                          </div>

                          <div className="flex justify-between items-center border-t border-stroke-soft pt-3 text-xs">
                            <span className="font-black text-deep-obsidian">{formatPrice(order.grandTotal)}</span>
                            <button
                              onClick={() => handleReorder(order)}
                              className="text-primary hover:underline font-bold cursor-pointer"
                            >
                              Reorder items
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar details summary (Carbon & Default address) */}
                <div className="space-y-6">


                  {/* Saved addresses brief widget */}
                  <div className="bg-white border border-stroke-soft p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-headline text-xs font-bold text-deep-obsidian uppercase tracking-wider">
                        Default Address
                      </h4>
                      <button
                        onClick={() => handleTabChange("profile")}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Edit Book
                      </button>
                    </div>

                    {user.addresses.length === 0 ? (
                      <p className="text-xs text-text-slate">No saved addresses.</p>
                    ) : (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-text-slate shrink-0 mt-0.5" />
                        <div className="text-xs leading-normal">
                          <p className="font-bold text-deep-obsidian">
                            {user.addresses.find(a => a.isDefault)?.fullName || user.fullName}
                          </p>
                          <p className="text-text-slate mt-0.5">
                            {user.addresses.find(a => a.isDefault)?.street}, {user.addresses.find(a => a.isDefault)?.city}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-headline text-base font-bold text-deep-obsidian">Order History List</h3>
              
              {loadingOrders ? (
                <div className="h-44 bg-white border border-stroke-soft rounded-2xl flex items-center justify-center text-xs text-text-slate">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 bg-white border border-stroke-soft rounded-2xl text-center space-y-3">
                  <p className="text-sm font-semibold text-deep-obsidian">No orders placed yet</p>
                  <Link href="/shop" className="px-5 py-2.5 bg-deep-obsidian text-white rounded-xl text-xs font-bold inline-block">
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-stroke-soft rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Order top bar summary header */}
                      <div className="px-6 py-4 bg-slate-surface/50 border-b border-stroke-soft flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-text-slate">
                        <div className="flex items-center gap-4">
                          <div>
                            <span>ORDER PLACED</span>
                            <span className="block font-bold text-deep-obsidian mt-0.5">{order.date}</span>
                          </div>
                          <div>
                            <span>ORDER NUMBER</span>
                            <span className="block font-bold text-deep-obsidian font-mono mt-0.5">{order.orderNumber}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${
                            getStatusColor(order.status)
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-headline text-sm font-black text-deep-obsidian">
                            {formatPrice(order.grandTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="p-6 divide-y divide-stroke-soft divide-dashed space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 first:pt-0 last:pb-0 gap-4">
                            <div>
                              <p className="font-bold text-xs text-deep-obsidian">{item.name}</p>
                              <p className="text-[10px] text-text-slate mt-0.5">
                                Qty: {item.quantity} | {item.pickupOption ? "Pickup" : "Delivery"}
                              </p>
                              {item.installationSelected && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-[9px] text-primary rounded font-bold uppercase tracking-wider">
                                  Includes Professional Installation
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-bold text-deep-obsidian">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions footer */}
                      <div className="px-6 py-4 border-t border-stroke-soft bg-slate-surface/10 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 border border-stroke-soft hover:bg-slate-surface text-deep-obsidian font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Reorder All
                          </button>
                          
                          <button
                            onClick={() => triggerToast(`Downloaded Invoice PDF for ${order.orderNumber}`)}
                            className="px-4 py-2 hover:underline text-text-slate hover:text-deep-obsidian font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Download Invoice
                          </button>
                        </div>

                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel Pending Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-headline text-base font-bold text-deep-obsidian">Your Wishlist</h3>

              {wishlistedItems.length === 0 ? (
                <div className="py-20 text-center bg-white border border-stroke-soft rounded-2xl max-w-md mx-auto space-y-4 px-6 shadow-sm">
                  <Heart className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h4 className="font-bold text-deep-obsidian">Wishlist is Empty</h4>
                    <p className="text-xs text-text-slate mt-1">
                      You haven&apos;t saved any hardware panels, LFP cabinet battery banks, or smart inverters to your wishlist yet.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="inline-block px-5 py-2.5 bg-deep-obsidian text-white rounded-xl text-xs font-bold hover:bg-black"
                  >
                    Browse Catalog Shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistedItems.map((product) => {
                    if (!product) return null;
                    return (
                      <div
                        key={product.id}
                        className="group bg-white border border-stroke-soft rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
                      >
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-4 right-4 p-1.5 text-text-slate hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-4">
                          <div className="aspect-square w-full bg-slate-surface rounded-xl overflow-hidden border border-stroke-soft">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div>
                            <span className="text-[9px] font-black text-primary uppercase bg-surface-container px-2 py-0.5 rounded">
                              {product.category}
                            </span>
                            <h4 className="font-headline font-bold text-deep-obsidian text-sm mt-1 truncate">
                              {product.name}
                            </h4>
                            <p className="font-mono text-[9px] text-text-slate mt-0.5">{product.sku}</p>
                            <p className="font-headline font-black text-deep-obsidian mt-2">{formatPrice(product.price)}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleMoveWishlistToCart(product.id, product.name)}
                          className="w-full mt-4 py-2.5 bg-deep-obsidian hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center block"
                        >
                          Move to Shopping Cart
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS & SAVED ADDRESSES */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
              {/* Profile updates form */}
              <div className="lg:col-span-7 bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="font-headline text-base font-bold text-deep-obsidian">Profile Settings</h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-semibold text-text-slate">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        required
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        required
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        readOnly
                        disabled
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-surface-container text-text-slate outline-none cursor-not-allowed opacity-70"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        required
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Delivery Instructions Notes</label>
                    <textarea
                      value={profileForm.deliveryNotes}
                      onChange={(e) => setProfileForm({ ...profileForm, deliveryNotes: e.target.value })}
                      placeholder="e.g. Ring office reception on arrival..."
                      rows={3}
                      className="w-full border border-stroke-soft rounded-lg p-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="px-6 py-3 bg-deep-obsidian hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
                  >
                    {submittingProfile ? "Updating..." : "Update Credentials"}
                  </button>
                </form>
              </div>

              {/* Addresses manager */}
              <div className="lg:col-span-5 bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline text-base font-bold text-deep-obsidian">Address Book</h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Address
                  </button>
                </div>

                {/* Add new address inline form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-slate-surface border border-stroke-soft rounded-xl p-4 space-y-3 text-[10px] font-bold text-text-slate animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block mb-1">Address Label</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="e.g. Factory HQ"
                        required
                        className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs bg-white text-deep-obsidian outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Receiving Name</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="Kolawole Operations"
                        required
                        className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs bg-white text-deep-obsidian outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Street address</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Plot 8, Oshodi-Apapa Expressway"
                        required
                        className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs bg-white text-deep-obsidian outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1">City</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="Oshodi"
                          required
                          className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs bg-white text-deep-obsidian outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">State</label>
                        <select
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs bg-white text-deep-obsidian outline-none"
                        >
                          <option>Lagos State</option>
                          <option>Abuja (FCT)</option>
                          <option>Rivers State</option>
                          <option>Kano State</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-deep-obsidian text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-stroke-soft bg-white text-text-slate rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses list */}
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-stroke-soft rounded-xl p-4 bg-white hover:bg-slate-50/50 transition-colors flex justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4.5 h-4.5 text-text-slate shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-deep-obsidian">{address.label}</span>
                            {address.isDefault && (
                              <span className="text-[8px] font-black text-eco-emerald bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-text-slate font-medium mt-1">{address.fullName} ({address.phone})</p>
                          <p className="text-text-slate mt-0.5">{address.street}, {address.city}, {address.state}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button
                          onClick={() => deleteAddress(address.id)}
                          className="text-text-slate hover:text-red-500 p-1 rounded-full cursor-pointer"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(address.id)}
                            className="text-[9px] text-primary hover:underline font-bold cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </LayoutShell>
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-surface text-text-slate">
        Loading dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
