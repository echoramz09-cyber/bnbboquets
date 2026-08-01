/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, CheckCircle2, ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    checkoutCartWhatsApp,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await checkoutCartWhatsApp();
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsCartOpen(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-beige-900/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md bg-[#FFF7E6] h-full shadow-2xl flex flex-col z-10 border-l border-beige-300 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 bg-beige-100 border-b border-beige-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#5d4037] text-white rounded-xl shadow-xs">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-base text-beige-900 leading-tight">Your Bouquet Cart</h3>
                  <p className="text-[11px] font-montserrat text-beige-900/60 font-semibold uppercase tracking-wider">
                    {cartCount} {cartCount === 1 ? 'Item' : 'Items'} Selected
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-beige-900/70 hover:text-beige-900 hover:bg-beige-200/60 rounded-full transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Cart Content Body */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center space-x-3 p-3 bg-beige-50 border border-beige-300/60 rounded-xl shadow-2xs hover:border-[#5d4037]/30 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-beige-300"
                      />

                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-beige-900 truncate">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-beige-900/40 hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {product.tag && (
                          <span className="inline-block bg-[#5d4037]/10 text-[#5d4037] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm my-1">
                            {product.tag}
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-montserrat font-bold text-xs text-[#5d4037]">
                            {formatPrice(product.price)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 bg-beige-200/80 rounded-lg p-1 border border-beige-300/50">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center bg-beige-100 text-[#5d4037] rounded-md hover:bg-beige-300/50 transition-colors cursor-pointer"
                            >
                              <Minus size={11} />
                            </motion.button>
                            <span className="font-montserrat font-bold text-xs text-beige-900 min-w-[16px] text-center">
                              {quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center bg-beige-100 text-[#5d4037] rounded-md hover:bg-beige-300/50 transition-colors cursor-pointer"
                            >
                              <Plus size={11} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-beige-200/60 text-beige-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart size={32} />
                  </div>
                  <h4 className="font-montserrat font-bold text-base text-beige-900 mb-1">Your cart is empty</h4>
                  <p className="text-xs font-montserrat text-beige-900/60 max-w-xs mx-auto mb-6">
                    Explore our flower collections and add your favorite bouquets to start your bouquet cart!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 bg-[#5d4037] text-white text-xs font-montserrat font-semibold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs hover:bg-[#4a332c] transition-colors"
                  >
                    Start Browsing
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Subtotal & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-beige-100 border-t border-beige-200 space-y-4">
                <div className="space-y-1.5 text-xs font-montserrat">
                  <div className="flex justify-between text-beige-900/70">
                    <span>Subtotal</span>
                    <span className="font-semibold text-beige-900">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-beige-900/70 py-1">
                    <span className="text-[11px] text-amber-900 font-semibold italic">Delivery fee calculated at checkout</span>
                  </div>
                  <div className="pt-2 border-t border-beige-300/60 flex justify-between text-sm sm:text-base font-bold text-beige-900">
                    <span>Total Amount</span>
                    <span className="text-[#5d4037]">{formatPrice(cartSubtotal)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isCheckingOut}
                    onClick={handleCheckout}
                    className="w-full py-3 bg-[#128C7E] text-white font-montserrat font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#0e6f64] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Opening WhatsApp...</span>
                      </div>
                    ) : (
                      <>
                        <MessageCircle size={18} />
                        <span>Order via WhatsApp</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-center text-[10px] font-montserrat font-bold uppercase tracking-wider text-beige-900/60 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
