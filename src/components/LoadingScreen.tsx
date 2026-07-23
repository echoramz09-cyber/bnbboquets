/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Flower2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-40 bg-beige-100 flex flex-col items-center justify-center pt-20"
    >
      <div className="relative">
        {/* Central Flower */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            ease: "backOut" 
          }}
          className="text-beige-900 relative z-10"
        >
          <Flower2 size={64} strokeWidth={1.5} />
        </motion.div>

        {/* Blooming Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              x: Math.cos((i * 60 * Math.PI) / 180) * 80,
              y: Math.sin((i * 60 * Math.PI) / 180) * 80,
              opacity: [0, 1, 0.4]
            }}
            transition={{ 
              delay: 0.5 + i * 0.1, 
              duration: 1.2, 
              ease: "easeOut" 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-beige-300"
          >
            <Flower2 size={24} />
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
