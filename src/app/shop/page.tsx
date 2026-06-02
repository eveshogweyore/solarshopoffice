"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid, List, Search, Star, Heart, Check, Trash2, SlidersHorizontal, ShieldCheck, AlertCircle, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import LayoutShell from "../../components/shared/LayoutShell";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { MOCK_PRODUCTS } from "../../lib/mockData";
import { Product } from "../../types";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Search parameters parsing
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<number>(9000000); // Max Naira price
  const [selectedWattages, setSelectedWattages] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update states if query parameters change
  useEffect(() => {
    setCategoryFilter(searchParams.get("category") || "all");
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Handle Quick Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (product: Product) => {
    addToCart({
      productId: product.id,
      quantity: 1,
      installationSelected: false,
      pickupOption: false
    });
    triggerToast(`Added ${product.name} to Cart`);
  };

  const handleWishlistToggle = (product: Product) => {
    toggleWishlist(product.id);
    const added = isInWishlist(product.id);
    triggerToast(added ? `Saved ${product.name} to Wishlist` : `Removed ${product.name} from Wishlist`);
  };

  const handleWattageChange = (range: string) => {
    if (selectedWattages.includes(range)) {
      setSelectedWattages(selectedWattages.filter((w) => w !== range));
    } else {
      setSelectedWattages([...selectedWattages, range]);
    }
  };

  const handleBrandChange = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setSearchQuery("");
    setPriceRange(9000000);
    setSelectedWattages([]);
    setSelectedBrands([]);
    setSortBy("popular");
    router.push("/shop");
  };

  // Filter and sort catalog products
  let filteredProducts = MOCK_PRODUCTS.filter((product) => {
    // Category Filter
    if (categoryFilter !== "all" && product.category !== categoryFilter) {
      return false;
    }
    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSku) return false;
    }
    // Price Range Filter
    if (product.price > priceRange) {
      return false;
    }
    // Wattage Filter (Parsing specifications for wattage)
    if (selectedWattages.length > 0) {
      const specText = product.specifications.join(" ").toLowerCase();
      const matchesWattage = selectedWattages.some((w) => {
        if (w === "300w-350w") return specText.includes("300w") || specText.includes("310w") || specText.includes("320w") || specText.includes("330w") || specText.includes("340w") || specText.includes("350w");
        if (w === "350w-400w") return specText.includes("360w") || specText.includes("370w") || specText.includes("380w") || specText.includes("390w") || specText.includes("400w");
        if (w === "400w-450w") return specText.includes("410w") || specText.includes("420w") || specText.includes("430w") || specText.includes("440w") || specText.includes("445w") || specText.includes("450w");
        if (w === "450w+") return specText.includes("500w") || specText.includes("550w") || specText.includes("600w");
        return false;
      });
      if (!matchesWattage) return false;
    }
    // Brand Filter
    if (selectedBrands.length > 0) {
      const matchBrand = selectedBrands.some((b) => 
        product.name.toLowerCase().includes(b.toLowerCase()) || 
        product.sku.toLowerCase().includes(b.toLowerCase())
      );
      if (!matchBrand) return false;
    }

    return true;
  });

  // Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    // Popular
    return b.reviewsCount - a.reviewsCount;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
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

      {/* Featured Banner at top */}
      <div className="bg-slate-surface px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl bg-deep-obsidian h-[240px] group border border-slate-800">
          <div className="absolute inset-0 z-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtzfhL7V3qdL-xLMze85QxDZiEJ_-2lIQXRSeoeA5oLf610iIuaWxKa5CWUJ364OOtNiuirTyzJVOctmTUdZGZ3zgD-VraAh8VjTGSZ1vrTlllqkbnoppDZuZVjdC48jdIf3c0MWoUGjwx-yZgu_O609cnwRJKPEsgIdzbj6xAp50u7Flq5HsiJ86iIfVj1hoVOKG0QsfROrAChDf1lkbzA-NdNy9su7-4qU3Evqv1OmsFxLhOMJJT7iJW9U9-80m59bIYlb-cwzU"
              alt="Premium Solar Infrastructure Array"
              className="w-full h-full object-cover opacity-45 group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-deep-obsidian/90 via-deep-obsidian/50 to-transparent" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sunlight-amber text-deep-obsidian font-headline text-[10px] font-black rounded-full w-fit mb-3">
              <Star className="w-3.5 h-3.5 fill-deep-obsidian text-deep-obsidian" />
              FEATURED HARDWARE
            </span>
            <h2 className="font-headline text-2xl md:text-3xl text-white font-extrabold mb-2">Vertex S+ 445W Panel</h2>
            <p className="text-slate-300 font-body text-xs md:text-sm mb-4 leading-normal">
              Maximize solar panel efficiency to 22.3% using dual-glass N-Type Monocrystalline cells. Built-in 25-Year warranty.
            </p>
            <Link
              href="/product/vertex-s-plus-445w"
              className="bg-sunlight-amber hover:bg-amber-500 text-deep-obsidian px-5 py-2.5 rounded-lg font-bold text-xs w-fit transition-all active:scale-95 cursor-pointer"
            >
              Configure Specifications
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop flex gap-8 py-8 w-full">
        {/* Filter Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-2 hide-scrollbar">
          <div className="flex items-center justify-between border-b border-stroke-soft pb-4 mb-6">
            <h3 className="font-headline text-base font-bold text-deep-obsidian">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            {/* Category selection */}
            <div>
              <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-2 text-sm font-medium">
                {[
                  { name: "All Products", slug: "all" },
                  { name: "Solar Panels", slug: "panels" },
                  { name: "Battery Cabinets", slug: "batteries" },
                  { name: "Phase Inverters", slug: "inverters" },
                  { name: "EV Chargers", slug: "chargers" },
                  { name: "Mounting Gear", slug: "mounting" }
                ].map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setCategoryFilter(cat.slug)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                      categoryFilter === cat.slug
                        ? "bg-surface-container text-primary font-bold"
                        : "text-text-slate hover:text-deep-obsidian hover:bg-slate-surface"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="border-t border-stroke-soft pt-6">
              <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">Max Price</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="300000"
                  max="9000000"
                  step="100000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-stroke-soft rounded-lg appearance-none cursor-pointer accent-sunlight-amber"
                />
                <div className="flex justify-between items-center text-xs font-mono font-bold text-deep-obsidian">
                  <span>₦300K</span>
                  <span className="bg-white border border-stroke-soft rounded px-2.5 py-1 text-primary">
                    {formatPrice(priceRange)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wattage capacity */}
            <div className="border-t border-stroke-soft pt-6">
              <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">Wattage</h4>
              <div className="space-y-2">
                {[
                  { label: "300W - 350W", value: "300w-350w" },
                  { label: "350W - 400W", value: "350w-400w" },
                  { label: "400W - 450W", value: "400w-450w" },
                  { label: "450W+", value: "450w+" }
                ].map((w) => (
                  <label key={w.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedWattages.includes(w.value)}
                      onChange={() => handleWattageChange(w.value)}
                      className="rounded border-stroke-soft text-sunlight-amber focus:ring-sunlight-amber cursor-pointer w-4.5 h-4.5"
                    />
                    <span className={`text-xs text-text-slate group-hover:text-deep-obsidian transition-colors ${
                      selectedWattages.includes(w.value) ? "text-primary font-bold" : ""
                    }`}>
                      {w.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands checkboxes */}
            <div className="border-t border-stroke-soft pt-6">
              <h4 className="text-xs font-black text-text-slate uppercase tracking-wider mb-3">Brand</h4>
              <div className="space-y-2">
                {[
                  { name: "Vertex", value: "Vertex" },
                  { name: "Bifacial", value: "Bifacial" },
                  { name: "PowerStack", value: "PowerStack" },
                  { name: "Symo / Fronius", value: "Symo" },
                  { name: "Terra / ABB", value: "Terra" }
                ].map((brand) => (
                  <label key={brand.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.value)}
                      onChange={() => handleBrandChange(brand.value)}
                      className="rounded border-stroke-soft text-sunlight-amber focus:ring-sunlight-amber cursor-pointer w-4.5 h-4.5"
                    />
                    <span className={`text-xs text-text-slate group-hover:text-deep-obsidian transition-colors ${
                      selectedBrands.includes(brand.value) ? "text-primary font-bold" : ""
                    }`}>
                      {brand.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Catalog Main Panel */}
        <section className="flex-grow">
          {/* Catalog Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stroke-soft pb-4 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <span className="font-headline text-lg font-bold text-deep-obsidian">
                {filteredProducts.length}
              </span>
              <span className="text-sm text-text-slate">hardware components found</span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Grid / List toggle */}
              <div className="flex border border-stroke-soft rounded-lg overflow-hidden bg-white shadow-sm shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-slate-surface text-primary" : "text-text-slate hover:text-deep-obsidian"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 cursor-pointer transition-colors ${
                    viewMode === "list" ? "bg-slate-surface text-primary" : "text-text-slate hover:text-deep-obsidian"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sorting Selection */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-stroke-soft rounded-lg px-3 py-2 text-xs font-semibold text-deep-obsidian focus:ring-1 focus:ring-sunlight-amber focus:border-sunlight-amber shadow-sm outline-none cursor-pointer"
              >
                <option value="popular">Sort: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: Highest</option>
              </select>
            </div>
          </div>

          {/* Search indicator */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-6 bg-surface-container-low px-4 py-2 rounded-lg text-xs font-semibold text-deep-obsidian w-fit">
              <Search className="w-3.5 h-3.5 text-text-slate" />
              Showing results for &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => {
                  setSearchQuery("");
                  router.push("/shop");
                }}
                className="text-text-slate hover:text-red-500 ml-2 font-black cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center border border-stroke-soft bg-white rounded-2xl max-w-md mx-auto space-y-4 px-6">
              <AlertCircle className="w-12 h-12 text-primary mx-auto" />
              <div>
                <h4 className="font-bold text-deep-obsidian">No Systems Match Filters</h4>
                <p className="text-xs text-text-slate mt-1">
                  Adjust your search parameters, increase the max price limit, or clear options.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-deep-obsidian text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Product grid / list render */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const wishlisted = isInWishlist(product.id);
                return (
                  <div
                    key={product.id}
                    className="group bg-white border border-stroke-soft rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 border-b border-stroke-soft">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`absolute top-4 right-4 p-2 rounded-full border shadow-sm transition-all duration-200 cursor-pointer ${
                          wishlisted
                            ? "bg-red-50 border-red-200 text-red-500"
                            : "bg-white border-stroke-soft text-text-slate hover:text-red-500"
                        }`}
                        aria-label="Add to wishlist"
                      >
                        <Heart className={`w-4.5 h-4.5 ${wishlisted ? "fill-red-500" : ""}`} />
                      </button>

                      {/* Stock badge */}
                      <span className="absolute top-4 left-4 text-[9px] font-black text-white px-2 py-0.5 rounded bg-eco-emerald tracking-wide">
                        IN STOCK
                      </span>

                      {/* Direct Add to Cart Button */}
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="absolute bottom-4 right-4 bg-sunlight-amber text-deep-obsidian p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label="Quick add to cart"
                      >
                        <Plus className="w-5 h-5 font-bold" />
                      </button>
                    </div>

                    {/* Body content */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Rating row */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3.5 h-3.5 fill-sunlight-amber text-sunlight-amber" />
                          <span className="text-xs font-bold text-deep-obsidian">{product.rating}</span>
                          <span className="text-xs text-text-slate font-medium">({product.reviewsCount})</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-headline font-bold text-deep-obsidian hover:text-primary transition-colors text-sm truncate">
                          <Link href={`/product/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h4>
                        
                        {/* Specifications short table */}
                        <div className="grid grid-cols-2 gap-2 mt-4 border-t border-b border-stroke-soft py-3 border-dashed">
                          {product.specifications.slice(0, 2).map((spec, i) => {
                            const [key, val] = spec.split(":");
                            return (
                              <div key={i} className="flex flex-col">
                                <span className="text-[9px] font-bold text-text-slate uppercase tracking-wider">{key}</span>
                                <span className="text-xs font-mono font-bold text-deep-obsidian mt-0.5 truncate">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="font-headline text-base font-extrabold text-deep-obsidian">
                          {formatPrice(product.price)}
                        </span>
                        
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-primary hover:underline text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          Specs <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const wishlisted = isInWishlist(product.id);
                return (
                  <div
                    key={product.id}
                    className="group bg-white border border-stroke-soft rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row p-4 gap-6 items-center"
                  >
                    {/* Image block */}
                    <div className="w-36 h-36 bg-slate-surface rounded-xl overflow-hidden border border-stroke-soft shrink-0 relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[8px] font-black text-white px-1.5 py-0.5 rounded bg-eco-emerald">
                        IN STOCK
                      </span>
                    </div>

                    {/* Data Details block */}
                    <div className="flex-grow min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-primary uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          <span className="text-text-slate font-mono text-[10px]">{product.sku}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-sunlight-amber text-sunlight-amber" />
                          <span className="text-xs font-bold text-deep-obsidian">{product.rating}</span>
                        </div>
                      </div>

                      <h4 className="font-headline font-bold text-deep-obsidian hover:text-primary text-base truncate">
                        <Link href={`/product/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h4>

                      <p className="text-xs text-text-slate line-clamp-2 max-w-xl">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-1">
                        {product.specifications.slice(0, 3).map((spec, i) => {
                          const [key, val] = spec.split(":");
                          return (
                            <span key={i} className="text-[10px] font-mono text-text-slate border border-stroke-soft bg-slate-surface rounded-md px-2 py-0.5">
                              <span className="font-semibold">{key}:</span> {val}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions and Pricing Block */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-40 border-t sm:border-t-0 sm:border-l border-stroke-soft pt-4 sm:pt-0 sm:pl-6 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-text-slate font-black uppercase tracking-wider">Estimated Price</p>
                        <p className="font-headline text-lg font-black text-deep-obsidian">{formatPrice(product.price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleWishlistToggle(product)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            wishlisted
                              ? "bg-red-50 border-red-200 text-red-500"
                              : "bg-white border-stroke-soft text-text-slate hover:text-red-500"
                          }`}
                          aria-label="Add to wishlist"
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="px-4 py-2 bg-deep-obsidian hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:shadow shadow-sm active:scale-95 cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </LayoutShell>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-surface text-text-slate">
        Loading catalog...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
