/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useCategories, useSiteSettings } from "../hooks/useLiveContent";

export function CategorySection() {
  const categories = useCategories();
  const settings = useSiteSettings();

  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-beige-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-montserrat text-beige-900/50 font-semibold mb-3 block">
            {settings?.hero?.title || "Exquisite Selections"}
          </span>
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-beige-900 tracking-tight">
            {settings?.hero?.subtitle || "Shop By Category"}
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="w-20 h-px bg-beige-900/10"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link
                to={`/category/${category.id}`}
                className="relative group overflow-hidden aspect-square bg-beige-200 rounded-sm shadow-sm flex items-center justify-center cursor-pointer block"
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-beige-900/25 group-hover:bg-beige-900/35 transition-colors duration-500"></div>
                
                <div className="relative z-10 text-center p-2 sm:p-4">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-montserrat font-semibold text-beige-50/80 mb-1 sm:mb-2 drop-shadow-sm block">Collection</span>
                  <h3 className="text-base sm:text-2xl md:text-3xl font-montserrat font-bold text-beige-50 drop-shadow-lg leading-tight">
                    {category.name}
                  </h3>
                  <div className="mt-2 sm:mt-4 w-6 sm:w-8 h-px bg-beige-50/30 mx-auto"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
