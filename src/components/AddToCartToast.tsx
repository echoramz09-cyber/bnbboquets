/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function AddToCartToast() {
  const { lastAddedProduct, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {lastAddedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#FFF7E6] border-2 border-[#5d4037] p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3"
        >
          <img
            src={lastAddedProduct.image}
            alt={lastAddedProduct.name}
            className="w-12 h-12 object-cover rounded-xl border border-beige-300 shrink-0"
          />

          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-1.5 text-emerald-700 text-[10px] font-montserrat font-bold uppercase tracking-wider">
              <CheckCircle size={12} />
              <span>Added to Cart!</span>
            </div>
            <h5 className="text-xs font-montserrat font-bold text-beige-900 truncate mt-0.5">
              {lastAddedProduct.name}
            </h5>
            <span className="text-xs font-montserrat font-bold text-[#5d4037]">
              {formatPrice(lastAddedProduct.price)}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 bg-[#5d4037] text-white rounded-xl text-xs font-montserrat font-semibold flex items-center space-x-1 hover:bg-[#4a332c] transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">View Cart</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
