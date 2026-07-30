/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, ArrowLeft, SlidersHorizontal, Package, Heart, Sparkles } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useCategories, useProducts } from "../hooks/useLiveContent";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const categories = useCategories();
  const products = useProducts();
  const { addToCart, buyNowProduct } = useCart();
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});

  // Scroll to top on mount or route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentCategory = categories.find((c) => c.id === categoryId);
  const rawCategoryProducts = products.filter((p) => p.categoryId === categoryId);

  // Sorting
  const categoryProducts = [...rawCategoryProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      const numA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const numB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return numA - numB;
    }
    if (sortBy === 'price-desc') {
      const numA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const numB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return numB - numA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-beige-100 selection:bg-beige-300 selection:text-beige-900">
      <Header />

      <main className="flex-grow">
        {/* Breadcrumb Navigation */}
        <div className="bg-beige-200/50 border-b border-beige-200 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center text-xs font-montserrat text-beige-900/60 space-x-2 overflow-x-auto">
            <Link to="/" className="hover:text-[#5d4037] transition-colors shrink-0">Home</Link>
            <ChevronRight size={12} className="shrink-0" />
            <span className="shrink-0">Categories</span>
            <ChevronRight size={12} className="shrink-0" />
            <span className="font-semibold text-beige-900 shrink-0">
              {currentCategory ? currentCategory.name : "Category"}
            </span>
          </div>
        </div>

        {/* Category Header Banner */}
        {currentCategory ? (
          <div className="relative py-16 sm:py-24 bg-beige-900 text-beige-50 overflow-hidden">
            {currentCategory.image && (
              <div className="absolute inset-0">
                <img 
                  src={currentCategory.image} 
                  alt={currentCategory.name} 
                  className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-beige-900 via-beige-900/70 to-transparent"></div>
              </div>
            )}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span 
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-[11px] font-montserrat uppercase tracking-[0.25em] font-bold text-amber-200/90 bg-white/10 px-3 py-1 rounded-full border border-amber-200/20 mb-4 inline-flex items-center space-x-1.5 backdrop-blur-xs"
                >
                  <Sparkles size={12} className="text-amber-300" />
                  <span>Curated Collection</span>
                  <Sparkles size={12} className="text-amber-300" />
                </motion.span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-montserrat font-extrabold text-white tracking-tight mb-4 leading-tight">
                  {currentCategory.name}
                </h1>
                <p className="max-w-2xl mx-auto text-xs sm:text-base font-montserrat text-beige-200/90 leading-relaxed">
                  {currentCategory.description}
                </p>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto px-4">
              <Package size={48} className="mx-auto text-beige-900/30 mb-4" />
              <h2 className="text-xl font-montserrat font-bold text-beige-900 mb-2">Category Loading or Not Found</h2>
              <p className="text-xs text-beige-900/60 mb-6">Please check back or explore our other flower collections.</p>
              <Link to="/" className="inline-flex items-center space-x-2 bg-[#5d4037] text-white px-5 py-2.5 text-xs font-montserrat font-semibold uppercase tracking-wider rounded-none">
                <ArrowLeft size={16} />
                <span>Return to Shop</span>
              </Link>
            </div>
          </div>
        )}

        {/* Category Products Content */}
        {currentCategory && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {/* Header Toolbar / Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-beige-200 gap-4">
              <div>
                <p className="text-xs font-montserrat font-semibold text-beige-900/60 uppercase tracking-wider">
                  Showing {categoryProducts.length} {categoryProducts.length === 1 ? 'Arrangement' : 'Arrangements'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <SlidersHorizontal size={14} className="text-beige-900/60" />
                <span className="text-xs font-montserrat font-semibold text-beige-900/80 uppercase tracking-wider">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-beige-50 border border-beige-300 text-xs font-montserrat text-beige-900 py-1.5 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5d4037]"
                >
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {categoryProducts.map((product, index) => {
                  const isLiked = likedProducts[product.id];
                  return (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -8, transition: { type: "spring", stiffness: 350, damping: 22 } }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="group cursor-pointer w-full"
                      id={`product-${product.id}`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-beige-200 mb-4 sm:mb-6 border-2 border-[#5d4037] rounded-xl shadow-xs group-hover:shadow-lg transition-shadow">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {product.tag && (
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                            <span className="bg-beige-50/90 backdrop-blur-sm px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat text-[#5d4037] rounded-md border border-beige-300/50">
                              {product.tag}
                            </span>
                          </div>
                        )}

                        {/* Heart Button */}
                        <button
                          onClick={(e) => toggleLike(product.id, e)}
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-beige-50/90 backdrop-blur-sm rounded-full text-beige-900 hover:text-red-500 shadow-sm transition-all hover:scale-110 cursor-pointer"
                          aria-label="Add to wishlist"
                        >
                          <motion.div
                            animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart 
                              size={15} 
                              className={isLiked ? "fill-red-500 text-red-500" : "text-[#5d4037]"} 
                            />
                          </motion.div>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-1">
                        <div>
                          <h4 className="font-montserrat font-semibold text-sm sm:text-base text-beige-900 leading-snug group-hover:text-[#5d4037] transition-colors">{product.name}</h4>
                          <p className="font-montserrat text-beige-900/60 text-xs mt-0.5 line-clamp-1">{product.description || 'Bright & Joyful Blooms'}</p>
                        </div>
                        <p className="font-montserrat font-bold text-xs sm:text-base text-[#5d4037] whitespace-nowrap">{formatPrice(product.price)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="py-2.5 px-1 sm:px-2 bg-[#5d4037] text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat hover:bg-[#4a332c] transition-colors rounded-lg text-center cursor-pointer shadow-xs"
                          id={`add-to-cart-${product.id}`}
                        >
                          Add to Cart
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNowProduct(product);
                          }}
                          className="py-2.5 px-1 sm:px-2 bg-transparent border border-[#5d4037] text-[#5d4037] text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat hover:bg-[#5d4037] hover:text-white transition-all rounded-lg text-center cursor-pointer"
                          id={`buy-now-${product.id}`}
                        >
                          Buy Now
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-beige-300 rounded-2xl bg-beige-50/50">
                <Package size={40} className="mx-auto text-beige-900/40 mb-3" />
                <h3 className="text-lg font-montserrat font-bold text-beige-900 mb-1">No products in this collection yet</h3>
                <p className="text-xs font-montserrat text-beige-900/60 max-w-md mx-auto mb-6">
                  We are actively preparing new handcrafted arrangements for this collection.
                </p>
                <Link to="/" className="inline-flex items-center space-x-2 bg-[#5d4037] text-white px-5 py-2.5 text-xs font-montserrat font-semibold uppercase tracking-wider rounded-lg">
                  <ArrowLeft size={16} />
                  <span>Browse All Collections</span>
                </Link>
              </div>
            )}

            {/* Switch Categories Footer Bar */}
            {categories.length > 1 && (
              <div className="mt-20 pt-10 border-t border-beige-200">
                <h4 className="text-sm font-montserrat font-bold uppercase tracking-wider text-beige-900 mb-6 text-center">
                  Explore Other Collections
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                    <motion.div key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={`/category/${cat.id}`}
                        className={`px-4 py-2 text-xs font-montserrat font-semibold uppercase tracking-wider transition-all rounded-lg block ${
                          cat.id === categoryId 
                            ? 'bg-[#5d4037] text-white shadow-sm' 
                            : 'bg-beige-200/80 hover:bg-beige-300 text-beige-900'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
