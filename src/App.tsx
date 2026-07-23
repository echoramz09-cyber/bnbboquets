/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { CategorySection } from "./components/CategorySection";
import { ProductGrid } from "./components/ProductGrid";
import { Footer } from "./components/Footer";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LoadingScreen } from "./components/LoadingScreen";

function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800); // Slightly longer for the flower bloom to finish gracefully
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-beige-300 selection:text-beige-900">
      <Header />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loader" />
        ) : (
          <React.Fragment key="content">
            <main className="flex-grow bg-beige-100">
              <CategorySection />
              <Hero />
              <ProductGrid />
            </main>
            <Footer />
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

