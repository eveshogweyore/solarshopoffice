"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, Shield, Wrench, Truck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { useUIStore } from "../../store/uiStore";
import { MOCK_PRODUCTS } from "../../lib/mockData";

export default function CartDrawer() {
  const { cartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const { items, updateQuantity, toggleInstallation, togglePickup, removeItem } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartDrawerOpen(false);
    };
    if (cartDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind drawer
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [cartDrawerOpen, setCartDrawerOpen]);

  // Map product details onto cart items
  const cartWithDetails = items.map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter((item) => item.product !== undefined);

  // Calculate totals
  const subtotal = cartWithDetails.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const installationTotal = cartWithDetails.reduce((acc, item) => {
    if (item.installationSelected && item.product?.installationFee) {
      return acc + item.product.installationFee * item.quantity;
    }
    return acc;
  }, 0);
  const shippingTotal = cartWithDetails.reduce((acc, item) => acc + (item.deliveryFee || 0), 0);
  const taxEstimate = Math.round((subtotal + installationTotal + shippingTotal) * 0.075); // 7.5% VAT
  const grandTotal = subtotal + installationTotal + shippingTotal + taxEstimate;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-deep-obsidian/45 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-stroke-soft z-50 flex flex-col h-full overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-stroke-soft">
              <div>
                <h3 className="font-headline text-lg font-bold text-deep-obsidian">Your Power Cart</h3>
                <p className="text-xs text-text-slate">{items.length} unique systems selected</p>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 text-text-slate hover:text-deep-obsidian hover:bg-slate-surface rounded-full transition-all cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Scrollable Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartWithDetails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-deep-obsidian">Cart is Empty</h4>
                    <p className="text-sm text-text-slate max-w-xs mt-1">
                      You haven&apos;t added any solar panels, inverters, or battery bank components yet.
                    </p>
                  </div>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="px-6 py-2.5 bg-deep-obsidian hover:bg-black text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                cartWithDetails.map((item) => (
                  <div key={item.productId} className="flex flex-col border border-stroke-soft rounded-xl p-4 bg-white hover:shadow-md transition-shadow relative">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="absolute top-4 right-4 text-text-slate hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-slate-surface rounded-lg overflow-hidden flex-shrink-0 border border-stroke-soft">
                        <img
                          src={item.product?.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Title & Price info */}
                      <div className="flex-grow pr-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-surface-container-low px-2 py-0.5 rounded-full">
                          {item.product?.category}
                        </span>
                        <h4 className="font-bold text-deep-obsidian text-sm mt-1 max-w-[200px] truncate">
                          {item.product?.name}
                        </h4>
                        <p className="font-mono text-xs text-text-slate mt-0.5">{item.product?.sku}</p>
                        <p className="text-sm font-black text-deep-obsidian mt-2">{formatPrice(item.product?.price || 0)}</p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border-t border-stroke-soft mt-4 pt-4">
                      <span className="text-xs text-text-slate">Quantity</span>
                      <div className="flex items-center gap-3 border border-stroke-soft rounded-lg p-1 bg-slate-surface">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded transition-colors text-text-slate hover:text-deep-obsidian cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded transition-colors text-text-slate hover:text-deep-obsidian cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Service Toggles (Installation & Pickup/Delivery) */}
                    <div className="mt-4 space-y-2.5 pt-3 border-t border-dashed border-stroke-soft">
                      {/* Installation Option */}
                      {item.product?.installationFee && (
                        <label className="flex items-center justify-between cursor-pointer group">
                          <span className="flex items-center gap-2 text-xs text-text-slate group-hover:text-deep-obsidian">
                            <Wrench className="w-3.5 h-3.5 text-text-slate" />
                            Add Engineering Installation
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary font-mono">
                              +{formatPrice(item.product.installationFee)}/ea
                            </span>
                            <input
                              type="checkbox"
                              checked={item.installationSelected}
                              onChange={(e) => toggleInstallation(item.productId, e.target.checked)}
                              className="rounded border-stroke-soft text-sunlight-amber focus:ring-sunlight-amber cursor-pointer w-4 h-4"
                            />
                          </div>
                        </label>
                      )}

                      {/* Pickup Option */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs text-text-slate">
                          {item.pickupOption ? (
                            <MapPin className="w-3.5 h-3.5 text-text-slate" />
                          ) : (
                            <Truck className="w-3.5 h-3.5 text-text-slate" />
                          )}
                          Fulfillment Mode
                        </span>
                        <div className="flex bg-slate-surface rounded-lg p-0.5 border border-stroke-soft">
                          <button
                            onClick={() => togglePickup(item.productId, false)}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                              !item.pickupOption 
                                ? "bg-deep-obsidian text-white" 
                                : "text-text-slate hover:text-deep-obsidian"
                            }`}
                          >
                            Delivery
                          </button>
                          <button
                            onClick={() => togglePickup(item.productId, true)}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                              item.pickupOption 
                                ? "bg-deep-obsidian text-white" 
                                : "text-text-slate hover:text-deep-obsidian"
                            }`}
                          >
                            Pickup
                          </button>
                        </div>
                      </div>

                      {/* Delivery Fee Notice */}
                      {!item.pickupOption && (
                        <div className="flex justify-between items-center text-[10px] text-text-slate bg-surface-container-low px-3 py-1.5 rounded-lg">
                          <span>Est. Delivery Fee</span>
                          <span className="font-mono font-bold text-deep-obsidian">
                            {formatPrice(item.deliveryFee || 5000)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer - Calculations & Checkout button */}
            {cartWithDetails.length > 0 && (
              <div className="border-t border-stroke-soft bg-slate-surface p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-slate">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(subtotal)}</span>
                  </div>
                  {installationTotal > 0 && (
                    <div className="flex justify-between text-text-slate">
                      <span>Installation Total</span>
                      <span className="font-mono font-semibold text-primary">{formatPrice(installationTotal)}</span>
                    </div>
                  )}
                  {shippingTotal > 0 && (
                    <div className="flex justify-between text-text-slate">
                      <span>Delivery Fees</span>
                      <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(shippingTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-slate border-b border-stroke-soft pb-2">
                    <span className="flex items-center gap-1">
                      VAT Estimate
                      <span className="text-[10px] font-black bg-surface-container text-text-slate px-1.5 py-0.5 rounded">7.5%</span>
                    </span>
                    <span className="font-mono font-semibold text-deep-obsidian">{formatPrice(taxEstimate)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-deep-obsidian pt-1">
                    <span>Grand Total</span>
                    <span className="font-mono font-black text-lg text-deep-obsidian">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-eco-emerald text-sm">shield</span>
                  <span className="text-[10px] text-text-slate leading-normal">
                    This order supports our 25-Year Performance Guarantee. All hardware meets ISO-9001 standards.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full py-3.5 border border-stroke-soft bg-white text-deep-obsidian hover:bg-slate-surface text-center font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    View Cart Page
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full py-3.5 bg-deep-obsidian hover:bg-black text-white text-center font-bold text-sm rounded-xl hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Secure Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
