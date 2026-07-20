/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function Footer() {
  return (
    <footer className="bg-beige-900 text-beige-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-serif font-medium tracking-tight uppercase mb-8">Bright N Bliss</h2>
            <p className="text-beige-50/60 text-sm leading-relaxed mb-8">
              Bringing nature's beauty into your home with artisanal floral arrangements crafted with love.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm text-beige-50/60">
              <li><a href="#" className="hover:text-beige-50 transition-colors">Shop All</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">Gift Cards</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">Wholesale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4 text-sm text-beige-50/60">
              <li><a href="#" className="hover:text-beige-50 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">Care Guide</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-beige-50 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-8">Newsletter</h4>
            <p className="text-sm text-beige-50/60 mb-6">Join our list for floral inspiration and early access.</p>
            <div className="flex border-b border-beige-50/20 pb-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-beige-50/30"
              />
              <button className="text-xs font-medium uppercase tracking-widest hover:text-beige-50/80 transition-colors" id="newsletter-submit">Join</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-beige-50/10 text-[10px] uppercase tracking-widest text-beige-50/40">
          <p>© 2024 Bright N Bliss. All Rights Reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-beige-50 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-beige-50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
