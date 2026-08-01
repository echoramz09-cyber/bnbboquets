/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { MessageCircle, Phone, Clock, Sparkles, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSiteSettings } from "../hooks/useLiveContent";

export function ContactPage() {
  const settings = useSiteSettings();
  const phoneNumber = "9864074004";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hi`;

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige-100 font-montserrat">
      <Header />

      <main className="flex-grow py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-[#FFF7E6] border-2 border-[#5d4037]/20 rounded-3xl p-6 sm:p-12 shadow-xl text-center space-y-8 relative overflow-hidden"
        >
          {/* Subtle floral background accent */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#128C7E] text-white shadow-lg mx-auto transform -rotate-2 hover:rotate-0 transition-transform">
            <MessageCircle size={42} />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-[#5d4037] bg-beige-200/80 px-3.5 py-1.5 rounded-full border border-beige-300/60">
              <Sparkles size={14} className="text-amber-700" />
              <span>Direct Customer Care</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-beige-900 tracking-tight">
              Contact Us on WhatsApp
            </h1>
            <p className="text-sm sm:text-base text-beige-900/75 max-w-xl mx-auto leading-relaxed">
              Have questions about bouquet availability, custom floral designs, or delivery calculated for your location? Chat directly with our team!
            </p>
          </div>

          {/* Main Action Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#128C7E]/30 shadow-sm max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-center space-x-2 text-[#128C7E] font-bold text-base">
              <Phone size={18} />
              <span>+91 {phoneNumber}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenWhatsApp}
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 cursor-pointer group"
            >
              <MessageCircle size={24} className="group-hover:animate-bounce" />
              <span>Contact on WhatsApp</span>
              <ArrowRight size={20} />
            </motion.button>

            <p className="text-[11px] text-beige-900/60 font-medium">
              Clicking the button will open WhatsApp with <span className="font-bold text-[#128C7E]">"Hi"</span> message ready to send.
            </p>
          </div>

          {/* Features / Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-beige-300/60 text-left">
            <div className="p-4 bg-beige-100/70 rounded-xl border border-beige-200 flex items-start space-x-3">
              <div className="p-2 bg-[#128C7E]/10 text-[#128C7E] rounded-lg shrink-0 mt-0.5">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-beige-900">Instant Replies</h4>
                <p className="text-[11px] text-beige-900/60 leading-snug">Quick response for orders & inquiries</p>
              </div>
            </div>

            <div className="p-4 bg-beige-100/70 rounded-xl border border-beige-200 flex items-start space-x-3">
              <div className="p-2 bg-amber-700/10 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-beige-900">Custom Orders</h4>
                <p className="text-[11px] text-beige-900/60 leading-snug">Customize flowers, colors & cards</p>
              </div>
            </div>

            <div className="p-4 bg-beige-100/70 rounded-xl border border-beige-200 flex items-start space-x-3">
              <div className="p-2 bg-[#5d4037]/10 text-[#5d4037] rounded-lg shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-beige-900">Delivery Details</h4>
                <p className="text-[11px] text-beige-900/60 leading-snug">Delivery fee calculated directly at checkout</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
