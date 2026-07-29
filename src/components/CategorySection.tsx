/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles, Flower2 } from "lucide-react";
import { useCategories, useSiteSettings } from "../hooks/useLiveContent";

export function CategorySection() {
  const categories = useCategories();
  const settings = useSiteSettings();

  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-beige-100 relative overflow-hidden">
      {/* Cute Floating Accents */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-6 left-6 text-[#5d4037]/15 pointer-events-none hidden sm:block"
      >
        <Flower2 size={36} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-8 right-6 text-[#5d4037]/15 pointer-events-none hidden sm:block"
      >
        <Sparkles size={32} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="text-[10px] uppercase tracking-[0.4em] font-montserrat text-beige-900/60 font-semibold mb-3 inline-flex items-center space-x-1.5"
          >
            <Sparkles size={12} className="text-[#5d4037]" />
            <span>{settings?.hero?.title || "Exquisite Selections"}</span>
            <Sparkles size={12} className="text-[#5d4037]" />
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-beige-900 tracking-tight">
            {settings?.hero?.subtitle || "Shop By Category"}
          </h2>
          <div className="mt-6 flex justify-center">
            <motion.div 
              animate={{ width: ["2rem", "4rem", "2rem"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="h-0.5 bg-[#5d4037]" 
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link
                to={`/category/${category.id}`}
                className="relative group overflow-hidden aspect-square bg-beige-200 rounded-xl shadow-sm hover:shadow-xl flex items-center justify-center cursor-pointer block border border-beige-300/50"
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-beige-900/70 via-beige-900/20 to-transparent group-hover:from-beige-900/80 transition-colors duration-500"></div>
                
                <div className="relative z-10 text-center p-2 sm:p-4">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-montserrat font-semibold text-beige-50/80 mb-1 sm:mb-2 drop-shadow-sm block">
                    Collection
                  </span>
                  <h3 className="text-base sm:text-2xl md:text-3xl font-montserrat font-bold text-beige-50 drop-shadow-lg leading-tight group-hover:text-amber-100 transition-colors">
                    {category.name}
                  </h3>
                  <div className="mt-2 sm:mt-4 w-6 sm:w-8 h-px bg-beige-50/40 group-hover:bg-amber-200 group-hover:w-12 transition-all mx-auto"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
