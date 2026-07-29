/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, LogOut, Package, Image as ImageIcon, 
  Settings, Menu, X, Plus, Trash2, Save, Edit2, Upload, ArrowLeft 
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, doc, updateDoc, setDoc, deleteDoc, 
  addDoc, onSnapshot, query, orderBy 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Category, Product, CarouselImage, SiteSettings } from '../types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [carousel, setCarousel] = useState<CarouselImage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const isBypassed = localStorage.getItem('admin_bypass') === 'true';
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsLoading(false);
      } else if (isBypassed) {
        setUser({ email: 'admin@bypass.local', isBypass: true });
        setIsLoading(false);
      } else {
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    setIsSidebarOpen(false);
    localStorage.removeItem('admin_bypass');
    await signOut(auth);
    navigate('/admin', { replace: true });
  };

  useEffect(() => {
    if (!user) return;

    const unsubSettings = onSnapshot(doc(db, "siteSettings", "global"), (d) => {
      if (d.exists()) {
        const val = d.data() as SiteSettings;
        setSettings(val);
        setSettingsForm(prev => prev ? prev : val);
      }
    });

    const unsubCats = onSnapshot(query(collection(db, "categories"), orderBy("order", "asc")), (s) => {
      setCategories(s.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]);
    });

    const unsubProds = onSnapshot(query(collection(db, "products"), orderBy("order", "asc")), (s) => {
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    });

    const unsubCarousel = onSnapshot(query(collection(db, "carousel"), orderBy("order", "asc")), (s) => {
      setCarousel(s.docs.map(d => ({ id: d.id, ...d.data() })) as CarouselImage[]);
    });

    return () => {
      unsubSettings();
      unsubCats();
      unsubProds();
      unsubCarousel();
    };
  }, [user]);

  const saveSettings = async (newSettings: SiteSettings) => {
    await setDoc(doc(db, "siteSettings", "global"), newSettings);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setIsSavingSettings(true);
    setSettingsSavedSuccess(false);
    try {
      await saveSettings(settingsForm);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingItem;
    const collectionName = activeTab.toLowerCase() === 'carousel' ? 'carousel' : activeTab.toLowerCase();
    
    if (data.id && !data.id.startsWith('new-')) {
      const { id, ...updateData } = data;
      await updateDoc(doc(db, collectionName, id), updateData);
    } else {
      const { id, ...newData } = data;
      await addDoc(collection(db, collectionName), {
        ...newData,
        order: (activeTab === 'Products' ? products : activeTab === 'Collections' ? categories : carousel).length + 1
      });
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    const collectionName = activeTab.toLowerCase() === 'carousel' ? 'carousel' : activeTab.toLowerCase();
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Package, label: 'Products' },
    { icon: ImageIcon, label: 'Collections' },
    { icon: ImageIcon, label: 'Carousel' },
    { icon: Settings, label: 'Settings' },
  ];

  if (isLoading) return <div className="min-h-screen bg-beige-100 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-beige-50 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity" 
        />
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-beige-200 px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-signature text-beige-900 lowercase">bright n bliss</h1>
          <span className="text-beige-300">/</span>
          <span className="text-xs font-medium uppercase tracking-wider text-beige-900/70">{activeTab}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/')} 
            className="px-2.5 py-1.5 bg-beige-100 hover:bg-beige-200 rounded-lg text-beige-900 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            title="Go back to live site"
          >
            <ArrowLeft size={14} />
            <span>Site</span>
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-beige-100 rounded-lg text-beige-900 hover:bg-beige-200 transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-beige-200 p-6 flex flex-col transition-transform duration-300 transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 md:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-signature text-beige-900 lowercase">bright n bliss</h1>
            <p className="text-[10px] uppercase tracking-widest text-beige-900/40 font-medium">Admin Panel</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-beige-900 hover:bg-beige-100 rounded-lg"><X size={20} /></button>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.label ? 'bg-beige-100 text-beige-900' : 'text-beige-900/60 hover:bg-beige-50 hover:text-beige-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 mt-auto space-y-2 border-t border-beige-100">
          <button 
            onClick={() => { setIsSidebarOpen(false); navigate('/'); }} 
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-beige-900/80 hover:bg-beige-100 hover:text-beige-900 rounded-lg text-sm font-medium transition-all"
          >
            <ArrowLeft size={18} />
            <span>Go Back to Site</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 bg-red-50/60 hover:bg-red-100 rounded-lg text-sm font-semibold transition-all border border-red-100/80 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 md:p-10">
        <header className="hidden md:flex justify-between items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-beige-900">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-beige-200 text-beige-900/80 hover:text-beige-900 hover:bg-beige-100 rounded-lg text-xs font-medium uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Go Back to Site</span>
            </button>
            <div className="h-8 w-px bg-beige-200 mx-1" />
            <div className="text-right">
              <p className="text-sm font-medium text-beige-900">Admin</p>
              <p className="text-xs text-beige-900/50">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-beige-300 rounded-full flex items-center justify-center text-white font-serif">A</div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-red-100 ml-2"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Total Collections</p>
                <p className="text-3xl font-serif text-beige-900">{categories.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Active Products</p>
                <p className="text-3xl font-serif text-beige-900">{products.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Carousel Images</p>
                <p className="text-3xl font-serif text-beige-900">{carousel.length}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-xl mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => { setActiveTab('Collections'); setEditingItem({ name: '', description: '', image: '', order: categories.length + 1 }); setIsModalOpen(true); }} className="p-4 bg-beige-50 rounded-xl border border-beige-200 hover:bg-beige-100 transition-all text-center">
                  <ImageIcon className="mx-auto mb-2 text-beige-900/60" size={24} />
                  <span className="text-xs font-medium">Add Collection</span>
                </button>
                <button onClick={() => { setActiveTab('Products'); setEditingItem({ name: '', price: '', image: '', tag: 'New', categoryId: categories[0]?.id || '', order: products.length + 1 }); setIsModalOpen(true); }} className="p-4 bg-beige-50 rounded-xl border border-beige-200 hover:bg-beige-100 transition-all text-center">
                  <Package className="mx-auto mb-2 text-beige-900/60" size={24} />
                  <span className="text-xs font-medium">Add Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Collections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg sm:text-xl text-beige-900">Manage Collections</h3>
              <button onClick={() => { setEditingItem({ name: '', description: '', image: '', order: categories.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <Plus size={16} /> <span>New Collection</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-beige-200 overflow-hidden shadow-sm group">
                  <div className="aspect-video bg-beige-100 relative">
                    <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                    <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-2">
                      <button onClick={() => { setEditingItem(cat); setIsModalOpen(true); }} className="p-2.5 bg-white rounded-full text-beige-900 shadow-md hover:bg-beige-100"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteItem(cat.id)} className="p-2.5 bg-white rounded-full text-red-500 shadow-md hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif text-base sm:text-lg">{cat.name}</h4>
                    <p className="text-xs text-beige-900/50 line-clamp-2 mt-1">{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg sm:text-xl text-beige-900">Manage Products</h3>
              <button onClick={() => { setEditingItem({ name: '', price: '', image: '', tag: 'New', categoryId: categories[0]?.id || '', order: products.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <Plus size={16} /> <span>New Product</span>
              </button>
            </div>

            {/* Mobile Card View for Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
              {products.map(prod => (
                <div key={prod.id} className="bg-white p-3 rounded-xl border border-beige-200 shadow-xs flex items-center space-x-3">
                  <img src={prod.image} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-beige-200" alt={prod.name} />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-sm text-beige-900 truncate">{prod.name}</h4>
                    <p className="text-xs text-beige-900/50 truncate mt-0.5">
                      {categories.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
                    </p>
                    <p className="text-xs font-semibold text-[#5d4037] mt-1">{prod.price}</p>
                  </div>
                  <div className="flex flex-col space-y-2 shrink-0">
                    <button onClick={() => { setEditingItem(prod); setIsModalOpen(true); }} className="p-1.5 text-beige-900/60 hover:text-beige-900 bg-beige-50 rounded-md"><Edit2 size={15} /></button>
                    <button onClick={() => handleDeleteItem(prod.id)} className="p-1.5 text-red-500/60 hover:text-red-500 bg-red-50 rounded-md"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View for Products */}
            <div className="hidden md:block bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-beige-50 border-b border-beige-200">
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-beige-900/40">Product</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-beige-900/40">Category</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-beige-900/40">Price</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-beige-900/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-100">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-beige-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={prod.image} className="w-10 h-10 rounded-lg object-cover" alt={prod.name} />
                          <span className="font-medium text-sm">{prod.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-beige-900/60">
                        {categories.find(c => c.id === prod.categoryId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{prod.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button onClick={() => { setEditingItem(prod); setIsModalOpen(true); }} className="text-beige-900/40 hover:text-beige-900"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteItem(prod.id)} className="text-beige-900/40 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Carousel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg sm:text-xl text-beige-900">Carousel Images</h3>
              <button onClick={() => { setEditingItem({ image: '', order: carousel.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <Plus size={16} /> <span>Add Image</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
              {carousel.map(img => (
                <div key={img.id} className="relative group aspect-[3/4] bg-beige-100 rounded-xl overflow-hidden shadow-sm">
                  <img src={img.image} className="w-full h-full object-cover" alt="Carousel item" />
                  <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-2">
                    <button onClick={() => { setEditingItem(img); setIsModalOpen(true); }} className="p-2.5 bg-white rounded-full text-beige-900 shadow-md hover:bg-beige-100"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteItem(img.id)} className="p-2.5 bg-white rounded-full text-red-500 shadow-md hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6 sm:space-y-8">
            <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-beige-200 shadow-sm sticky top-14 md:top-4 z-20">
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-beige-900">Site Settings</h3>
                <p className="text-xs text-beige-900/50">Configure branding and text content</p>
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-[#5d4037] hover:bg-[#4a332c] text-white px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                <span>{isSavingSettings ? 'Saving...' : settingsSavedSuccess ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </div>

            {settingsSavedSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl font-medium"
              >
                ✓ Settings saved successfully to live site!
              </motion.div>
            )}

            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-lg sm:text-xl mb-4 sm:mb-8">Site Identity</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Logo Text</label>
                  <input 
                    type="text" 
                    value={settingsForm?.logo || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, logo: e.target.value } : null)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-lg sm:text-xl mb-4 sm:mb-8">Hero Header</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={settingsForm?.hero?.title || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, hero: { ...prev.hero || { title: '', subtitle: '' }, title: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Subtitle</label>
                  <input 
                    type="text" 
                    value={settingsForm?.hero?.subtitle || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, hero: { ...prev.hero || { title: '', subtitle: '' }, subtitle: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-lg sm:text-xl mb-4 sm:mb-8">Footer Content</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Tagline</label>
                  <input 
                    type="text" 
                    value={settingsForm?.footer?.tagline || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, footer: { ...prev.footer || { tagline: '', copyright: '' }, tagline: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Copyright Text</label>
                  <input 
                    type="text" 
                    value={settingsForm?.footer?.copyright || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, footer: { ...prev.footer || { tagline: '', copyright: '' }, copyright: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 pb-8">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full sm:w-auto bg-[#5d4037] hover:bg-[#4a332c] text-white px-8 py-3 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Save size={18} />
                <span>{isSavingSettings ? 'Saving Changes...' : settingsSavedSuccess ? 'Saved Successfully!' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-beige-100 flex justify-between items-center shrink-0">
                <h3 className="font-serif text-lg sm:text-xl">Edit {activeTab.slice(0, -1)}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md text-beige-900/60 hover:text-beige-900"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-grow">
                {activeTab === 'Collections' && (
                  <>
                    <input placeholder="Name" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    <textarea placeholder="Description" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} required />
                    <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                  </>
                )}
                {activeTab === 'Products' && (
                  <>
                    <input placeholder="Name" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    <input placeholder="Subtitle/Description" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                    <input placeholder="Price (e.g. INR 699/-)" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} required />
                    <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                    <input placeholder="Tag (e.g. Bestseller)" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.tag} onChange={e => setEditingItem({...editingItem, tag: e.target.value})} />
                    <select className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.categoryId} onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </>
                )}
                {activeTab === 'Carousel' && (
                  <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beige-300" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-beige-100 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-beige-900/60 hover:text-beige-900">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-beige-900 text-white rounded-lg text-sm font-medium hover:bg-beige-900/90 shadow-sm">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
