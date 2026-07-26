/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useSiteSettings } from "../hooks/useLiveContent";

export function Hero() {
  const settings = useSiteSettings();

  return (
    <section className="relative h-[20vh] flex items-center overflow-hidden bg-beige-100">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="w-12 h-px bg-beige-900/20 mx-auto"></div>
          {/* Hero text is actually in CategorySection for this specific design, 
              but we can add a subtle footer-like text here if needed, 
              or just use it as a spacer as it was originally. */}
        </motion.div>
      </div>
    </section>
  );
}
