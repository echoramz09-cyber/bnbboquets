/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

const SCROLL_IMAGES = [
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&q=80&w=800"
];

export function ImageCarousel() {
  // Duplicate images for seamless looping
  const doubledImages = [...SCROLL_IMAGES, ...SCROLL_IMAGES];

  return (
    <section className="py-12 bg-beige-100 overflow-hidden border-y border-beige-900/5">
      <div className="relative flex">
        <motion.div
          className="flex space-x-4 md:space-x-8 px-4"
          animate={{
            x: [0, -1600], // Adjust based on content width
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {doubledImages.map((src, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-64 h-80 md:w-80 md:h-[450px] overflow-hidden rounded-sm shadow-md"
            >
              <img
                src={src}
                alt={`Gallery ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
