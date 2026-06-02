"use client";

import React, { useState } from "react";
import LayoutShell from "../../components/shared/LayoutShell";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <LayoutShell>
      <section className="pt-32 pb-20 px-4 md:px-margin-desktop bg-slate-surface min-h-[80vh]">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <span className="font-headline text-xs font-bold text-primary mb-4 block uppercase tracking-widest">
              GET IN TOUCH
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-deep-obsidian mb-6 leading-tight">
              Let's Build Your Energy Infrastructure
            </h1>
            <p className="font-body text-base text-text-slate mb-10 leading-relaxed max-w-md">
              Whether you need a comprehensive energy audit or support with your existing installation, our engineering team is ready to assist.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-white p-4 rounded-xl border border-stroke-soft shadow-sm">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">Phone Support</h4>
                  <p className="text-sm text-text-slate mt-1">+234 704 941 7267</p>
                  <p className="text-xs text-text-slate mt-0.5">Mon-Fri, 9am - 6pm WAT</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white p-4 rounded-xl border border-stroke-soft shadow-sm">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">Email Inquiries</h4>
                  <p className="text-sm text-text-slate mt-1">support@solarshopoffice.com</p>
                  <p className="text-xs text-text-slate mt-0.5">We aim to respond within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-4 rounded-xl border border-stroke-soft shadow-sm">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold text-deep-obsidian">Corporate Headquarters</h4>
                  <p className="text-sm text-text-slate mt-1">66, Old Abeokuta Road</p>
                  <p className="text-xs text-text-slate mt-0.5">Agege, Lagos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stroke-soft">
            <h3 className="font-headline text-xl font-bold text-deep-obsidian mb-6">Send us a Message</h3>
            
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-eco-emerald">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-deep-obsidian">Message Sent</h4>
                  <p className="text-sm text-text-slate mt-2 max-w-xs mx-auto">
                    Thank you for reaching out. A member of our engineering team will get back to you shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-12 px-4 text-sm outline-none bg-slate-surface text-deep-obsidian"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-12 px-4 text-sm outline-none bg-slate-surface text-deep-obsidian"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber h-12 px-4 text-sm outline-none bg-slate-surface text-deep-obsidian"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-slate uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full border border-stroke-soft rounded-lg focus:border-sunlight-amber focus:ring-1 focus:ring-sunlight-amber py-3 px-4 text-sm outline-none bg-slate-surface text-deep-obsidian resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-deep-obsidian hover:bg-black text-white font-bold py-4 rounded-lg mt-2 transition-all hover:shadow-lg active:scale-[0.98] text-sm cursor-pointer"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </LayoutShell>
  );
}
