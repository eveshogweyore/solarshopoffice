"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Search, Heart, Menu, X, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { user, logout } = useAuthStore();
  const { setCartDrawerOpen, setSearchOpen } = useUIStore();

  const handleCartClick = () => {
    // If we are on checkout, don't open drawer, just go to cart
    if (pathname === "/checkout") {
      router.push("/cart");
    } else {
      setCartDrawerOpen(true);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-stroke-soft h-20 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop h-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center cursor-pointer shrink-1 min-w-0">
          <Image
            src="/logo.png"
            alt="SolarShopoffice Ltd"
            width={711}
            height={121}
            className="h-6 sm:h-8 w-auto object-contain max-w-full"
            priority
          />
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {!user && navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-5 py-2 rounded-full font-headline font-bold text-sm transition-all duration-300 group ${
                  isActive 
                    ? "text-deep-obsidian bg-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]" 
                    : "text-slate-500 hover:text-deep-obsidian hover:bg-slate-50"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-sunlight-amber rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                )}
                {!isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-slate-300 rounded-full transition-all duration-300 group-hover:w-4" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => setSearchOpen(true)}
            aria-label="Search Catalog"
            className="p-2.5 text-deep-obsidian hover:bg-surface-container rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <Search className="w-5 h-5" />
          </button>

          {user && user.role === "CUSTOMER" && (
            <Link
              href="/dashboard?tab=wishlist"
              aria-label="View Wishlist"
              className="p-2.5 text-deep-obsidian hover:bg-surface-container rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Heart className="w-5 h-5" />
            </Link>
          )}

          <button
            onClick={handleCartClick}
            aria-label="Open Shopping Cart"
            className="p-2.5 text-deep-obsidian hover:bg-surface-container rounded-full transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-sunlight-amber text-deep-obsidian text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 p-1 pl-2 hover:bg-surface-container rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <div className="w-8 h-8 rounded-full bg-deep-obsidian text-white flex items-center justify-center font-bold text-sm">
                    {user.fullName.charAt(0)}
                  </div>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-stroke-soft py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-stroke-soft">
                      <p className="text-xs text-text-slate">Signed in as</p>
                      <p className="text-sm font-semibold text-deep-obsidian truncate">{user.fullName}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 bg-surface-container-low text-[10px] font-black text-primary rounded-full uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    {user.role === "SUPER_ADMIN" ? (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-deep-obsidian hover:bg-slate-surface transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-text-slate" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-deep-obsidian hover:bg-slate-surface transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-text-slate" />
                        Customer Dashboard
                      </Link>
                    )}
                    <Link
                      href="/dashboard?tab=profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-deep-obsidian hover:bg-slate-surface transition-colors"
                    >
                      <Settings className="w-4 h-4 text-text-slate" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-stroke-soft mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-deep-obsidian text-white rounded-lg text-sm font-semibold hover:bg-black transition-all duration-200 active:scale-95 shadow-sm shadow-slate-900/10 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2.5 text-deep-obsidian hover:bg-surface-container rounded-full md:hidden transition-all duration-200"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-deep-obsidian/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200">
          <div className="w-72 h-full bg-white border-l border-stroke-soft p-6 flex flex-col justify-between ml-auto overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="space-y-6">
              <p className="text-xs font-black text-text-slate uppercase tracking-wider">Menu</p>
              <div className="flex flex-col gap-4">
                {!user && navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-semibold text-lg text-deep-obsidian hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-stroke-soft pt-6 space-y-4">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-deep-obsidian text-white flex items-center justify-center font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-deep-obsidian">{user.fullName}</p>
                      <p className="text-xs text-text-slate truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href={user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-surface-container text-deep-obsidian rounded-xl text-center font-bold text-sm block hover:bg-surface-container-high transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      router.push("/");
                    }}
                    className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-center font-bold text-sm block hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-deep-obsidian text-white rounded-xl text-center font-bold block hover:bg-black transition-colors"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
