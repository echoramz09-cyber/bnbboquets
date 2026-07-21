/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative h-[80vh] flex items-center overflow-hidden bg-beige-200">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium leading-tight text-beige-900 mb-8 pt-6">
            Bouquets <br />
            <span className="font-signature text-6xl sm:text-8xl md:text-9xl text-beige-900/80 lowercase inline-block scale-x-90 origin-left">by alisha</span>
          </h2>
          <p className="text-lg text-beige-900/80 mb-10 max-w-md font-sans">
            Handcrafted bouquets delivered fresh to your doorstep. Every flower tells a story of elegance and grace.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="px-10 py-5 bg-beige-900 text-beige-50 text-sm font-medium tracking-widest uppercase hover:bg-beige-900/90 transition-all rounded-sm" id="hero-shop-now">
              Shop Now
            </button>
            <button className="px-10 py-5 border border-beige-900 text-beige-900 text-sm font-medium tracking-widest uppercase hover:bg-beige-900 hover:text-beige-50 transition-all rounded-sm" id="hero-explore">
              Explore
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
