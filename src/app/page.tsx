"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Wrench, Shield, CheckCircle, Sparkles, AlertCircle, Building, BatteryCharging, Plus } from "lucide-react";
import { motion } from "framer-motion";
import LayoutShell from "../components/shared/LayoutShell";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { MOCK_PRODUCTS } from "../lib/mockData";

export default function Home() {
  const addToCart = useCartStore((state) => state.addToCart);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  // Consultation Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    facilityType: "Home",
    monthlyLoad: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        facilityType: "Home",
        monthlyLoad: ""
      });
    }, 5000);
  };

  const handleQuickAdd = (prodId: string, name: string) => {
    addToCart({
      productId: prodId,
      quantity: 1,
      installationSelected: false,
      pickupOption: false
    });
    setAddedItemName(name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  // Get featured products
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.featured);

  return (
    <LayoutShell>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-5rem)] flex items-center bg-deep-obsidian overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkZc5SKzYer9WXqfrOqmHla8ZJjwTIM6VY6avrmHl8mvuRgq9FzEC-xxlULNJASAX9o9UUba4qrUT3SPgGXlzSKms3U-O1FFmua_527_iRXoQN2I4SoIVpF4ATmZ4LfmRCDIbVY1O6Ycc7scXk5PGrGKJSOtT4-NdzibdAKvGup6seqbSDvUAMcpG6uCZoxSnn85a8O7o_COjzgQjk92wCOxADue5KBWfPUz2iA_8oEbiiYfNGVInivJ7D29_NL-CwE6n_QeASAWU"
            alt="Modern Corporate Solar Infrastructure"
            className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        
        <div className="relative z-10 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-white font-extrabold mb-6 leading-tight">
              Engineering the Future of <br className="hidden md:inline" />Clean Energy
            </h1>
            <p className="font-body text-base md:text-lg text-slate-300 mb-10 max-w-xl leading-relaxed">
              SolarShopOffice provides high-precision solar infrastructure and intelligent battery storage solutions designed for moderate and heavy-load home, office and industrial environments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-sunlight-amber hover:bg-amber-500 text-deep-obsidian font-bold py-4 px-8 rounded-lg transition-all hover:shadow-lg active:scale-95 text-sm cursor-pointer"
              >
                Explore Solar Solutions
              </Link>
              <a
                href="#audit"
                className="border border-white hover:bg-white hover:text-deep-obsidian text-white font-bold py-4 px-8 rounded-lg transition-all active:scale-95 text-sm cursor-pointer"
              >
                Schedule Energy Audit
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Add Success Toast */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Added to Cart</p>
            <p className="text-xs text-text-slate truncate max-w-[200px]">{addedItemName}</p>
          </div>
        </div>
      )}

      {/* Section Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-deep-obsidian via-sunlight-amber/60 to-deep-obsidian relative z-20" />

      {/* Engineered Performance Carousel */}
      <section className="bg-deep-obsidian py-20 overflow-hidden">
        <div className="px-4 md:px-margin-desktop max-w-container-max mx-auto mb-10">
          <h2 className="font-headline text-3xl font-bold text-white">Featured Solar Products</h2>
          <p className="font-body text-slate-400 mt-2">Explore our solar units currently ready for dispatch.</p>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-6 px-4 md:px-margin-desktop overflow-x-auto pb-8 snap-x hide-scrollbar max-w-container-max mx-auto">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden snap-center group flex flex-col shadow-lg border border-slate-800"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-slate-100 border-b border-stroke-soft">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleQuickAdd(product.id, product.name)}
                  aria-label="Add to cart"
                  className="absolute bottom-4 right-4 bg-sunlight-amber hover:bg-amber-500 text-deep-obsidian p-3 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-5 h-5 font-black" />
                </button>
              </div>

              {/* Product brief info */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-headline text-sm font-bold text-deep-obsidian truncate max-w-[180px]">
                      {product.name}
                    </h4>
                    <span className="font-mono text-[10px] font-bold text-eco-emerald px-2 py-0.5 bg-emerald-50 rounded">
                      IN STOCK
                    </span>
                  </div>

                  {/* Specs Table Shorthand */}
                  <table className="w-full text-left text-xs font-body mb-4 spec-table border-collapse">
                    <tbody>
                      {product.specifications.slice(0, 2).map((spec, i) => {
                        const [key, val] = spec.split(":");
                        return (
                          <tr key={i} className="border-b border-stroke-soft">
                            <td className="py-1.5 text-text-slate">{key}</td>
                            <td className="py-1.5 text-right font-mono font-bold text-deep-obsidian">{val}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center border-t border-stroke-soft pt-4 mt-2">
                  <div>
                    <p className="text-[9px] text-text-slate font-black uppercase tracking-wider">Estimated Price</p>
                    <p className="font-headline text-base font-extrabold text-deep-obsidian">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(product.price)}
                    </p>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    View Specs
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Installation Section */}
      <section className="py-20 px-4 md:px-margin-desktop bg-white border-b border-stroke-soft">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-headline text-xs font-bold text-primary mb-4 block uppercase tracking-widest">
              EXPERT DEPLOYMENT
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-deep-obsidian mb-6 leading-tight">
              Professional Installation &amp; Project Support
            </h2>
            <p className="font-body text-base text-text-slate mb-8 leading-relaxed">
              We don&apos;t just sell hardware; we provide end-to-end infrastructure partnership. Our certified engineers handle everything for you.
            </p>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl border border-stroke-soft">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">Site Survey &amp; Load Profiling</h4>
                  <p className="text-xs text-text-slate mt-0.5">
                    Precise measurement of your home or office energy consumption patterns and structural integrity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl border border-stroke-soft">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">Permit &amp; Compliance Support</h4>
                  <p className="text-xs text-text-slate mt-0.5">
                    Navigating local utility regulations for you.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl border border-stroke-soft">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">10-Year Performance Warranty</h4>
                  <p className="text-xs text-text-slate mt-0.5">
                    Comprehensive protection for your investment, backed by industry-leading support teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-stroke-soft bg-slate-100">
              <img
                src="/engineers.png"
                alt="Solar Installation Team"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Transition CTA */}
      <section id="audit" className="py-20 px-4 md:px-margin-desktop bg-slate-surface">
        <div className="max-w-container-max mx-auto bg-deep-obsidian rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sunlight-amber to-transparent z-0 pointer-events-none" />
          <div className="relative z-10 p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl text-white font-extrabold mb-6">
                Start Your Transition Today
              </h2>
              <p className="font-body text-base text-slate-300 mb-8 max-w-md leading-relaxed">
                Request a comprehensive energy audit and custom infrastructure proposal. Our energy design team will contact you within 24 hours to begin the load analysis phase.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle className="w-5 h-5 text-sunlight-amber" />
                  Free site assessment and power load calculation
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle className="w-5 h-5 text-sunlight-amber" />
                  Clear cost breakdown and expected energy savings
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle className="w-5 h-5 text-sunlight-amber" />
                  Expert advice on beating grid instability and blackouts
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
              <h3 className="font-headline text-lg font-bold text-deep-obsidian mb-6">Consultation Request</h3>
              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-eco-emerald">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-deep-obsidian">Request Submitted Successfully</h4>
                    <p className="text-xs text-text-slate mt-1.5 max-w-xs mx-auto">
                      Thank you, Adebayo. Our engineering team has received your facility details and will reach out shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        required
                        className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-11 px-3 text-sm outline-none bg-slate-surface text-deep-obsidian"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-11 px-3 text-sm outline-none bg-slate-surface text-deep-obsidian"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@email.com"
                      required
                      className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-11 px-3 text-sm outline-none bg-slate-surface text-deep-obsidian"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Property Type</label>
                    <select
                      value={formData.facilityType}
                      onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                      className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-11 px-3 text-sm outline-none bg-slate-surface text-deep-obsidian"
                    >
                      <option>Home</option>
                      <option>Office Building</option>
                      <option>Warehouse / Industrial</option>
                      <option>Retail / Commercial</option>
                      <option>Data Center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Est. Monthly Load (kWh)</label>
                    <input
                      type="number"
                      value={formData.monthlyLoad}
                      onChange={(e) => setFormData({ ...formData, monthlyLoad: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-11 px-3 text-sm outline-none bg-slate-surface text-deep-obsidian"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-deep-obsidian hover:bg-black text-white font-bold py-3.5 rounded-lg mt-4 transition-all hover:shadow-lg active:scale-[0.98] text-sm cursor-pointer"
                  >
                    Schedule Engineering Audit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </LayoutShell>
  );
}
