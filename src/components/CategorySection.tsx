/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
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
          <span className="text-[10px] uppercase tracking-[0.4em] text-beige-900/40 font-medium mb-4 block">
            {settings?.hero?.title || "Exquisite Selections"}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-beige-900">
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
              className="relative group overflow-hidden aspect-square bg-beige-200 rounded-sm shadow-sm flex items-center justify-center cursor-pointer"
              onClick={() => {
                const element = document.getElementById(`category-${category.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-beige-900/25 group-hover:bg-beige-900/35 transition-colors duration-500"></div>
              
              <div className="relative z-10 text-center p-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-beige-50/70 mb-2 drop-shadow-sm font-medium block">Collection</span>
                <h3 className="text-xl sm:text-3xl md:text-4xl font-serif italic text-beige-50 drop-shadow-lg leading-tight">
                  {category.name}
                </h3>
                <div className="mt-4 w-8 h-px bg-beige-50/30 mx-auto"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
