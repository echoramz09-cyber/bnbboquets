/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Menu, Search, Heart, X, ChevronRight } from "lucide-react";
import { useSiteSettings } from "../hooks/useLiveContent";

export function Header() {
  const settings = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-beige-100 border-b border-beige-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-beige-900 bg-beige-200/80 hover:bg-beige-200 border border-beige-300/50 rounded-lg transition-colors shadow-xs" 
              id="mobile-menu-toggle"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <a href="#" className="text-xl sm:text-3xl md:text-5xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-center truncate max-w-[200px] sm:max-w-none">
              {settings?.logo || "bright n bliss"} bouquets
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-600 transition-colors">Shop</a>
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-600 transition-colors">About</a>
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-600 transition-colors">Contact</a>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button className="p-1.5 text-beige-900 hover:text-beige-600 transition-colors" id="search-btn" aria-label="Search">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="hidden sm:block p-1.5 text-beige-900 hover:text-beige-600 transition-colors" id="wishlist-btn" aria-label="Wishlist">
              <Heart size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="relative p-1.5 text-beige-900 hover:text-beige-600 transition-colors" id="cart-btn" aria-label="Cart">
              <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 bg-[#5d4037] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-sans font-bold">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            {/* Menu Content */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs h-full bg-[#FFF7E6] p-6 flex flex-col justify-between shadow-2xl border-r border-beige-300 opacity-100 z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-beige-200">
                  <span className="text-xl font-signature text-beige-900 lowercase">
                    {settings?.logo || "bright n bliss"}
                  </span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-beige-900 hover:bg-beige-200/50 rounded-lg"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="mt-8 flex flex-col space-y-4">
                  <a 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Shop All</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                  <a 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>About Us</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                  <a 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Contact</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                  <a 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 text-sm font-medium tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Wishlist</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                </nav>
              </div>

              <div className="pt-6 border-t border-beige-200">
                <p className="text-[10px] uppercase tracking-widest text-beige-900/50 text-center">
                  Handcrafted with Love
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
