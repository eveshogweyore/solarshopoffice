"use client";

import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../ecommerce/CartDrawer";
import SearchModal from "../ecommerce/SearchModal";

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-surface">
      <Navbar />
      
      {/* Spacer for sticky navbar (h-20) */}
      <div className="h-20" />
      
      <main className="flex-grow flex flex-col">{children}</main>
      
      <Footer />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
