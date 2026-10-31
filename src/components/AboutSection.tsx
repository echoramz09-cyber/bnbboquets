/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { useSiteSettings } from "../hooks/useLiveContent";

export function AboutSection() {
  const settings = useSiteSettings();
  const aboutText = settings?.aboutUs || "Bright N Bliss: Handcrafted floral arrangements for your most precious moments.";

  return (
    <section className="bg-beige-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-beige-900/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <h2 className="text-2xl sm:text-3xl font-signature text-beige-900 lowercase">
            about bright n bliss
          </h2>
          <div className="h-px w-12 bg-[#5d4037]/20 mx-auto" />
          <p className="text-beige-900/80 text-sm sm:text-base leading-relaxed font-montserrat whitespace-pre-wrap">
            {aboutText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
