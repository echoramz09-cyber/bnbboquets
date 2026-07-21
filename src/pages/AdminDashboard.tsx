import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, LogOut, Package, Image, Settings, Menu, X } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Package, label: 'Products' },
    { icon: Image, label: 'Collections' },
    { icon: Settings, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-left">
            bright n bliss
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-beige-900/40 font-medium">Admin Panel</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-beige-900"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.label}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              item.active 
                ? 'bg-beige-100 text-beige-900' 
                : 'text-beige-900/60 hover:bg-beige-50 hover:text-beige-900'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-beige-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-beige-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-left">
          bright n bliss
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-beige-100 rounded-lg text-beige-900"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-beige-200 p-6 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
          <h2 className="text-2xl md:text-3xl font-serif text-beige-900">Welcome, Alisha Ahmed</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-beige-900">Alisha Ahmed</p>
              <p className="text-xs text-beige-900/50">Store Owner</p>
            </div>
            <div className="w-10 h-10 bg-beige-300 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-serif">
              A
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Total Collections</p>
            <p className="text-3xl font-serif text-beige-900">4</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Active Products</p>
            <p className="text-3xl font-serif text-beige-900">4</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm sm:col-span-2 md:col-span-1">
            <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Site Status</p>
            <p className="text-3xl font-serif text-green-600 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Live
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-beige-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-beige-200 flex justify-between items-center">
            <h3 className="font-serif text-lg md:text-xl text-beige-900">Recent Activity</h3>
            <button className="text-xs font-medium uppercase tracking-widest text-beige-300 hover:text-beige-900 transition-colors">View All</button>
          </div>
          <div className="p-6">
            <p className="text-sm text-beige-900/50 italic text-center py-10">No recent activity to show.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
