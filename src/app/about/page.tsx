"use client";

import React from "react";
import LayoutShell from "../../components/shared/LayoutShell";
import { Shield, Target, Zap, Globe, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <LayoutShell>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-margin-desktop bg-deep-obsidian overflow-hidden border-b border-stroke-soft">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sunlight-amber/10 to-transparent z-0" />
        <div className="max-w-container-max mx-auto relative z-10 text-center">
          <span className="font-headline text-xs font-bold text-sunlight-amber tracking-widest uppercase mb-4 block">
            Our Mission
          </span>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-white font-extrabold mb-6 leading-tight">
            Engineering the Future of <br className="hidden md:inline" />Energy Independence
          </h1>
          <p className="font-body text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            At SolarShopOffice, we are dedicated to providing high-precision solar infrastructure and intelligent battery storage solutions for homes and businesses across the continent.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 md:px-margin-desktop bg-slate-surface">
        <div className="max-w-container-max mx-auto">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="font-headline text-3xl font-bold text-deep-obsidian mb-4">Our Core Pillars</h2>
            <p className="text-text-slate text-sm leading-relaxed">
              We stand at the intersection of robust hardware engineering and modern software capabilities. Our installations are designed for maximum efficiency and longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stroke-soft hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-sunlight-amber flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-sunlight-amber" />
              </div>
              <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-3">Uncompromising Quality</h3>
              <p className="text-text-slate text-sm leading-relaxed">
                We partner with tier-1 global manufacturers to ensure every panel and battery meets rigorous international hardware standards.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stroke-soft hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-sunlight-amber flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-sunlight-amber" />
              </div>
              <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-3">Precision Engineering</h3>
              <p className="text-text-slate text-sm leading-relaxed">
                Our certified engineers handle everything from roof load analysis to grid commissioning with absolute precision.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stroke-soft hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-sunlight-amber flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-sunlight-amber" />
              </div>
              <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-3">Energy Resilience</h3>
              <p className="text-text-slate text-sm leading-relaxed">
                We build intelligent systems designed specifically to conquer local grid instability and deliver true uninterrupted power.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 md:px-margin-desktop bg-white border-t border-stroke-soft">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-headline text-xs font-bold text-primary mb-4 block uppercase tracking-widest">
              OUR STORY
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-deep-obsidian mb-6 leading-tight">
              Powering Nigerian Homes & Businesses
            </h2>
            <p className="font-body text-base text-text-slate mb-6 leading-relaxed">
              SolarShopOffice was born out of a profound need to deliver reliable, sustainable, and scalable energy solutions. We understand the unique challenges of the African power landscape.
            </p>
            <p className="font-body text-base text-text-slate mb-8 leading-relaxed">
              Over the years, we have scaled our operations from supplying individual residential batteries to deploying massive, multi-megawatt commercial solar farms. Our dedication to post-installation support sets us apart.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-surface border border-stroke-soft flex items-center justify-center">
                  <Globe className="w-5 h-5 text-deep-obsidian" />
                </div>
                <div>
                  <h4 className="font-bold text-deep-obsidian text-lg">100+</h4>
                  <p className="text-xs text-text-slate uppercase tracking-wider font-bold">Deployments</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-surface border border-stroke-soft flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-deep-obsidian" />
                </div>
                <div>
                  <h4 className="font-bold text-deep-obsidian text-lg">99.9%</h4>
                  <p className="text-xs text-text-slate uppercase tracking-wider font-bold">Uptime Avg</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="rounded-2xl overflow-hidden shadow-2xl border border-stroke-soft bg-slate-100 aspect-square">
               <img
                 src="/engineers.png"
                 alt="Engineers working"
                 className="w-full h-full object-cover"
               />
             </div>
          </div>
        </div>
      </section>
    </LayoutShell>
  );
}
