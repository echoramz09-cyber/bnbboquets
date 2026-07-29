/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CopyCheck, MessageCircle, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export function WhatsAppNotification() {
  const { whatsappNotification, setWhatsappNotification } = useCart();

  return (
    <AnimatePresence>
      {whatsappNotification && whatsappNotification.show && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full bg-[#128C7E] text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center space-x-3.5"
        >
          <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
            <MessageCircle size={22} className="text-white animate-bounce" />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-1.5 text-emerald-100 text-[10px] font-montserrat font-bold uppercase tracking-wider">
              <CopyCheck size={12} />
              <span>Details Copied & Redirecting</span>
            </div>
            <p className="text-xs font-montserrat font-semibold leading-snug text-white mt-0.5">
              {whatsappNotification.message}
            </p>
          </div>

          <button
            onClick={() => setWhatsappNotification(null)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
