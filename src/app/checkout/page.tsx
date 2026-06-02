"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, MapPin, Wrench, ShieldCheck, ChevronRight, User, ArrowLeft, Calendar, FileText, CheckCircle2, Ticket } from "lucide-react";
import LayoutShell from "../../components/shared/LayoutShell";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { MOCK_PRODUCTS, MOCK_STATIONS } from "../../lib/mockData";
import { OrderService } from "../../services/api";
import { Address, OrderItem } from "../../types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Redirect if cart is empty (unless order placed successfully)
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push("/cart");
    }
  }, [items, router]);

  // Stepper state: 0=Info, 1=Delivery/Pickup, 2=Installation, 3=Review & Pay
  const [currentStep, setCurrentStep] = useState(0);

  // Form Fields State
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
    firstName: user?.fullName.split(" ")[0] || "",
    lastName: user?.fullName.split(" ").slice(1).join(" ") || ""
  });

  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  
  // Delivery State
  const [deliveryAddress, setDeliveryAddress] = useState<Omit<Address, "id" | "isDefault">>({
    label: "Checkout Delivery",
    fullName: user ? user.fullName : "",
    phone: user ? user.phone : "",
    street: user?.addresses.find(a => a.isDefault)?.street || "",
    city: user?.addresses.find(a => a.isDefault)?.city || "",
    state: user?.addresses.find(a => a.isDefault)?.state || "Lagos State",
    zipCode: user?.addresses.find(a => a.isDefault)?.zipCode || ""
  });

  // Pickup State
  const [selectedStationId, setSelectedStationId] = useState(MOCK_STATIONS[0].id);
  const [pickupDate, setPickupDate] = useState("");

  // Installation State
  const [scheduleInstall, setScheduleInstall] = useState(items.some(i => i.installationSelected));
  const [installDate, setInstallDate] = useState("");
  const [installerNotes, setInstallerNotes] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  // Success State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  // Auto pre-populate if user changes
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        email: user.email,
        phone: user.phone,
        firstName: user.fullName.split(" ")[0],
        lastName: user.fullName.split(" ").slice(1).join(" ")
      });
      const defAddr = user.addresses.find(a => a.isDefault);
      if (defAddr) {
        setDeliveryAddress({
          label: "Checkout Delivery",
          fullName: user.fullName,
          phone: user.phone,
          street: defAddr.street,
          city: defAddr.city,
          state: defAddr.state,
          zipCode: defAddr.zipCode
        });
      }
    }
  }, [user]);

  // Calculate dynamic delivery fee based on state
  const getDeliveryFee = () => {
    if (fulfillmentType === "pickup") return 0;
    const state = deliveryAddress.state.toLowerCase();
    if (state.includes("lagos")) return 15000;
    if (state.includes("abuja") || state.includes("fct")) return 45000;
    return 75000; // Rest of Nigeria
  };

  // Map product details onto cart items
  const cartWithDetails = items.map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter((item) => item.product !== undefined);

  // Totals calculations
  const subtotal = cartWithDetails.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  
  const installationTotal = scheduleInstall
    ? cartWithDetails.reduce((acc, item) => acc + (item.product?.installationFee || 0) * item.quantity, 0)
    : 0;

  const shippingTotal = subtotal > 5000000 ? 0 : getDeliveryFee() * cartWithDetails.length;
  const taxEstimate = Math.round((subtotal + installationTotal + shippingTotal) * 0.075);
  const grandTotal = subtotal + installationTotal + shippingTotal + taxEstimate;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    }).format(val);
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!customerInfo.email || !customerInfo.firstName) return;
    }
    if (currentStep === 1) {
      if (fulfillmentType === "delivery" && !deliveryAddress.street) return;
      if (fulfillmentType === "pickup" && !pickupDate) return;
    }
    if (currentStep === 2) {
      if (scheduleInstall && !installDate) return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBackStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handlePlaceOrder = async () => {
    const orderItems: OrderItem[] = cartWithDetails.map((item) => ({
      productId: item.productId,
      name: item.product?.name || "",
      price: item.product?.price || 0,
      quantity: item.quantity,
      installationSelected: item.installationSelected,
      pickupOption: item.pickupOption
    }));

    const finalAddress: Address | undefined = fulfillmentType === "delivery" ? {
      id: `addr-${Date.now()}`,
      label: deliveryAddress.label,
      fullName: deliveryAddress.fullName,
      phone: deliveryAddress.phone,
      street: deliveryAddress.street,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      zipCode: deliveryAddress.zipCode,
      isDefault: false
    } : undefined;

    const station = MOCK_STATIONS.find(s => s.id === selectedStationId);

    try {
      const order = await OrderService.create({
        items: orderItems,
        subtotal,
        tax: taxEstimate,
        installationTotal,
        shippingTotal,
        grandTotal,
        shippingAddress: finalAddress,
        pickupStation: fulfillmentType === "pickup" ? station?.name : undefined,
        pickupDate: fulfillmentType === "pickup" ? pickupDate : undefined,
        paymentMethod,
        installationScheduledDate: scheduleInstall ? installDate : undefined,
        installerNotes: installerNotes || undefined
      });

      setPlacedOrderNumber(order.orderNumber);
      setOrderSuccess(true);
      clearCart();
    } catch (e) {
      console.error(e);
    }
  };

  const stepsList = [
    { title: "Contact", icon: User },
    { title: "Fulfillment", icon: Truck },
    { title: "Installation", icon: Wrench },
    { title: "Payment", icon: CreditCard }
  ];

  if (orderSuccess) {
    return (
      <LayoutShell>
        <div className="py-16 px-4 md:px-margin-desktop max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center">
          <div className="bg-white border border-stroke-soft rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-eco-emerald">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-headline text-2xl font-black text-deep-obsidian">Order Placed Successfully</h2>
              <p className="text-xs text-text-slate">
                Your clean energy equipment is scheduled for fulfillment. Receipt sent to <span className="font-bold text-deep-obsidian">{customerInfo.email}</span>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-surface rounded-2xl p-6 border border-stroke-soft text-left space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-stroke-soft pb-3 font-semibold text-text-slate">
                <span>ORDER NUMBER</span>
                <span className="font-mono text-deep-obsidian font-bold">{placedOrderNumber}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-text-slate">
                  <span>Fulfillment Mode</span>
                  <span className="font-bold text-deep-obsidian capitalize">{fulfillmentType}</span>
                </div>
                {fulfillmentType === "pickup" ? (
                  <div className="flex justify-between text-text-slate">
                    <span>Pickup Date</span>
                    <span className="font-mono font-bold text-deep-obsidian">{pickupDate}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-text-slate">
                    <span>Shipping To</span>
                    <span className="font-bold text-deep-obsidian truncate max-w-[200px]">
                      {deliveryAddress.street}, {deliveryAddress.city}
                    </span>
                  </div>
                )}
                {scheduleInstall && (
                  <div className="flex justify-between text-text-slate">
                    <span>Installation Setup</span>
                    <span className="font-mono font-bold text-primary">{installDate}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-slate border-t border-stroke-soft pt-3">
                  <span>Subtotal</span>
                  <span className="font-mono text-deep-obsidian">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-slate">
                  <span>VAT &amp; Fees</span>
                  <span className="font-mono text-deep-obsidian">{formatPrice(taxEstimate + shippingTotal + installationTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-deep-obsidian border-t border-stroke-soft pt-3">
                  <span>Grand Total Paid</span>
                  <span className="font-mono text-deep-obsidian">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard?tab=orders"
                className="py-3.5 bg-deep-obsidian hover:bg-black text-white rounded-xl font-bold text-sm text-center shadow"
              >
                Track Order Status
              </Link>
              <Link
                href="/"
                className="py-3.5 border border-stroke-soft bg-white text-deep-obsidian hover:bg-slate-surface rounded-xl font-bold text-sm text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <main className="py-12 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex-grow">
        {/* Checkout Header Progress timeline */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {stepsList.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <React.Fragment key={step.title}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? "bg-eco-emerald text-white" 
                        : isActive 
                          ? "bg-sunlight-amber text-deep-obsidian font-black ring-4 ring-amber-500/10" 
                          : "bg-white border border-stroke-soft text-text-slate"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isActive ? "text-primary font-bold" : "text-text-slate"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < stepsList.length - 1 && (
                    <div className={`flex-grow h-0.5 mx-2 transition-all ${
                      idx < currentStep ? "bg-eco-emerald" : "bg-stroke-soft"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Wizard forms */}
          <div className="lg:col-span-8 bg-white border border-stroke-soft rounded-2xl p-6 md:p-8 shadow-sm">
            
            {/* Step 0: Customer Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="border-b border-stroke-soft pb-4 flex justify-between items-center">
                  <h2 className="font-headline text-lg font-bold text-deep-obsidian">Contact Information</h2>
                  {!user && (
                    <Link href="/login?redirect=/checkout" className="text-xs font-bold text-primary hover:underline">
                      Log in for default settings
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      placeholder="Adebayo"
                      required
                      className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      placeholder="Kolawole"
                      required
                      className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Company Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="kola@company.com"
                      required
                      className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+234 803 123 4567"
                      required
                      className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!customerInfo.email || !customerInfo.firstName}
                    className="px-6 py-3 bg-deep-obsidian hover:bg-black disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Continue to Fulfillment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Fulfillment Selectors */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-stroke-soft pb-4 flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-deep-obsidian">Fulfillment Details</h2>
                  <button onClick={handleBackStep} className="text-xs font-bold text-text-slate hover:text-deep-obsidian flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Fulfillment toggle buttons */}
                <div className="flex bg-slate-surface rounded-xl p-1 border border-stroke-soft max-w-sm">
                  <button
                    onClick={() => setFulfillmentType("delivery")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                      fulfillmentType === "delivery" 
                        ? "bg-deep-obsidian text-white" 
                        : "text-text-slate hover:text-deep-obsidian"
                    }`}
                  >
                    Home Delivery
                  </button>
                  <button
                    onClick={() => setFulfillmentType("pickup")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                      fulfillmentType === "pickup" 
                        ? "bg-deep-obsidian text-white" 
                        : "text-text-slate hover:text-deep-obsidian"
                    }`}
                  >
                    Warehouse Pickup
                  </button>
                </div>

                {fulfillmentType === "delivery" ? (
                  /* Delivery address fields */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Street Address</label>
                      <input
                        type="text"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        placeholder="Suite 401, Energy Plaza, Adeola Odeku St"
                        required
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">City</label>
                        <input
                          type="text"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          placeholder="Victoria Island"
                          required
                          className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">State</label>
                        <select
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                          className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                        >
                          <option>Lagos State</option>
                          <option>Abuja (FCT)</option>
                          <option>Rivers State</option>
                          <option>Kano State</option>
                          <option>Oyo State</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Postal / Zip Code</label>
                        <input
                          type="text"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                          placeholder="100011"
                          className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Pickup Depot selection */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Select Pickup Depot</label>
                      <select
                        value={selectedStationId}
                        onChange={(e) => setSelectedStationId(e.target.value)}
                        className="w-full border border-stroke-soft rounded-lg h-11 px-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                      >
                        {MOCK_STATIONS.map((station) => (
                          <option key={station.id} value={station.id}>
                            {station.name} — {station.address}, {station.city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Preferred Pickup Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          required
                          className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={fulfillmentType === "delivery" ? !deliveryAddress.street : !pickupDate}
                    className="px-6 py-3 bg-deep-obsidian hover:bg-black disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Continue to Installation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Installation Scheduling */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-stroke-soft pb-4 flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-deep-obsidian">Installation Scheduling</h2>
                  <button onClick={handleBackStep} className="text-xs font-bold text-text-slate hover:text-deep-obsidian flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-stroke-soft rounded-xl bg-slate-surface/30">
                    <input
                      type="checkbox"
                      checked={scheduleInstall}
                      onChange={(e) => setScheduleInstall(e.target.checked)}
                      className="rounded border-stroke-soft text-sunlight-amber focus:ring-sunlight-amber w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <span className="block font-bold text-xs text-deep-obsidian">Schedule Professional Installation Services</span>
                      <span className="text-[10px] text-text-slate mt-0.5">Let our certified engineering network deploy and commission your solar array.</span>
                    </div>
                  </label>

                  {scheduleInstall && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Preferred Installation Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                          <input
                            type="date"
                            value={installDate}
                            onChange={(e) => setInstallDate(e.target.value)}
                            required
                            className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Special Instructions for Installer</label>
                        <textarea
                          value={installerNotes}
                          onChange={(e) => setInstallerNotes(e.target.value)}
                          placeholder="e.g. Roof is sloped, structural concrete roof, bypass diodes require manual bypass switch..."
                          rows={4}
                          className="w-full border border-stroke-soft rounded-lg p-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={scheduleInstall && !installDate}
                    className="px-6 py-3 bg-deep-obsidian hover:bg-black disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-stroke-soft pb-4 flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-deep-obsidian">Review &amp; Payment</h2>
                  <button onClick={handleBackStep} className="text-xs font-bold text-text-slate hover:text-deep-obsidian flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">Choose Payment Method</h3>
                  
                  {[
                    { id: "Bank Transfer", name: "Corporate Bank Transfer", desc: "Pay via corporate bank transfer. Instructions sent immediately." },
                    { id: "Corporate Card", name: "Credit/Debit Card", desc: "Secure online payment with Visa, Mastercard, or Verve." },
                    { id: "Solar Credit", name: "Solar Financing Credit", desc: "Offset payment with approved 24-month payment terms." }
                  ].map((method) => (
                    <label
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id 
                          ? "border-2 border-primary bg-amber-50/10" 
                          : "border-stroke-soft hover:bg-slate-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === method.id}
                        onChange={() => {}}
                        className="mt-1 text-primary focus:ring-primary border-stroke-soft"
                      />
                      <div>
                        <span className="block font-bold text-xs text-deep-obsidian">{method.name}</span>
                        <span className="text-[10px] text-text-slate mt-0.5">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Place Order Trigger */}
                <div className="pt-6 border-t border-stroke-soft border-dashed space-y-4">
                  <div className="flex items-start gap-3 text-xs text-text-slate leading-relaxed bg-slate-surface p-4 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-eco-emerald shrink-0" />
                    <span>
                      By clicking &ldquo;Place Secure Order&rdquo;, you authorize SolarShopOffice to schedule fulfillment. Bank transfers must clear within 48 hours to secure stock availability.
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePlaceOrder}
                      className="px-8 py-4 bg-deep-obsidian hover:bg-black text-white font-bold text-sm rounded-xl hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Place Secure Order ({formatPrice(grandTotal)})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Cart review sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="font-headline text-base font-bold text-deep-obsidian">Order Review</h2>
              
              {/* Item summaries list */}
              <div className="max-h-52 overflow-y-auto divide-y divide-stroke-soft pr-1 hide-scrollbar">
                {cartWithDetails.map((item) => (
                  <div key={item.productId} className="py-3 flex justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-deep-obsidian truncate block">{item.product?.name}</span>
                      <span className="text-text-slate font-medium">Qty: {item.quantity}</span>
                      {item.installationSelected && (
                        <span className="text-[10px] text-primary block mt-0.5 font-bold">Include Install</span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-deep-obsidian shrink-0">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Aggregates calculation summary */}
              <div className="border-t border-stroke-soft pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-text-slate">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(subtotal)}</span>
                </div>
                {installationTotal > 0 && (
                  <div className="flex justify-between text-text-slate">
                    <span>Installation Charges</span>
                    <span className="font-mono font-semibold text-primary">+{formatPrice(installationTotal)}</span>
                  </div>
                )}
                {shippingTotal > 0 ? (
                  <div className="flex justify-between text-text-slate">
                    <span>Estimated Shipping</span>
                    <span className="font-mono font-semibold text-deep-obsidian">+{formatPrice(shippingTotal)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-text-slate">
                    <span>Shipping fee</span>
                    <span className="font-bold text-eco-emerald font-mono">FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-text-slate border-b border-stroke-soft pb-3">
                  <span>VAT (7.5%)</span>
                  <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(taxEstimate)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-deep-obsidian pt-1">
                  <span>Grand Total</span>
                  <span className="font-mono text-base font-black text-deep-obsidian">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Support box */}
            <div className="bg-surface-container-low p-5 rounded-2xl border border-stroke-soft text-xs space-y-2">
              <h4 className="font-bold text-deep-obsidian">Secure Checkout Compliant</h4>
              <p className="text-text-slate leading-relaxed">
                All order details are protected by 256-bit SSL encryption. We verify installer licensing prior to scheduling home visits.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </LayoutShell>
  );
}
