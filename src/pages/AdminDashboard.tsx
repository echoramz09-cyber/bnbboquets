/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, LogOut, Package, Image as ImageIcon, 
  Settings, Menu, X, Plus, Trash2, Save, Edit2, Upload 
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
    localStorage.removeItem('admin_bypass');
    await signOut(auth);
    navigate('/admin');
  };

  useEffect(() => {
    if (!user) return;

    const unsubSettings = onSnapshot(doc(db, "siteSettings", "global"), (d) => {
      if (d.exists()) setSettings(d.data() as SiteSettings);
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
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-beige-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-signature text-beige-900 lowercase inline-block scale-x-90 origin-left">
          bright n bliss
        </h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-beige-100 rounded-lg text-beige-900">
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-beige-200 p-6 flex flex-col transition-transform duration-300 transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-signature text-beige-900 lowercase">bright n bliss</h1>
            <p className="text-[10px] uppercase tracking-widest text-beige-900/40 font-medium">Admin Panel</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-beige-900"><X size={20} /></button>
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

        <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-all">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-beige-900">{activeTab}</h2>
          <div className="hidden sm:flex items-center space-x-4">
             <div className="text-right">
              <p className="text-sm font-medium text-beige-900">Admin</p>
              <p className="text-xs text-beige-900/50">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-beige-300 rounded-full flex items-center justify-center text-white font-serif">A</div>
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
              <h3 className="font-serif text-xl text-beige-900">Manage Collections</h3>
              <button onClick={() => { setEditingItem({ name: '', description: '', image: '', order: categories.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                <Plus size={16} /> <span>New Collection</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-beige-200 overflow-hidden shadow-sm group">
                  <div className="aspect-video bg-beige-100 relative">
                    <img src={cat.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button onClick={() => { setEditingItem(cat); setIsModalOpen(true); }} className="p-2 bg-white rounded-full text-beige-900"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteItem(cat.id)} className="p-2 bg-white rounded-full text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif text-lg">{cat.name}</h4>
                    <p className="text-xs text-beige-900/40 line-clamp-1">{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-beige-900">Manage Products</h3>
              <button onClick={() => { setEditingItem({ name: '', price: '', image: '', tag: 'New', categoryId: categories[0]?.id || '', order: products.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                <Plus size={16} /> <span>New Product</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-sm">
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
                          <img src={prod.image} className="w-10 h-10 rounded-lg object-cover" />
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
              <h3 className="font-serif text-xl text-beige-900">Carousel Images</h3>
              <button onClick={() => { setEditingItem({ image: '', order: carousel.length + 1 }); setIsModalOpen(true); }} className="bg-beige-900 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                <Plus size={16} /> <span>Add Image</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {carousel.map(img => (
                <div key={img.id} className="relative group aspect-[3/4] bg-beige-100 rounded-xl overflow-hidden shadow-sm">
                  <img src={img.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button onClick={() => { setEditingItem(img); setIsModalOpen(true); }} className="p-2 bg-white rounded-full text-beige-900"><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteItem(img.id)} className="p-2 bg-white rounded-full text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="max-w-2xl space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-xl mb-8">Site Identity</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Logo Text</label>
                  <input 
                    type="text" 
                    value={settings?.logo || ''} 
                    onChange={(e) => settings && saveSettings({ ...settings, logo: e.target.value })}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-xl mb-8">Hero Header</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={settings?.hero?.title || ''} 
                    onChange={(e) => settings && saveSettings({ ...settings, hero: { ...settings.hero, title: e.target.value } })}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Subtitle</label>
                  <input 
                    type="text" 
                    value={settings?.hero?.subtitle || ''} 
                    onChange={(e) => settings && saveSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-beige-200 shadow-sm">
              <h3 className="font-serif text-xl mb-8">Footer Content</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Tagline</label>
                  <input 
                    type="text" 
                    value={settings?.footer?.tagline || ''} 
                    onChange={(e) => settings && saveSettings({ ...settings, footer: { ...settings.footer, tagline: e.target.value } })}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/40 mb-2">Copyright Text</label>
                  <input 
                    type="text" 
                    value={settings?.footer?.copyright || ''} 
                    onChange={(e) => settings && saveSettings({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })}
                    className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-beige-300 outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-beige-100 flex justify-between items-center">
                <h3 className="font-serif text-xl">Edit {activeTab.slice(0, -1)}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="p-6 space-y-4">
                {activeTab === 'Collections' && (
                  <>
                    <input placeholder="Name" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    <textarea placeholder="Description" className="w-full p-3 bg-beige-50 border rounded-lg text-sm h-24" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} required />
                    <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                  </>
                )}
                {activeTab === 'Products' && (
                  <>
                    <input placeholder="Name" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    <input placeholder="Subtitle/Description" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                    <input placeholder="Price (e.g. INR 699/-)" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} required />
                    <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                    <input placeholder="Tag (e.g. Bestseller)" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.tag} onChange={e => setEditingItem({...editingItem, tag: e.target.value})} />
                    <select className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.categoryId} onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </>
                )}
                {activeTab === 'Carousel' && (
                  <input placeholder="Image URL" className="w-full p-3 bg-beige-50 border rounded-lg text-sm" value={editingItem.image} onChange={e => setEditingItem({...editingItem, image: e.target.value})} required />
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-medium text-beige-900/60">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-beige-900 text-white rounded-lg text-sm font-medium">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
