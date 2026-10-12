import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Sparkles, Brain, Cpu, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white">IntelliCart</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shop Smarter. Discover Better.
              An intelligent e-commerce platform powered by Hybrid AI recommendations.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Academic Major Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Product Catalog</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-white transition-colors flex items-center space-x-1 text-brand-400">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Recommendations</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">My Cart</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">Order History</Link>
              </li>
            </ul>
          </div>

          {/* AI Recommendation Engine */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">AI Algorithms</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-brand-400" />
                <span>TF-IDF Content Similarity</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Collaborative Filtering Matrix</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hybrid Fusion (0.4/0.4/0.2)</span>
              </li>
              <li>Popularity Cold-Start Fallback</li>
              <li>Verified Purchase Signals</li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Technology Stack</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">React 18</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Vite</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Tailwind CSS</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Node.js</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Express.js</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">MongoDB</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Python 3</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">FastAPI</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">scikit-learn</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 IntelliCart. Developed for B.Tech Major Project Demonstration.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with passion & precision</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
