/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ShoppingBag, Menu, Search, Heart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-beige-100/80 backdrop-blur-md border-b border-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <button className="p-2 text-beige-900" id="mobile-menu-toggle">
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-serif font-medium tracking-tight text-beige-900 uppercase">
              Bright N Bliss
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-12">
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-300 transition-colors">Shop</a>
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-300 transition-colors">About</a>
            <a href="#" className="text-sm font-medium tracking-widest uppercase hover:text-beige-300 transition-colors">Contact</a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <button className="text-beige-900 hover:text-beige-300 transition-colors" id="search-btn">
              <Search size={20} />
            </button>
            <button className="hidden sm:block text-beige-900 hover:text-beige-300 transition-colors" id="wishlist-btn">
              <Heart size={20} />
            </button>
            <button className="relative text-beige-900 hover:text-beige-300 transition-colors" id="cart-btn">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-beige-900 text-beige-50 text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
