/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Plus } from "lucide-react";

const CATEGORIES = [
  {
    id: "sunshine",
    name: "Sunshine Collection",
    description: "Bright seasonal yellows and radiant blooms.",
    products: [
      {
        id: 1,
        name: "Radiant Sunburst",
        price: "INR 699/-",
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2e47?q=80&w=1000&auto=format&fit=crop",
        tag: "Bestseller"
      }
    ]
  },
  {
    id: "gifting",
    name: "Floral Gifting",
    description: "Curated experiences for your loved ones.",
    products: [
      {
        id: 2,
        name: "Signature Gift Box",
        price: "INR 1299/-",
        image: "https://images.unsplash.com/photo-1522673607200-1648483b4cdd?q=80&w=1000&auto=format&fit=crop",
        tag: "Premium"
      }
    ]
  },
  {
    id: "bouquets",
    name: "Bouquets",
    description: "Handcrafted arrangements for every occasion.",
    products: [
      {
        id: 3,
        name: "Classic Meadow Mix",
        price: "INR 899/-",
        image: "https://images.unsplash.com/photo-1523694559144-4ec0d3937395?q=80&w=1000&auto=format&fit=crop",
        tag: "Popular"
      }
    ]
  },
  {
    id: "customization",
    name: "Customization Box",
    description: "Personalize your own floral journey.",
    products: [
      {
        id: 4,
        name: "Artisan's Choice Kit",
        price: "INR 1599/-",
        image: "https://images.unsplash.com/photo-1558229854-47494ec2f38d?q=80&w=1000&auto=format&fit=crop",
        tag: "New"
      }
    ]
  }
];

export function ProductGrid() {
  return (
    <section className="py-16 md:py-24 bg-beige-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 md:mb-6">Our Featured Products</h3>
          </div>
        </div>

        <div className="space-y-24">
          {CATEGORIES.map((category, catIndex) => (
            <div key={category.id} id={`category-${category.id}`}>
              <div className="mb-10">
                <h4 className="text-xl md:text-2xl font-serif text-beige-900 mb-2">{category.name}</h4>
                <p className="text-sm text-beige-900/50 italic">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {category.products.map((product, index) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer w-full"
                    id={`product-${product.id}`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-beige-200 mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-beige-50/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider font-medium text-beige-900">
                          {product.tag}
                        </span>
                      </div>
                      <button className="absolute bottom-6 right-6 w-12 h-12 bg-beige-900 text-beige-50 flex items-center justify-center rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl" id={`add-to-cart-${product.id}`}>
                        <Plus size={24} />
                      </button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-lg text-beige-900 mb-1">{product.name}</h4>
                        <p className="text-beige-900/50 text-sm">Bright & Joyful Blooms</p>
                      </div>
                      <p className="font-sans font-medium text-beige-900">{product.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
