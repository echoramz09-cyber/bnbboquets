/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Menu, Search, Heart, X, ChevronRight, ChevronDown, Layers } from "lucide-react";
import { useCategories, useSiteSettings } from "../hooks/useLiveContent";

export function Header() {
  const settings = useSiteSettings();
  const categories = useCategories();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-beige-100 border-b border-beige-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-beige-900 bg-beige-200/80 hover:bg-beige-200 border border-beige-300/50 rounded-lg transition-colors shadow-xs cursor-pointer" 
              id="mobile-menu-toggle"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link to="/" className="text-xl sm:text-3xl md:text-5xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-center truncate max-w-[200px] sm:max-w-none">
              {settings?.logo || "bright n bliss"} bouquets
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 hover:text-[#5d4037] transition-colors">
              Shop All
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" onMouseLeave={() => setIsDesktopCategoriesOpen(false)}>
              <button 
                onClick={() => setIsDesktopCategoriesOpen(!isDesktopCategoriesOpen)}
                onMouseEnter={() => setIsDesktopCategoriesOpen(true)}
                className="flex items-center space-x-1 text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 hover:text-[#5d4037] transition-colors py-2 cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform ${isDesktopCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDesktopCategoriesOpen && categories.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-56 bg-beige-50 border border-beige-300 rounded-xl shadow-xl py-2 z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        onClick={() => setIsDesktopCategoriesOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-montserrat font-semibold text-beige-900 hover:bg-beige-200/60 hover:text-[#5d4037] transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ChevronRight size={12} className="opacity-40" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#about" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth'}); }, 100); }} className="text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 hover:text-[#5d4037] transition-colors">
              About
            </a>
            <a href="#footer" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 hover:text-[#5d4037] transition-colors">
              Contact
            </a>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button className="p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" id="search-btn" aria-label="Search">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="hidden sm:block p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" id="wishlist-btn" aria-label="Wishlist">
              <Heart size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="relative p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" id="cart-btn" aria-label="Cart">
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
              className="relative w-4/5 max-w-xs h-full bg-[#FFF7E6] p-6 flex flex-col justify-between shadow-2xl border-r border-beige-300 opacity-100 z-10 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-beige-200">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-signature text-beige-900 lowercase">
                    {settings?.logo || "bright n bliss"}
                  </Link>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-beige-900 hover:bg-beige-200/50 rounded-lg cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col space-y-2">
                  <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 text-xs font-montserrat font-bold tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Shop All Products</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </Link>

                  {/* Categories Section in Hamburger Menu */}
                  {categories.length > 0 && (
                    <div className="py-3 border-b border-beige-200/50">
                      <div className="flex items-center space-x-1.5 mb-2.5 text-[#5d4037]">
                        <Layers size={14} />
                        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.2em]">
                          Collections / Categories
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1 pl-2">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.id}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between py-2 text-xs font-montserrat font-semibold uppercase tracking-wider text-beige-900 hover:text-[#5d4037] hover:bg-beige-200/40 px-2 rounded-md transition-colors"
                          >
                            <span>{cat.name}</span>
                            <ChevronRight size={14} className="text-[#5d4037]/60" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <a 
                    href="#about" 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}
                    className="flex items-center justify-between py-2.5 text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>About Us</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                  <a 
                    href="#footer" 
                    onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                    className="flex items-center justify-between py-2.5 text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Contact</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                  <a 
                    href="#" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Wishlist</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </a>
                </nav>
              </div>

              <div className="pt-6 border-t border-beige-200 mt-6">
                <p className="text-[10px] font-montserrat uppercase tracking-widest text-beige-900/50 text-center">
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
