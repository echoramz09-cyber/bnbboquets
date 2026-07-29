/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import { useProducts } from "../hooks/useLiveContent";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function ProductGrid() {
  const products = useProducts();
  const { addToCart, buyNowProduct } = useCart();
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});

  // Randomize / shuffle products deterministically when product list changes
  const randomizedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const array = [...products];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [products]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-beige-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-14">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-beige-900 tracking-tight mb-2 inline-flex items-center space-x-2">
              <span>Our Featured Products</span>
              <Sparkles size={20} className="text-[#5d4037] animate-pulse" />
            </h3>
            <p className="text-sm font-montserrat text-beige-900/60">Handpicked floral arrangements crafted for every emotion.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {randomizedProducts.map((product, index) => {
            const isLiked = likedProducts[product.id];
            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 350, damping: 22 } }}
                transition={{ delay: (index % 8) * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
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
                      <motion.span 
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="bg-beige-50/95 backdrop-blur-sm px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat text-[#5d4037] rounded-md shadow-xs block border border-beige-300/50"
                      >
                        {product.tag}
                      </motion.span>
                    </div>
                  )}

                  {/* Cute Wishlist Heart Toggle */}
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
      </div>
    </section>
  );
}
