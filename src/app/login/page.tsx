"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Eye, EyeOff, Bolt, Check } from "lucide-react";
import Link from "next/link";
import LayoutShell from "../../components/shared/LayoutShell";
import { useAuthStore } from "../../store/authStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = "/dashboard";

  const { login, user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.role === "SUPER_ADMIN" ? "/admin" : redirect);
    }
  }, [user, redirect, router]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      triggerToast("Passwords do not match");
      return;
    }
    setSubmitting(true);
    
    // Simulate auth check matching the email domain
    try {
      const isAdminEmail = email.toLowerCase().includes("admin");
      const role = isAdminEmail ? "SUPER_ADMIN" : "CUSTOMER";
      await login(role);
      
      triggerToast(`Successfully logged in as ${role === "SUPER_ADMIN" ? "Administrator" : "Customer"}`);
      router.push(role === "SUPER_ADMIN" ? "/admin" : redirect);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Instant simulation triggers
  const handleSimulateLogin = async (role: "CUSTOMER" | "SUPER_ADMIN") => {
    setSubmitting(true);
    try {
      await login(role);
      triggerToast(`Simulated login: ${role === "SUPER_ADMIN" ? "Super Admin" : "Customer Adebayo"}`);
      router.push(role === "SUPER_ADMIN" ? "/admin" : redirect);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LayoutShell>
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-obsidian text-white px-5 py-4 rounded-xl border border-stroke-soft shadow-2xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-eco-emerald flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="flex-grow flex items-center justify-center py-12 px-4 bg-slate-surface">
        <div className="max-w-md w-full bg-white border border-stroke-soft rounded-3xl shadow-xl overflow-hidden p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SolarShopoffice Ltd"
                className="h-10 w-auto object-contain"
              />
            </div>
            <h2 className="font-headline text-2xl font-black text-deep-obsidian">
              {isRegister ? "Create Account" : "Enter login details"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-text-slate">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required={isRegister}
                      className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required={isRegister}
                      className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kola@solarshopoffice.com"
                  required
                  className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-3 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-10 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-slate hover:text-deep-obsidian"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required={isRegister}
                    className="w-full border border-stroke-soft rounded-lg h-11 pl-10 pr-10 text-sm bg-slate-surface focus:ring-1 focus:ring-sunlight-amber text-deep-obsidian outline-none font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-deep-obsidian hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              {submitting ? "Signing in..." : isRegister ? "Create Account" : "Secure Log In"}
            </button>
          </form>



          <div className="text-center pt-2">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              {isRegister ? "Already registered? Log in" : "Not Yet Registered? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-surface text-text-slate">
        Loading authentication...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
