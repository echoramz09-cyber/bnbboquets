/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useCarouselImages } from "../hooks/useLiveContent";

export function ImageCarousel() {
  const images = useCarouselImages();
  
  if (images.length === 0) return null;

  // Duplicate images for seamless looping
  const doubledImages = [...images, ...images];

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
          {doubledImages.map((img, index) => (
            <div 
              key={`${img.id}-${index}`} 
              className="flex-shrink-0 w-64 h-80 md:w-80 md:h-[450px] overflow-hidden rounded-sm shadow-md"
            >
              <img
                src={img.image}
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
