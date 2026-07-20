/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Plus } from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    name: "Sunflower Bouquet",
    price: "INR 699/-",
    image: "/src/assets/images/sunflower_bouquet_1784557886632.jpg",
    tag: "Trending"
  }
];

export function ProductGrid() {
  return (
    <section className="py-24 bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-md">
            <h3 className="text-3xl md:text-4xl font-serif mb-6">Our Featured Arrangement</h3>
            <p className="text-beige-900/60 font-sans">Discover our most loved sunflower bouquet, handcrafted daily by our floral artisans.</p>
          </div>
        </div>

        <div className="flex justify-center">
          {PRODUCTS.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group cursor-pointer max-w-sm w-full"
              id={`product-${product.id}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-beige-200 mb-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-beige-50/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider font-medium text-beige-900">
                    {product.tag}
                  </span>
                </div>
                <button className="absolute bottom-6 right-6 w-12 h-12 bg-beige-900 text-beige-50 flex items-center justify-center rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl" id={`add-to-cart-${product.id}`}>
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-lg text-beige-900 mb-1">{product.name}</h4>
                  <p className="text-beige-900/50 text-sm">Bright & Joyful Blooms</p>
                </div>
                <p className="font-sans font-medium text-beige-900">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
