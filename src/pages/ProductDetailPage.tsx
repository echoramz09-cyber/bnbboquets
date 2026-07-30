/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ShoppingBag,
  MessageCircle,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Heart,
  Share2,
  Check
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useCategories, useProducts } from "../hooks/useLiveContent";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/imageUtils";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const products = useProducts();
  const categories = useCategories();
  const { addToCart, buyNowProduct } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top on load or productId change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  const category = useMemo(() => {
    if (!product) return null;
    return categories.find((c) => c.id === product.categoryId);
  }, [categories, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
      .slice(0, 4);
  }, [products, product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [
      product.image,
      product.image.includes("unsplash")
        ? `${product.image}&auto=format&fit=crop&w=800&q=80`
        : "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    ];
  }, [product]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    buyNowProduct(product);
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-beige-100 flex flex-col justify-between font-montserrat">
        <Header />
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#5d4037] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-beige-900">Loading Product Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-beige-100 flex flex-col justify-between font-montserrat">
        <Header />
        <div className="py-20 max-w-md mx-auto text-center px-4">
          <Package size={48} className="mx-auto text-beige-900/40 mb-3" />
          <h2 className="text-xl font-bold text-beige-900 mb-2">Product Not Found</h2>
          <p className="text-xs text-beige-900/60 mb-6">
            The product you are looking for might have been moved or removed.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#5d4037] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#4a332c] transition-colors"
          >
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100 flex flex-col font-montserrat text-beige-900">
      <Header />

      <main className="flex-grow py-6 sm:py-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-beige-900/60 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#5d4037] transition-colors flex items-center">
            <ArrowLeft size={13} className="mr-1" />
            <span>Home</span>
          </Link>
          <ChevronRight size={12} />
          {category && (
            <>
              <Link to={`/category/${category.id}`} className="hover:text-[#5d4037] transition-colors">
                {category.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="font-semibold text-beige-900 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Product Image & Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-beige-200 border border-beige-300 shadow-sm">
              <img
                src={galleryImages[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  title="Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#5d4037]"} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer relative"
                  title="Share"
                >
                  {copiedLink ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} className="text-[#5d4037]" />}
                </button>
              </div>
            </div>

            {/* Thumbnail selector */}
            {galleryImages.length > 1 && (
              <div className="flex space-x-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? "border-[#5d4037] scale-105" : "border-beige-300 opacity-60"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-6">
            <div>
              {category && (
                <span className="text-xs font-bold text-[#5d4037] uppercase tracking-wider block mb-1">
                  {category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-beige-900">{product.name}</h1>
              <div className="text-2xl font-bold text-[#5d4037] mt-2">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="border-t border-b border-beige-200 py-4">
              <p className="text-xs sm:text-sm text-beige-900/80 leading-relaxed">
                {product.description || "Handcrafted with fresh premium flowers, beautifully arranged for every occasion."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold uppercase tracking-wider text-beige-900">Quantity:</span>
              <div className="flex items-center space-x-3 bg-beige-200/80 rounded-xl p-1.5 border border-beige-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 bg-beige-100 rounded-lg flex items-center justify-center text-[#5d4037] hover:bg-beige-300 transition-colors cursor-pointer"
                >
                  <Minus size={13} />
                </button>
                <span className="font-bold text-sm min-w-[20px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 bg-beige-100 rounded-lg flex items-center justify-center text-[#5d4037] hover:bg-beige-300 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                className="py-3 px-4 bg-[#5d4037] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#4a332c] transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleBuyNow}
                className="py-3 px-4 bg-[#128C7E] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#0e6f64] transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Buy Now on WhatsApp</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-beige-200 pt-10">
            <h3 className="text-lg font-bold text-beige-900 mb-6">Related Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="group bg-[#FFF7E6] rounded-xl border border-beige-300 p-3 cursor-pointer hover:border-[#5d4037] transition-all shadow-2xs"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-beige-200 mb-2">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-beige-900 truncate group-hover:text-[#5d4037]">{p.name}</h4>
                  <span className="text-xs font-bold text-[#5d4037] block mt-1">{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
