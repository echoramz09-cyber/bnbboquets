/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Menu, Search, Heart, X, ChevronRight, ChevronDown, Layers, Sparkles, Package, Tag, ArrowRight } from "lucide-react";
import { useCategories, useProducts, useSiteSettings } from "../hooks/useLiveContent";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function Header() {
  const settings = useSiteSettings();
  const categories = useCategories();
  const products = useProducts();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Map categoryId -> Category object for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Filter categories matching search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // Filter products matching search query across name, tag, description, and category name
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter((prod) => {
      const catName = categoryMap.get(prod.categoryId)?.toLowerCase() || "";
      return (
        prod.name.toLowerCase().includes(q) ||
        (prod.tag && prod.tag.toLowerCase().includes(q)) ||
        (prod.description && prod.description.toLowerCase().includes(q)) ||
        catName.includes(q)
      );
    });
  }, [products, categoryMap, searchQuery]);

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${productId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-beige-100 border-b border-beige-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <motion.button 
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#5d4037] bg-beige-200/60 hover:bg-beige-200 border border-[#5d4037]/30 rounded-lg transition-colors shadow-xs cursor-pointer" 
              id="mobile-menu-toggle"
              aria-label="Open menu"
            >
              <Menu size={22} className="text-[#5d4037]" />
            </motion.button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <motion.div whileHover={{ scale: 1.05, rotate: -1 }} transition={{ type: "spring", stiffness: 400 }}>
              <Link to="/" className="text-xl sm:text-3xl md:text-5xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-center truncate max-w-[200px] sm:max-w-none">
                {settings?.logo || "bright n bliss"} bouquets
              </Link>
            </motion.div>
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
            <Link to="/contact" className="text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 hover:text-[#5d4037] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <motion.button 
              whileHover={{ scale: 1.15, rotate: 5 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" 
              id="search-btn" 
              aria-label="Search"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.15, rotate: -5 }} whileTap={{ scale: 0.9 }} className="hidden sm:block p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" id="wishlist-btn" aria-label="Wishlist">
              <Heart size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.15, y: -2 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-beige-900 hover:text-[#5d4037] transition-colors cursor-pointer" 
              id="cart-btn" 
              aria-label="Cart"
            >
              <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.25, 1] }} 
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute -top-1 -right-1 bg-[#5d4037] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-sans font-bold shadow-xs"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
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
                    className="p-2 text-[#5d4037] hover:bg-beige-200/50 rounded-lg cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 text-xs font-montserrat font-semibold tracking-widest uppercase text-[#5d4037] bg-beige-200/80 rounded-lg border border-beige-300/50 mb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Search size={15} />
                      <span>Search Flowers...</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>

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
                  <Link 
                    to="/contact" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 text-xs font-montserrat font-semibold tracking-widest uppercase text-beige-900 border-b border-beige-200/50"
                  >
                    <span>Contact</span>
                    <ChevronRight size={16} className="text-beige-900/40" />
                  </Link>
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

      {/* Search Modal Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-beige-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className="relative w-full max-w-2xl bg-[#FFF7E6] rounded-2xl shadow-2xl border-2 border-beige-300 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Search Bar Header */}
              <div className="p-4 sm:p-5 border-b border-beige-200 flex items-center space-x-3 bg-beige-50">
                <Search size={22} className="text-[#5d4037] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search arrangements, categories, tags (e.g. Roses, Birthday, Luxe)..."
                  className="flex-grow bg-transparent text-sm sm:text-base font-montserrat font-semibold text-beige-900 placeholder:text-beige-900/40 focus:outline-none"
                  autoFocus
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 text-beige-900/60 hover:text-beige-900 hover:bg-beige-200/60 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                ) : null}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="px-3 py-1.5 bg-beige-200 text-[#5d4037] text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg hover:bg-beige-300 transition-colors cursor-pointer shrink-0"
                >
                  Esc
                </button>
              </div>

              {/* Quick Tags / Suggested Searches when input is empty */}
              {!searchQuery.trim() && (
                <div className="p-6 overflow-y-auto space-y-6">
                  <div>
                    <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#5d4037] block mb-3 flex items-center space-x-1.5">
                      <Sparkles size={12} />
                      <span>Popular Categories & Collections</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate(`/category/${cat.id}`);
                          }}
                          className="px-3.5 py-2 bg-beige-100 hover:bg-[#5d4037] hover:text-white border border-beige-300/80 text-beige-900 text-xs font-montserrat font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          <Package size={13} />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#5d4037] block mb-3 flex items-center space-x-1.5">
                      <Tag size={12} />
                      <span>Popular Tags</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['Best Seller', 'Romantic', 'Signature', 'Luxe', 'Seasonal', 'Custom'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 bg-beige-200/60 hover:bg-beige-300/80 text-[#5d4037] text-xs font-montserrat font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-grow">
                  {/* Matching Categories */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#5d4037] mb-3 flex items-center space-x-1.5">
                        <Layers size={13} />
                        <span>Categories ({filteredCategories.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              navigate(`/category/${cat.id}`);
                            }}
                            className="flex items-center space-x-3 p-3 bg-beige-50 hover:bg-beige-200/60 border border-beige-300/60 rounded-xl cursor-pointer transition-all group"
                          >
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-beige-300" />
                            ) : (
                              <div className="w-12 h-12 bg-beige-200 rounded-lg flex items-center justify-center shrink-0">
                                <Package size={20} className="text-[#5d4037]" />
                              </div>
                            )}
                            <div className="flex-grow min-w-0">
                              <h5 className="text-xs font-montserrat font-bold text-beige-900 group-hover:text-[#5d4037] truncate">{cat.name}</h5>
                              <p className="text-[10px] font-montserrat text-beige-900/60 line-clamp-1">{cat.description}</p>
                            </div>
                            <ArrowRight size={14} className="text-[#5d4037] shrink-0 group-hover:translate-x-1 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-montserrat font-bold uppercase tracking-[0.2em] text-[#5d4037] mb-3 flex items-center space-x-1.5">
                        <Package size={13} />
                        <span>Products & Arrangements ({filteredProducts.length})</span>
                      </h4>
                      <div className="divide-y divide-beige-200 border border-beige-200/80 rounded-xl overflow-hidden bg-beige-50">
                        {filteredProducts.map((product) => {
                          const catName = categoryMap.get(product.categoryId);
                          return (
                            <div
                              key={product.id}
                              onClick={() => handleSelectProduct(product.id)}
                              className="flex items-center space-x-3 p-3 hover:bg-beige-200/50 cursor-pointer transition-colors group"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-lg shrink-0 border border-beige-300"
                              />
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h5 className="text-xs sm:text-sm font-montserrat font-bold text-beige-900 group-hover:text-[#5d4037] truncate">
                                    {product.name}
                                  </h5>
                                  {product.tag && (
                                    <span className="bg-[#5d4037]/10 text-[#5d4037] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm shrink-0">
                                      {product.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-montserrat text-beige-900/60 line-clamp-1 mt-0.5">
                                  {product.description || 'Fresh floral arrangement'}
                                </p>
                                {catName && (
                                  <span className="text-[9px] font-montserrat text-[#5d4037]/80 uppercase tracking-wider font-semibold">
                                    in {catName}
                                  </span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-montserrat font-bold text-xs sm:text-sm text-[#5d4037] block">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-[10px] font-montserrat font-semibold text-[#5d4037] group-hover:underline flex items-center space-x-1 justify-end mt-1">
                                  <span>View</span>
                                  <ChevronRight size={10} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty state when query produces no results */}
                  {filteredCategories.length === 0 && filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                      <Package size={40} className="mx-auto text-beige-900/30 mb-3" />
                      <p className="text-sm font-montserrat font-bold text-beige-900 mb-1">
                        No floral arrangements found matching "{searchQuery}"
                      </p>
                      <p className="text-xs font-montserrat text-beige-900/60 max-w-sm mx-auto mb-4">
                        Try searching for popular categories like "Roses", "Bouquets", or tags like "Best Seller".
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-4 py-2 bg-[#5d4037] text-white text-xs font-montserrat font-semibold uppercase tracking-wider rounded-lg"
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
