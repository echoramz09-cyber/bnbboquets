/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";
import { useSiteSettings } from "../hooks/useLiveContent";

export function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-beige-100 text-beige-900 pt-10 pb-8 border-t border-beige-900/10 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-center md:text-left">
          {/* Brand Info */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-left">
              {settings?.logo || "bright n bliss"} bouquets
            </h2>
            <p className="text-beige-900/60 text-xs mt-1 max-w-md">
              {settings?.footer?.tagline || "Handcrafted floral arrangements made with love for every special moment."}
            </p>
          </div>

          {/* Clean Essential Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold tracking-wider uppercase text-beige-900/80">
            <Link to="/" className="hover:text-[#5d4037] transition-colors">
              Shop All
            </Link>
            <Link to="/contact" className="hover:text-[#5d4037] transition-colors flex items-center space-x-1">
              <span>Contact Us</span>
            </Link>
            <a
              href="https://wa.me/919864074004?text=Hi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#128C7E] hover:text-[#0e6f64] transition-colors flex items-center space-x-1 font-bold"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Chat</span>
            </a>
            <Link to="/admin" className="text-beige-900/50 hover:text-beige-900 transition-colors">
              Admin Access
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-beige-900/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-beige-900/50 gap-2 text-center">
          <p>{settings?.footer?.copyright || "© 2026 Bright N Bliss Bouquets. All Rights Reserved."}</p>
          <p className="flex items-center space-x-1">
            <span>Handcrafted with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
