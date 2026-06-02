"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Wrench, Shield, Check, MapPin, Truck, HelpCircle, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import LayoutShell from "../../../components/shared/LayoutShell";
import { useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { MOCK_PRODUCTS } from "../../../lib/mockData";
import { Product } from "../../../types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetails({ params }: PageProps) {
  const router = useRouter();
  
  // Resolve params using React.use
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  // Cart/Wishlist Stores hooks
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // State Management
  const [selectedQty, setSelectedQty] = useState(1);
  const [installSelected, setInstallSelected] = useState(false);
  const [pickupOption, setPickupOption] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review states
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittedReview, setSubmittedReview] = useState(false);

  // Monitor Scroll for Sticky Purchase Bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setStickyBarVisible(true);
      } else {
        setStickyBarVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) {
    return (
      <LayoutShell>
        <div className="py-24 text-center space-y-4 max-w-md mx-auto">
          <HelpCircle className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-headline text-2xl font-bold text-deep-obsidian">Product Not Found</h2>
          <p className="text-sm text-text-slate">
            The solar component or energy hardware you are looking for does not exist in our catalog.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-deep-obsidian hover:bg-black text-white font-bold rounded-xl text-sm transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity: selectedQty,
      installationSelected: installSelected,
      pickupOption: pickupOption
    });
    triggerToast(`Added ${selectedQty}x ${product.name} to Cart`);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    triggerToast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setSubmittedReview(true);
    setTimeout(() => {
      setSubmittedReview(false);
      setReviewName("");
      setReviewComment("");
    }, 5000);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(val);
  };

  // Get related products (same category, excluding current one)
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  // Estimate delivery/pickup timeline
  const getTimeline = () => {
    if (pickupOption) return "Available for pickup in 2 business days (Mon-Fri)";
    return "Estimated delivery: 3-5 business days";
  };

  return (
    <LayoutShell>
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs navigation */}
      <div className="bg-slate-surface px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto w-full border-b border-stroke-soft flex items-center gap-2 text-xs font-semibold text-text-slate">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-deep-obsidian truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product Information Grid */}
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Block: Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-stroke-soft relative group">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <span className="absolute top-4 left-4 bg-deep-obsidian text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {product.sku}
              </span>
            </div>

            {/* Alternates list */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`aspect-square bg-white rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      activeImageIdx === i ? "border-2 border-primary" : "border-stroke-soft hover:border-primary-container"
                    }`}
                  >
                    <img src={img} alt="details" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Block: Purchase Config */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-eco-emerald text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                In Stock &amp; Performance Guaranteed
              </div>
              <h1 className="font-headline text-3xl font-extrabold text-deep-obsidian leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-sunlight-amber text-sunlight-amber" />
                <span className="text-sm font-bold text-deep-obsidian">{product.rating}</span>
                <span className="text-xs text-text-slate">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 border-b border-stroke-soft pb-6">
              <span className="font-headline text-3xl font-black text-deep-obsidian">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-text-slate">Excluding VAT</span>
            </div>

            {/* Config: Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-slate uppercase tracking-wider mb-2">Quantity</label>
                <div className="flex items-center gap-3 border border-stroke-soft rounded-xl p-1 bg-white w-fit shadow-sm">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="p-2 hover:bg-slate-surface rounded-lg transition-colors text-text-slate hover:text-deep-obsidian cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold font-mono px-3 w-8 text-center">{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty(selectedQty + 1)}
                    className="p-2 hover:bg-slate-surface rounded-lg transition-colors text-text-slate hover:text-deep-obsidian cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Certified Partner Installation toggle */}
              {product.installationFee && (
                <div className="bg-white border border-stroke-soft rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline text-sm font-bold text-deep-obsidian flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-sunlight-amber" />
                      Engineering Installation
                    </h3>
                    <span className="text-[10px] font-black text-eco-emerald bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      Certified Crew
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setInstallSelected(true)}
                      className={`w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all cursor-pointer ${
                        installSelected 
                          ? "border-2 border-primary bg-amber-50/10" 
                          : "border-stroke-soft hover:bg-slate-surface"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        {installSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-xs text-deep-obsidian">Standard Professional Install</p>
                        <p className="text-[10px] text-text-slate mt-0.5">Includes site safety, load profiling, permit handling &amp; 10yr warranty.</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary shrink-0">
                        +{formatPrice(product.installationFee)}/ea
                      </span>
                    </button>

                    <button
                      onClick={() => setInstallSelected(false)}
                      className={`w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all cursor-pointer ${
                        !installSelected 
                          ? "border-2 border-primary bg-amber-50/10" 
                          : "border-stroke-soft hover:bg-slate-surface"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                        {!installSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-xs text-deep-obsidian">Hardware-Only Purchase</p>
                        <p className="text-[10px] text-text-slate mt-0.5">Self-deployment or separate engineering contractor.</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-text-slate shrink-0">
                        +₦0
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery vs Pickup Selection */}
              <div className="bg-white border border-stroke-soft rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline text-sm font-bold text-deep-obsidian flex items-center gap-2">
                    {pickupOption ? <MapPin className="w-4 h-4 text-sunlight-amber" /> : <Truck className="w-4 h-4 text-sunlight-amber" />}
                    Fulfillment Method
                  </h3>
                </div>

                <div className="flex bg-slate-surface rounded-xl p-1 border border-stroke-soft">
                  <button
                    onClick={() => setPickupOption(false)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                      !pickupOption 
                        ? "bg-deep-obsidian text-white" 
                        : "text-text-slate hover:text-deep-obsidian"
                    }`}
                  >
                    Home Delivery
                  </button>
                  <button
                    onClick={() => setPickupOption(true)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                      pickupOption 
                        ? "bg-deep-obsidian text-white" 
                        : "text-text-slate hover:text-deep-obsidian"
                    }`}
                  >
                    Warehouse Pickup
                  </button>
                </div>

                <p className="text-xs text-text-slate bg-surface-container-low p-3 rounded-lg border border-stroke-soft text-center font-medium">
                  {getTimeline()}
                </p>
              </div>

              {/* Main Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-grow bg-deep-obsidian hover:bg-black text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`w-14 h-14 border rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer ${
                    wishlisted 
                      ? "bg-red-50 border-red-200 text-red-500" 
                      : "bg-white border-stroke-soft text-text-slate hover:text-red-500"
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Custom Efficiency Gauge */}
            {product.specifications.some(s => s.toLowerCase().includes("efficiency")) && (
              <div className="border-t border-stroke-soft pt-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-text-slate">
                  <span>EFFICIENCY RATIO</span>
                  <span className="text-eco-emerald">
                    {product.specifications.find(s => s.toLowerCase().includes("efficiency"))?.split(":")[1] || "22.3%"}
                  </span>
                </div>
                <div className="w-full bg-slate-surface h-3 rounded-full overflow-hidden border border-stroke-soft">
                  <div className="bg-eco-emerald h-full w-[88%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                </div>
                <p className="text-[10px] text-text-slate">Class-leading energy density in standard environments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Technical specs & warranty information */}
        <section className="py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 border-t border-stroke-soft border-dashed">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-headline text-xl font-bold text-deep-obsidian">Technical Specification Sheet</h3>
            <div className="bg-white rounded-2xl border border-stroke-soft overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-deep-obsidian text-white text-xs">
                    <th className="px-6 py-4 font-headline uppercase tracking-wider">Parameter</th>
                    <th className="px-6 py-4 font-headline uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {product.specifications.map((spec, i) => {
                    const [key, val] = spec.split(":");
                    return (
                      <tr key={i} className={`border-b border-stroke-soft ${i % 2 === 0 ? "bg-white" : "bg-slate-surface"}`}>
                        <td className="px-6 py-3.5 text-deep-obsidian">{key}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-text-slate">{val}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-surface">
                    <td className="px-6 py-3.5 text-deep-obsidian">Product SKU</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-text-slate">{product.sku}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-stroke-soft flex gap-4">
                <Shield className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-deep-obsidian">{product.warranty}</h4>
                  <p className="text-xs text-text-slate mt-1">
                    Guaranteed performance output curves backed by certified engineering checks.
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-stroke-soft flex gap-4">
                <ShieldCheck className="w-8 h-8 text-eco-emerald shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-deep-obsidian">Carbon Neutral Materials</h4>
                  <p className="text-xs text-text-slate mt-1">
                    Environmentally conscious hardware lifecycle with sustainable disposal guarantees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Helper Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-headline text-sm font-bold text-deep-obsidian">Why Choose SolarShopOffice?</h3>
              <ul className="space-y-3 text-xs text-text-slate">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-eco-emerald shrink-0" />
                  Sleek matte-black industrial designs
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-eco-emerald shrink-0" />
                  Certified engineering installation network
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-eco-emerald shrink-0" />
                  Rooftop design simulation mapping support
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-eco-emerald shrink-0" />
                  Robust safety-optimizations and grid compliance
                </li>
              </ul>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-stroke-soft shadow-sm bg-slate-100 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArZaDlBy84szj9c8wO4CvWz5-Z5pkioHac65j0NhhWFnjrOgsQj5pKzA6JFxWgl3rhrv04LluKFavduC2xmhEcXbiNdqIqwtMGxZFyCG7PslQdg-yhKVkyfmpmyR620zXcP23zekJ_5cj56-KfHNcFAXuvpwgBj-gioenN7XVPgpu7nWsNgHKDWOr0wjdY13t_CYe2dwElfK3vTuGkvkHKy2MMMlNI5UDBjojmOLQqn4vUPsIQ__dghJVeONckUQGulBvQaA-22Dg"
                alt="Installer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-obsidian via-deep-obsidian/40 to-transparent p-6 flex flex-col justify-end text-white">
                <h4 className="font-bold text-base">Need customized engineering?</h4>
                <p className="text-xs opacity-90 mt-1 mb-4 leading-normal">
                  Our structural engineers can model your factory, office, or residential roof configurations remotely.
                </p>
                <Link
                  href="/#audit"
                  className="bg-sunlight-amber hover:bg-amber-500 text-deep-obsidian py-3 rounded-xl font-bold text-xs text-center block"
                >
                  Book Free Project Design
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-12 border-t border-stroke-soft border-dashed">
          <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-6">Customer Reviews</h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Reviews Summary */}
            <div className="lg:col-span-4 bg-white border border-stroke-soft rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <p className="text-xs text-text-slate font-bold uppercase tracking-wider">Average Rating</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline text-3xl font-black text-deep-obsidian">{product.rating}</span>
                  <span className="text-sm text-text-slate">/ 5.0</span>
                </div>
                <div className="flex text-sunlight-amber mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? "fill-sunlight-amber text-sunlight-amber" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-slate mt-2">{product.reviewsCount} customer review ratings</p>
              </div>

              {/* Review Input Box */}
              <div className="border-t border-stroke-soft pt-4">
                <h4 className="font-bold text-xs text-deep-obsidian uppercase tracking-wider mb-3">Submit Review</h4>
                {submittedReview ? (
                  <p className="text-xs text-eco-emerald font-semibold bg-emerald-50 p-3 rounded-lg text-center">
                    Review submitted successfully. Thank you for your feedback!
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text-slate uppercase tracking-wider mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Adebayo K."
                        required
                        className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs outline-none bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-slate uppercase tracking-wider mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full border border-stroke-soft rounded-lg h-9 px-3 text-xs outline-none bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian"
                      >
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Poor)</option>
                        <option value="1">1 Star (Very Bad)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-slate uppercase tracking-wider mb-1">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Works perfectly, high output..."
                        rows={3}
                        required
                        className="w-full border border-stroke-soft rounded-lg p-2 text-xs outline-none bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-deep-obsidian text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Review List */}
            <div className="lg:col-span-8 space-y-4">
              {[
                {
                  author: "Engr. Emeka A.",
                  rating: 5,
                  date: "2026-05-10",
                  comment: "Installed 30 units of these panels for a corporate office site survey project. Measured efficiency yields averages 22.1% under bright Lagos sunlight. Incredible build quality, the dual glass makes it highly rigid."
                },
                {
                  author: "Fatima B.",
                  rating: 4,
                  date: "2026-04-28",
                  comment: "Very elegant design, looks beautiful on our rooftop slate. Installation was handled professionally. Highly recommended hardware."
                }
              ].map((rev, i) => (
                <div key={i} className="bg-white border border-stroke-soft rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-deep-obsidian">{rev.author}</span>
                    <span className="text-[10px] text-text-slate">{rev.date}</span>
                  </div>
                  <div className="flex text-sunlight-amber">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < rev.rating ? "fill-sunlight-amber text-sunlight-amber" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-slate leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t border-stroke-soft border-dashed">
            <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-6">Related Energy Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  href={`/product/${p.slug}`}
                  key={p.id}
                  className="group bg-white border border-stroke-soft rounded-2xl p-4 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-stroke-soft">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h4 className="font-headline font-bold text-xs text-deep-obsidian truncate group-hover:text-primary transition-colors">
                      {p.name}
                    </h4>
                    <p className="font-mono text-[9px] text-text-slate">{p.sku}</p>
                    <p className="font-bold text-xs text-deep-obsidian pt-1">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Purchase bar for long scroll conversion */}
      {stickyBarVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stroke-soft py-3 px-4 md:px-margin-desktop shadow-2xl z-40 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-container-max mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-10 h-10 object-cover rounded border border-stroke-soft hidden sm:block shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-deep-obsidian truncate max-w-[200px] sm:max-w-xs">{product.name}</p>
                <p className="text-xs font-mono font-black text-primary">{formatPrice(product.price)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stroke-soft rounded-lg bg-white overflow-hidden shadow-sm shrink-0">
                <button
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="px-2 py-1 text-xs text-text-slate hover:text-deep-obsidian hover:bg-slate-surface cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 font-mono text-xs font-bold">{selectedQty}</span>
                <button
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="px-2 py-1 text-xs text-text-slate hover:text-deep-obsidian hover:bg-slate-surface cursor-pointer"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-deep-obsidian hover:bg-black text-white px-6 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
