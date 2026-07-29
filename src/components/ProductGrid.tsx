/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useCategories, useProducts } from "../hooks/useLiveContent";
import { formatPrice } from "../lib/imageUtils";

export function ProductGrid() {
  const categories = useCategories();
  const products = useProducts();

  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-beige-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-beige-900 tracking-tight mb-4 md:mb-6">Our Featured Products</h3>
          </div>
        </div>

        <div className="space-y-24">
          {categories.map((category) => {
            const categoryProducts = products.filter(p => p.categoryId === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} id={`category-${category.id}`}>
                <div className="mb-10">
                  <h4 className="text-xl md:text-2xl font-montserrat font-bold text-beige-900 mb-2">{category.name}</h4>
                  <p className="text-sm font-montserrat text-beige-900/70">{category.description}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {categoryProducts.map((product, index) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      viewport={{ once: true }}
                      className="group cursor-pointer w-full"
                      id={`product-${product.id}`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-beige-200 mb-6 border-2 border-[#5d4037] rounded-none">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-beige-50/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider font-semibold font-montserrat text-[#5d4037]">
                            {product.tag}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-1">
                        <div>
                          <h4 className="font-montserrat font-semibold text-sm sm:text-base text-beige-900 leading-snug">{product.name}</h4>
                          <p className="font-montserrat text-beige-900/60 text-xs mt-0.5 line-clamp-1">{product.description || 'Bright & Joyful Blooms'}</p>
                        </div>
                        <p className="font-montserrat font-bold text-xs sm:text-base text-[#5d4037] whitespace-nowrap">{formatPrice(product.price)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button 
                          className="py-2 px-1 sm:px-2 bg-[#5d4037] text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat hover:bg-[#4a332c] transition-colors rounded-none text-center cursor-pointer"
                          id={`add-to-cart-${product.id}`}
                        >
                          Add to Cart
                        </button>
                        <button 
                          className="py-2 px-1 sm:px-2 bg-transparent border border-[#5d4037] text-[#5d4037] text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold font-montserrat hover:bg-[#5d4037] hover:text-white transition-all rounded-none text-center cursor-pointer"
                          id={`buy-now-${product.id}`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
