/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CopyCheck, MessageCircle, X, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export function WhatsAppNotification() {
  const { whatsappNotification, setWhatsappNotification, confirmWhatsAppRedirect } = useCart();

  return (
    <AnimatePresence>
      {whatsappNotification && whatsappNotification.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWhatsappNotification(null)}
            className="fixed inset-0 bg-beige-900/70 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-[#FFF7E6] border-2 border-[#128C7E] rounded-2xl shadow-2xl overflow-hidden z-10 p-6"
          >
            {/* Close icon button */}
            <button
              onClick={() => setWhatsappNotification(null)}
              className="absolute top-4 right-4 p-1.5 text-beige-900/50 hover:text-beige-900 hover:bg-beige-200 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header / Icon */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#128C7E] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle size={26} />
              </div>
              <div>
                <span className="inline-flex items-center space-x-1.5 text-[#128C7E] text-[10px] font-montserrat font-extrabold uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CopyCheck size={12} />
                  <span>Details Copied to Clipboard!</span>
                </span>
                <h3 className="text-base sm:text-lg font-montserrat font-bold text-beige-900 mt-1">
                  Ready to Order on WhatsApp
                </h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-3 mb-6 font-montserrat">
              <p className="text-xs text-beige-900/80 leading-relaxed bg-beige-100 p-3.5 rounded-xl border border-beige-300/80">
                All order details have been <strong>copied to your clipboard</strong>. When you click <strong>OK</strong>, WhatsApp will open with number <strong>+91 9864074004</strong>. You can paste the message directly in DM!
              </p>

              {whatsappNotification.orderSummary && (
                <div className="text-[11px] text-[#5d4037] font-semibold bg-beige-200/60 p-2.5 rounded-lg border border-beige-300/50 truncate">
                  <span className="uppercase text-[9px] text-[#5d4037]/70 font-bold block">Order Summary:</span>
                  {whatsappNotification.orderSummary}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setWhatsappNotification(null)}
                className="w-1/3 py-3 border border-beige-300 text-beige-900/70 hover:bg-beige-200/50 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmWhatsAppRedirect}
                className="w-2/3 py-3 bg-[#128C7E] hover:bg-[#0e6f64] text-white rounded-xl font-montserrat font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>OK (Open WhatsApp)</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
