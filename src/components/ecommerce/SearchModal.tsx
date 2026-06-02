"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/uiStore";
import { MOCK_PRODUCTS } from "../../lib/mockData";

export default function SearchModal() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, recentSearches, addRecentSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [searchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Filter products based on search term
  const results = query.trim() === ""
    ? []
    : MOCK_PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addRecentSearch(query);
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (term: string) => {
    addRecentSearch(term);
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-deep-obsidian/50 backdrop-blur-md z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-x-4 top-20 max-w-2xl mx-auto bg-white rounded-2xl border border-stroke-soft shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-6 py-5 border-b border-stroke-soft bg-white">
              <Search className="w-5 h-5 text-text-slate" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by SKU, name, or keywords (e.g. LFP, 445W)..."
                className="flex-grow bg-transparent text-deep-obsidian placeholder-text-slate border-none outline-none focus:ring-0 text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-text-slate hover:text-deep-obsidian hover:bg-slate-surface rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-text-slate border border-stroke-soft rounded px-1.5 py-0.5 bg-slate-surface font-mono">
                ESC
              </span>
            </form>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {results.length > 0 ? (
                <div>
                  <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Matching Infrastructure Products ({results.length})
                  </h4>
                  <div className="space-y-3">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSearchOpen(false);
                          router.push(`/product/${product.slug}`);
                        }}
                        className="flex gap-4 p-3 rounded-xl hover:bg-slate-surface border border-transparent hover:border-stroke-soft cursor-pointer transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-slate-surface rounded-lg overflow-hidden border border-stroke-soft flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-bold text-deep-obsidian text-sm truncate">{product.name}</h5>
                            <span className="font-mono text-xs font-bold text-deep-obsidian shrink-0">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                              {product.category}
                            </span>
                            <span className="text-text-slate text-[11px] font-mono truncate">{product.sku}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : query.trim() !== "" ? (
                <div className="py-8 text-center text-text-slate">
                  <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Try searching for alternative keywords like panels, storage, or inverters.</p>
                </div>
              ) : null}

              {/* Recent Searches */}
              {recentSearches.length > 0 && query.trim() === "" && (
                <div>
                  <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">
                    Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        type="button"
                        onClick={() => handleSuggestionClick(search)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-surface border border-stroke-soft hover:border-primary-container text-deep-obsidian text-xs font-medium rounded-lg hover:bg-amber-50/20 transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-text-slate" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links / Categories */}
              {query.trim() === "" && (
                <div>
                  <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">
                    Browse Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Solar Panels", slug: "panels", desc: "Monocrystalline & Bifacial" },
                      { name: "Battery Cabinets", slug: "batteries", desc: "Smart LFP backup power" },
                      { name: "Phase Inverters", slug: "inverters", desc: "Commercial grid-ties" },
                      { name: "EV Wallboxes", slug: "chargers", desc: "Solar smart-charging" }
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleSuggestionClick(cat.slug)}
                        className="flex items-center justify-between p-4 rounded-xl border border-stroke-soft hover:border-primary-container bg-white text-left hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-sm text-deep-obsidian group-hover:text-primary transition-colors">
                            {cat.name}
                          </p>
                          <p className="text-xs text-text-slate mt-0.5">{cat.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-slate group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer shortcut guide */}
            <div className="px-6 py-4 border-t border-stroke-soft bg-slate-surface flex justify-between items-center text-[10px] text-text-slate">
              <span className="flex items-center gap-1">
                Press <CornerDownLeft className="w-3 h-3" /> to search
              </span>
              <span>
                Close clicking anywhere outside or ESC
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
