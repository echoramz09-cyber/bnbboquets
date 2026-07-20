/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-beige-300 selection:text-beige-900">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

