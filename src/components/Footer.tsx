/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useLiveContent";

export function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-beige-100 text-beige-900 pt-12 md:pt-24 pb-8 md:pb-12 border-t border-beige-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-signature text-beige-900 lowercase mb-4 sm:mb-6 inline-block scale-x-90 origin-left">
              {settings?.logo || "bright n bliss"} bouquets
            </h2>
            <p className="text-beige-900/60 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
              {settings?.footer?.tagline || "Bringing nature's beauty into your home with artisanal floral arrangements crafted with love."}
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] mb-4 sm:mb-8 text-beige-900/80">Navigation</h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-beige-900/60">
              <li><a href="#" className="hover:text-beige-900 transition-colors">Shop All</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">Gift Cards</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">Wholesale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] mb-4 sm:mb-8 text-beige-900/80">Support</h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-beige-900/60">
              <li><a href="#" className="hover:text-beige-900 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">Care Guide</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-beige-900 transition-colors">Contact Us</a></li>
              <li><Link to="/admin" className="hover:text-beige-900 transition-colors opacity-60 hover:opacity-100 font-medium">Admin Access</Link></li>
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h4 className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] mb-4 sm:mb-8 text-beige-900/80">Newsletter</h4>
            <p className="text-xs sm:text-sm text-beige-900/60 mb-4 sm:mb-6">Join our list for floral inspiration and early access.</p>
            <div className="flex border-b border-beige-900/20 pb-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent border-none text-xs sm:text-sm w-full focus:outline-none placeholder:text-beige-900/30"
              />
              <button className="text-xs font-medium uppercase tracking-widest hover:text-beige-900/80 transition-colors shrink-0 pl-2" id="newsletter-submit">Join</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-beige-900/10 text-[10px] uppercase tracking-widest text-beige-900/40 text-center md:text-left gap-4">
          <p>{settings?.footer?.copyright || "© 2024 Bright N Bliss Bouquets. All Rights Reserved."}</p>
          <div className="flex space-x-6 sm:space-x-8">
            <a href="#" className="hover:text-beige-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-beige-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
