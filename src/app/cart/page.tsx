"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Heart, Plus, Minus, Shield, ArrowRight, Truck, MapPin, Tag, Wrench, Check, HelpCircle, Lock, ShieldCheck } from "lucide-react";
import LayoutShell from "../../components/shared/LayoutShell";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { MOCK_PRODUCTS } from "../../lib/mockData";

export default function CartPage() {
  const { items, updateQuantity, toggleInstallation, togglePickup, removeItem, clearCart } = useCartStore();
  const { addToWishlist } = useWishlistStore();

  // Coupon promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global fulfillment method state (matches mockup)
  // We sync this to all items in cart when clicked
  const isAllPickup = items.length > 0 && items.every((i) => i.pickupOption);
  const [globalFulfillment, setGlobalFulfillment] = useState<"delivery" | "pickup">(
    isAllPickup ? "pickup" : "delivery"
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGlobalFulfillmentChange = (mode: "delivery" | "pickup") => {
    setGlobalFulfillment(mode);
    items.forEach((item) => {
      togglePickup(item.productId, mode === "pickup");
    });
    triggerToast(mode === "pickup" ? "Switched to Local Pickup" : "Switched to Standard Delivery");
  };

  const handleSaveForLater = (productId: string, name: string) => {
    addToWishlist(productId);
    removeItem(productId);
    triggerToast(`Moved ${name} to Wishlist`);
  };

  const handlePromoApply = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    if (code === "SOLAR10") {
      setAppliedPromo("SOLAR10");
      setDiscountPercent(10);
      setPromoCode("");
      triggerToast("10% Discount Applied!");
    } else if (code === "FREEINSTALL") {
      setAppliedPromo("FREEINSTALL");
      setDiscountPercent(0); // Handled dynamically in installation calculation
      setPromoCode("");
      triggerToast("Free Installation Applied!");
    } else {
      setPromoError("Invalid promotional code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
    triggerToast("Promotional code removed");
  };

  // Map product details onto cart items
  const cartWithDetails = items.map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter((item) => item.product !== undefined);

  // Calculate aggregates
  const subtotal = cartWithDetails.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  
  // Dynamic installation cost (FREEINSTALL sets to 0)
  const baseInstallationTotal = cartWithDetails.reduce((acc, item) => {
    if (item.installationSelected && item.product?.installationFee) {
      return acc + item.product.installationFee * item.quantity;
    }
    return acc;
  }, 0);
  const installationTotal = appliedPromo === "FREEINSTALL" ? 0 : baseInstallationTotal;

  // Delivery total (Standard Delivery is ₦75,000 for panels/batteries or ₦5,000 for accessories, or free over ₦5 Million)
  const rawShippingTotal = cartWithDetails.reduce((acc, item) => acc + (item.deliveryFee || 0), 0);
  const shippingTotal = subtotal > 5000000 || globalFulfillment === "pickup" ? 0 : rawShippingTotal;

  // Promos discount
  const discountTotal = Math.round(subtotal * (discountPercent / 10));

  // Taxes
  const taxEstimate = Math.round((subtotal + installationTotal + shippingTotal - discountTotal) * 0.075);
  const grandTotal = subtotal + installationTotal + shippingTotal - discountTotal + taxEstimate;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <LayoutShell>
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <main className="py-12 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex-grow">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold mb-10 text-deep-obsidian">Your Energy Hub</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center border border-stroke-soft bg-white rounded-2xl max-w-lg mx-auto space-y-6 px-6 shadow-sm">
            <div className="w-20 h-20 bg-surface-container-low text-primary flex items-center justify-center rounded-full mx-auto">
              <Truck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-deep-obsidian">Your cart is empty</h2>
              <p className="text-sm text-text-slate mt-2 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t added any clean energy solar panels, inverters, battery bank modules, or charging solutions yet.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block bg-deep-obsidian hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:shadow transition-colors"
            >
              Browse E-commerce Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items list & fulfillment selector */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Global Fulfillment Method selector */}
              <section className="bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-headline text-base font-bold text-deep-obsidian">Fulfillment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Mode Card */}
                  <div
                    onClick={() => handleGlobalFulfillmentChange("delivery")}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      globalFulfillment === "delivery"
                        ? "border-primary bg-amber-50/10"
                        : "border-stroke-soft hover:bg-slate-surface"
                    }`}
                  >
                    <Truck className={`w-6 h-6 mr-4 ${globalFulfillment === "delivery" ? "text-primary" : "text-text-slate"}`} />
                    <div>
                      <span className="block font-bold text-sm text-deep-obsidian">Standard Delivery</span>
                      <span className="text-[10px] text-text-slate font-medium">Est. Arrival: 3-5 Business Days</span>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        globalFulfillment === "delivery" ? "border-primary" : "border-stroke-soft"
                      }`}>
                        {globalFulfillment === "delivery" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                    </div>
                  </div>

                  {/* Pickup Mode Card */}
                  <div
                    onClick={() => handleGlobalFulfillmentChange("pickup")}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      globalFulfillment === "pickup"
                        ? "border-primary bg-amber-50/10"
                        : "border-stroke-soft hover:bg-slate-surface"
                    }`}
                  >
                    <MapPin className={`w-6 h-6 mr-4 ${globalFulfillment === "pickup" ? "text-primary" : "text-text-slate"}`} />
                    <div>
                      <span className="block font-bold text-sm text-deep-obsidian">Local Warehouse Pickup</span>
                      <span className="text-[10px] text-text-slate font-medium">Ready in 24-48 Hours</span>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        globalFulfillment === "pickup" ? "border-primary" : "border-stroke-soft"
                      }`}>
                        {globalFulfillment === "pickup" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Shopping Cart List */}
              <section className="bg-white border border-stroke-soft rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-stroke-soft flex justify-between items-center bg-slate-surface/50">
                  <h2 className="font-headline text-base font-bold text-deep-obsidian">
                    Shopping Cart ({cartWithDetails.length} Items)
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline font-bold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-stroke-soft">
                  {cartWithDetails.map((item) => (
                    <div
                      key={item.productId}
                      className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-surface/20 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-slate-surface rounded-xl overflow-hidden border border-stroke-soft shrink-0">
                        <img
                          src={item.product?.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details block */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between py-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-black text-primary uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded">
                              {item.product?.category}
                            </span>
                            <h3 className="font-headline font-bold text-sm text-deep-obsidian mt-1 truncate max-w-sm sm:max-w-md">
                              {item.product?.name}
                            </h3>
                            <p className="font-mono text-[10px] text-text-slate mt-0.5">{item.product?.sku}</p>
                          </div>
                          
                          <div className="text-left sm:text-right shrink-0">
                            <span className="font-headline font-black text-sm text-deep-obsidian">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-text-slate mt-0.5">
                                {formatPrice(item.product?.price || 0)} each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive items control row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                          {/* Qty editor */}
                          <div className="flex items-center border border-stroke-soft rounded-lg bg-white overflow-hidden shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-slate-surface text-text-slate hover:text-deep-obsidian cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold font-mono text-xs px-2.5 w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2.5 py-1.5 hover:bg-slate-surface text-text-slate hover:text-deep-obsidian cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Options Checklist */}
                          <div className="flex items-center gap-4 text-xs font-semibold text-text-slate">
                            {/* Install Checkbox */}
                            {item.product?.installationFee && (
                              <label className="flex items-center gap-2 cursor-pointer group hover:text-deep-obsidian">
                                <input
                                  type="checkbox"
                                  checked={item.installationSelected}
                                  onChange={(e) => toggleInstallation(item.productId, e.target.checked)}
                                  className="rounded border-stroke-soft text-sunlight-amber focus:ring-sunlight-amber w-4.5 h-4.5 cursor-pointer"
                                />
                                <span className="flex items-center gap-1">
                                  <Wrench className="w-3.5 h-3.5 text-text-slate" />
                                  Install
                                </span>
                              </label>
                            )}
                          </div>

                          {/* Quick Actions (Remove, Save for Later) */}
                          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                            <button
                              onClick={() => handleSaveForLater(item.productId, item.product?.name || "")}
                              className="text-xs text-text-slate hover:text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              Save for Later
                            </button>
                            <span className="text-stroke-soft">|</span>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-xs text-red-600 hover:text-red-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Environmental Carbon impact banner */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50 text-xs font-semibold text-text-slate">
                <ShieldCheck className="w-5 h-5 text-eco-emerald shrink-0 animate-pulse" />
                <p>
                  This configuration offsets an estimated <span className="font-black text-eco-emerald">12.4 Tons of carbon emissions</span> annually. Thank you for engineering clean energy transitions.
                </p>
              </div>
            </div>

            {/* Right Column: Calculations Order Summary */}
            <aside className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white border border-stroke-soft rounded-2xl shadow-xl p-6 space-y-6">
                <h2 className="font-headline text-base font-bold text-deep-obsidian">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-text-slate font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(subtotal)}</span>
                  </div>
                  {installationTotal > 0 && (
                    <div className="flex justify-between text-text-slate font-medium">
                      <span>Installation Costs</span>
                      <span className="font-mono font-semibold text-primary">+{formatPrice(installationTotal)}</span>
                    </div>
                  )}
                  {appliedPromo === "FREEINSTALL" && baseInstallationTotal > 0 && (
                    <div className="flex justify-between text-xs font-bold text-eco-emerald">
                      <span>Installation Discount</span>
                      <span>Free Installation</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-slate font-medium">
                    <span>Estimated Shipping</span>
                    <span className={`font-mono font-bold ${shippingTotal === 0 ? "text-eco-emerald" : "text-deep-obsidian"}`}>
                      {shippingTotal === 0 ? "FREE" : formatPrice(shippingTotal)}
                    </span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-eco-emerald font-bold">
                      <span>Discount (10%)</span>
                      <span className="font-mono">-{formatPrice(discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-slate font-medium border-b border-stroke-soft pb-3">
                    <span className="flex items-center gap-1.5">
                      VAT Estimate
                      <span className="text-[10px] font-black bg-slate-surface text-text-slate px-1.5 py-0.5 rounded">7.5%</span>
                    </span>
                    <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(taxEstimate)}</span>
                  </div>
                  <div className="flex justify-between font-headline text-base font-extrabold text-deep-obsidian pt-1">
                    <span>Grand Total</span>
                    <span className="font-mono font-black text-lg text-deep-obsidian">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Promo Code Submission */}
                <div className="border-t border-stroke-soft pt-6 space-y-2">
                  <label className="block text-xs font-black text-text-slate uppercase tracking-wider">
                    Promotional Coupon
                  </label>
                  
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-eco-emerald">
                      <span className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        Code: {appliedPromo}
                      </span>
                      <button
                        onClick={handleRemovePromo}
                        className="text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePromoApply} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="SOLAR10 or FREEINSTALL"
                        className="flex-grow bg-slate-surface border border-stroke-soft rounded-lg px-3 py-2 text-xs font-mono font-bold focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber outline-none text-deep-obsidian uppercase"
                      />
                      <button
                        type="submit"
                        className="bg-deep-obsidian hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
                </div>

                <div className="space-y-4 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full bg-deep-obsidian hover:bg-black text-white py-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center justify-center gap-3 text-text-slate opacity-75">
                    <Lock className="w-5 h-5" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider leading-none">SECURE ENCRYPTION</p>
                      <p className="text-[10px] font-medium leading-none mt-1">256-BIT SSL COMPLIANT CONNECTION</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation sidebar banner */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-stroke-soft flex gap-4">
                <Wrench className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-deep-obsidian">Need Engineering Support?</h4>
                  <p className="text-[11px] text-text-slate mt-1 leading-normal">
                    Schedule a corporate consultation audit. Speak with a certified solar designer today.
                  </p>
                  <Link href="/#audit" className="text-primary hover:underline text-[11px] font-bold mt-2 block">
                    Contact Engineering Support
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </LayoutShell>
  );
}
