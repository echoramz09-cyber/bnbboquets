/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, LogOut, Package, Image as ImageIcon, 
  Settings, Menu, X, Plus, Trash2, Save, Edit2, Upload, ArrowLeft,
  Search, ImageOff, CheckCircle2, Filter, Eye, AlertCircle,
  Maximize2, Crop, RectangleVertical, Square
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, doc, updateDoc, setDoc, deleteDoc, 
  addDoc, onSnapshot, query, orderBy 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Category, Product, CarouselImage, SiteSettings } from '../types';
import { compressImageFile, formatPrice } from '../lib/imageUtils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state for easier navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Deletion Confirmation Modal state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name?: string; type: 'Products' | 'Collections' | 'Carousel' } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
      showToast("✓ Site settings saved successfully!");
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast("Error saving settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openEditProductModal = (prod?: Product) => {
    if (!prod) {
      setEditingItem({
        id: '',
        name: '',
        description: '',
        price: '',
        image: '',
        images: ['', '', '', '', ''],
        imageAspectRatio: 'square',
        imageAspectRatios: ['square', 'square', 'square', 'square', 'square'],
        tag: 'New',
        categoryId: categories[0]?.id || '',
        order: products.length + 1
      });
    } else {
      const productImages = prod.images && Array.isArray(prod.images) && prod.images.length > 0
        ? [...prod.images]
        : (prod.image ? [prod.image] : []);
      while (productImages.length < 5) {
        productImages.push('');
      }

      const defaultRatios = prod.imageAspectRatios && Array.isArray(prod.imageAspectRatios)
        ? [...prod.imageAspectRatios]
        : [];
      while (defaultRatios.length < 5) {
        defaultRatios.push(prod.imageAspectRatio || 'square');
      }

      setEditingItem({
        name: '',
        description: '',
        price: '',
        image: '',
        tag: '',
        categoryId: categories[0]?.id || '',
        imageAspectRatio: prod.imageAspectRatio || 'square',
        ...prod,
        images: productImages.slice(0, 5),
        imageAspectRatios: defaultRatios.slice(0, 5)
      });
    }
    setIsModalOpen(true);
  };

  const updateProductImageSlotRatio = (index: number, ratio: 'square' | 'portrait') => {
    setEditingItem((prev: any) => {
      if (!prev) return null;
      const currentRatios = Array.isArray(prev.imageAspectRatios) ? [...prev.imageAspectRatios] : ['square', 'square', 'square', 'square', 'square'];
      while (currentRatios.length <= index) {
        currentRatios.push('square');
      }
      currentRatios[index] = ratio;
      // also update global imageAspectRatio if it's the main image slot (index 0)
      const mainRatio = index === 0 ? ratio : (prev.imageAspectRatio || currentRatios[0] || 'square');
      return { ...prev, imageAspectRatios: currentRatios, imageAspectRatio: mainRatio };
    });
  };

  const handleProductImageSlotUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file);
      setEditingItem((prev: any) => {
        if (!prev) return null;
        const currentImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
        while (currentImages.length <= index) {
          currentImages.push('');
        }
        currentImages[index] = dataUrl;
        const mainImg = currentImages.find((img: string) => Boolean(img && img.trim())) || '';
        return { ...prev, images: currentImages, image: mainImg };
      });
      showToast(`Product Image #${index + 1} uploaded! Select shape below.`);
    } catch (err) {
      console.error("Failed to compress image:", err);
      alert("Failed to process image file. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateProductImageSlotUrl = (index: number, url: string) => {
    setEditingItem((prev: any) => {
      if (!prev) return null;
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
      while (currentImages.length <= index) {
        currentImages.push('');
      }
      currentImages[index] = url;
      const mainImg = currentImages.find((img: string) => Boolean(img && img.trim())) || '';
      return { ...prev, images: currentImages, image: mainImg };
    });
  };

  const removeProductImageSlot = (index: number) => {
    setEditingItem((prev: any) => {
      if (!prev) return null;
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
      if (index < currentImages.length) {
        currentImages[index] = '';
      }
      const mainImg = currentImages.find((img: string) => Boolean(img && img.trim())) || '';
      return { ...prev, images: currentImages, image: mainImg };
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file);
      setEditingItem((prev: any) => ({ ...prev, image: dataUrl }));
      showToast("Image uploaded to item successfully!");
    } catch (err) {
      console.error("Failed to compress image:", err);
      alert("Failed to process image file. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...editingItem };
    if (activeTab === 'Products') {
      if (data.price) {
        data.price = formatPrice(data.price);
      }
      const rawImages = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []);
      const rawRatios = Array.isArray(data.imageAspectRatios) ? data.imageAspectRatios : [];
      
      const cleanImages: string[] = [];
      const cleanRatios: ('square' | 'portrait')[] = [];

      rawImages.forEach((img: string, idx: number) => {
        const trimmed = (img || '').trim();
        if (trimmed.length > 0 && cleanImages.length < 5) {
          cleanImages.push(trimmed);
          cleanRatios.push(rawRatios[idx] || 'square');
        }
      });

      data.images = cleanImages;
      data.imageAspectRatios = cleanRatios;
      data.image = cleanImages[0] || data.image || "";
      data.imageAspectRatio = cleanRatios[0] || data.imageAspectRatio || 'square';
    }
    const collectionName = activeTab.toLowerCase() === 'carousel' ? 'carousel' : activeTab.toLowerCase();
    
    if (data.id && !data.id.startsWith('new-')) {
      const { id, ...updateData } = data;
      await updateDoc(doc(db, collectionName, id), updateData);
      showToast(`${activeTab.slice(0, -1)} updated successfully!`);
    } else {
      const { id, ...newData } = data;
      await addDoc(collection(db, collectionName), {
        ...newData,
        order: (activeTab === 'Products' ? products : activeTab === 'Collections' ? categories : carousel).length + 1
      });
      showToast(`New ${activeTab.slice(0, -1)} added successfully!`);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const requestDeleteItem = (id: string, name?: string, explicitType?: 'Products' | 'Collections' | 'Carousel') => {
    const targetType = explicitType || (activeTab as 'Products' | 'Collections' | 'Carousel');
    setItemToDelete({ id, name, type: targetType });
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeletingItem(true);
    try {
      const collectionName = itemToDelete.type === 'Carousel' ? 'carousel' : itemToDelete.type === 'Collections' ? 'categories' : 'products';
      await deleteDoc(doc(db, collectionName, itemToDelete.id));

      // If deleting a product, clean up local cart if present
      if (itemToDelete.type === 'Products') {
        try {
          const saved = localStorage.getItem("bright_n_bliss_cart");
          if (saved) {
            const parsed = JSON.parse(saved);
            const filtered = parsed.filter((item: any) => item.product?.id !== itemToDelete.id);
            localStorage.setItem("bright_n_bliss_cart", JSON.stringify(filtered));
          }
        } catch (e) {
          console.error("Cart update error on product deletion:", e);
        }
      }

      const label = itemToDelete.name ? `"${itemToDelete.name}"` : 'Item';
      showToast(`✓ ${label} deleted permanently. It will no longer appear in your store.`);
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete item from Firestore:", err);
      showToast("Error deleting item. Please check network connection.");
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Filtered products list based on search and category filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categories, searchQuery]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', desc: 'Store Overview' },
    { icon: Package, label: 'Products', desc: 'Add & Remove Items' },
    { icon: ImageIcon, label: 'Collections', desc: 'Category Groups' },
    { icon: ImageIcon, label: 'Carousel', desc: 'Banner Sliders' },
    { icon: Settings, label: 'Settings', desc: 'Store Info & Branding' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige-100 flex items-center justify-center font-montserrat">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#5d4037] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-beige-900">Loading Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 flex flex-col md:flex-row font-montserrat text-beige-900">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#5d4037] text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold border border-beige-300"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <span className="text-xs font-bold uppercase tracking-wider text-[#5d4037]">{activeTab}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/')} 
            className="px-2.5 py-1.5 bg-beige-100 hover:bg-beige-200 rounded-lg text-beige-900 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="View Live Website"
          >
            <Eye size={14} />
            <span>View Site</span>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-beige-100 rounded-lg text-beige-900 hover:bg-beige-200 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-beige-200 p-6 flex flex-col transition-transform duration-300 transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-signature text-beige-900 lowercase">bright n bliss</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#5d4037] font-extrabold mt-0.5">Admin Store Manager</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-beige-900 hover:bg-beige-100 rounded-lg"><X size={20} /></button>
        </div>

        <nav className="flex-grow space-y-1.5">
          {navItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); setSearchQuery(''); }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.label 
                  ? 'bg-[#5d4037] text-white shadow-sm' 
                  : 'text-beige-900/70 hover:bg-beige-100 hover:text-beige-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] font-normal ${activeTab === item.label ? 'text-beige-200' : 'text-beige-900/40'}`}>
                {item.label === 'Products' ? products.length : item.label === 'Collections' ? categories.length : ''}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 mt-auto space-y-2 border-t border-beige-200">
          <button 
            onClick={() => { setIsSidebarOpen(false); navigate('/'); }} 
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-beige-900 hover:bg-beige-100 rounded-xl text-xs font-bold transition-all cursor-pointer border border-beige-300/60"
          >
            <Eye size={16} className="text-[#5d4037]" />
            <span>Preview Live Site</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-200 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Bar */}
        <header className="hidden md:flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-beige-200 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold text-beige-900">{activeTab}</h2>
            <p className="text-xs text-beige-900/60">
              {activeTab === 'Dashboard' && 'Quick overview of store inventory & actions'}
              {activeTab === 'Products' && 'Manage catalog products, pricing, and images'}
              {activeTab === 'Collections' && 'Group products into category collections'}
              {activeTab === 'Carousel' && 'Upload and arrange home banner images'}
              {activeTab === 'Settings' && 'Customize site headers, footers & branding'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-3.5 py-2 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-xl text-xs font-bold transition-all border border-beige-300/60 cursor-pointer"
            >
              <Eye size={15} className="text-[#5d4037]" />
              <span>Live Website</span>
            </button>
            <div className="h-6 w-px bg-beige-200" />
            <div className="text-right">
              <p className="text-xs font-bold text-beige-900">Administrator</p>
              <p className="text-[10px] text-beige-900/50">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Dashboard Overview */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-beige-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d4037]">Total Collections</span>
                <p className="text-3xl font-extrabold text-beige-900">{categories.length}</p>
                <p className="text-[11px] text-beige-900/60">Active product categories</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-beige-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d4037]">Active Products</span>
                <p className="text-3xl font-extrabold text-beige-900">{products.length}</p>
                <p className="text-[11px] text-beige-900/60">Items in catalog database</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-beige-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d4037]">Carousel Banners</span>
                <p className="text-3xl font-extrabold text-beige-900">{carousel.length}</p>
                <p className="text-[11px] text-beige-900/60">Homepage slide banners</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-beige-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-beige-900">Quick Management Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => openEditProductModal()} 
                  className="p-4 bg-[#FFF7E6] rounded-xl border border-beige-300 hover:border-[#5d4037] transition-all text-left flex items-center space-x-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#5d4037] text-white rounded-lg flex items-center justify-center shrink-0">
                    <Plus size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-beige-900 group-hover:text-[#5d4037] block">Add New Product</span>
                    <span className="text-[10px] text-beige-900/60">Upload up to 5 images & price</span>
                  </div>
                </button>

                <button 
                  onClick={() => { 
                    setActiveTab('Collections'); 
                    setEditingItem({ id: '', name: '', description: '', image: '', order: categories.length + 1 }); 
                    setIsModalOpen(true); 
                  }} 
                  className="p-4 bg-[#FFF7E6] rounded-xl border border-beige-300 hover:border-[#5d4037] transition-all text-left flex items-center space-x-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#5d4037] text-white rounded-lg flex items-center justify-center shrink-0">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-beige-900 group-hover:text-[#5d4037] block">Add New Collection</span>
                    <span className="text-[10px] text-beige-900/60">Create category group</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('Products')} 
                  className="p-4 bg-[#FFF7E6] rounded-xl border border-beige-300 hover:border-[#5d4037] transition-all text-left flex items-center space-x-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#5d4037] text-white rounded-lg flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-beige-900 group-hover:text-[#5d4037] block">Manage Products Catalog</span>
                    <span className="text-[10px] text-beige-900/60">View & edit products & gallery</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'Collections' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-beige-200">
              <div>
                <h3 className="text-base font-bold text-beige-900">Collections ({categories.length})</h3>
                <p className="text-xs text-beige-900/60">Organize flower arrangements and gifts into categories</p>
              </div>
              <button 
                onClick={() => { 
                  setEditingItem({ id: '', name: '', description: '', image: '', order: categories.length + 1 }); 
                  setIsModalOpen(true); 
                }} 
                className="bg-[#5d4037] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm hover:bg-[#4a332c]"
              >
                <Plus size={16} /> <span>New Collection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-2xs group flex flex-col justify-between">
                  <div>
                    <div className="aspect-video bg-beige-200 relative">
                      {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-beige-900/40 p-4">
                          <ImageOff size={28} />
                          <span className="text-xs font-semibold mt-1">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-beige-900">{cat.name}</h4>
                      <p className="text-xs text-beige-900/60 line-clamp-2 mt-1">{cat.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 border-t border-beige-100 bg-beige-50/50 flex items-center justify-between">
                    <button 
                      onClick={() => { setEditingItem({ name: '', description: '', image: '', ...cat }); setIsModalOpen(true); }} 
                      className="px-3 py-1.5 bg-white border border-beige-300 rounded-lg text-xs font-bold text-beige-900 flex items-center space-x-1 hover:bg-beige-100 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} /> <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => requestDeleteItem(cat.id, cat.name, 'Collections')} 
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center space-x-1 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Management Tab */}
        {activeTab === 'Products' && (
          <div className="space-y-6">
            {/* Top Toolbar: Search & Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-beige-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-beige-900">Products Catalog ({products.length})</h3>
                  <p className="text-xs text-beige-900/60">Manage products, pricing, and up to 5 gallery images inside edit options</p>
                </div>
                <button 
                  onClick={() => openEditProductModal()} 
                  className="bg-[#5d4037] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm hover:bg-[#4a332c]"
                >
                  <Plus size={16} /> <span>Add Product</span>
                </button>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-beige-100">
                <div className="relative flex-grow">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-beige-900/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product by name or description..."
                    className="w-full pl-9 pr-4 py-2 bg-beige-50 border border-beige-300 rounded-xl text-xs font-semibold text-beige-900 focus:outline-none focus:border-[#5d4037]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-beige-900/50 hover:text-beige-900">
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Filter size={15} className="text-beige-900/50" />
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-beige-50 border border-beige-300 rounded-xl text-xs font-bold text-beige-900 focus:outline-none focus:border-[#5d4037]"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({products.filter(p => p.categoryId === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Card & Table Views */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-beige-200 text-center space-y-2">
                <Package size={40} className="mx-auto text-beige-900/30 mb-2" />
                <h4 className="font-bold text-sm text-beige-900">No Products Found</h4>
                <p className="text-xs text-beige-900/60">Try adjusting your search query or filter selection.</p>
              </div>
            ) : (
              <>
                {/* Mobile View Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-beige-200 shadow-2xs space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-beige-200 shrink-0 border border-beige-300">
                          {prod.image ? (
                            <img src={prod.image} className="w-full h-full object-cover" alt={prod.name} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-beige-900/40 p-1">
                              <ImageOff size={20} />
                              <span className="text-[9px] font-bold">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-xs text-beige-900 truncate">{prod.name}</h4>
                          <span className="text-[10px] text-beige-900/60 block truncate mt-0.5">
                            {categories.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
                          </span>
                          <span className="text-xs font-extrabold text-[#5d4037] block mt-1">{formatPrice(prod.price)}</span>
                        </div>
                      </div>

                      {/* Card Actions Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-beige-100 gap-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-beige-900/50">
                            {prod.images && prod.images.filter(Boolean).length > 0 
                              ? `${prod.images.filter(Boolean).length} image(s)` 
                              : (prod.image ? '1 image' : 'No image')}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            {prod.imageAspectRatio === 'portrait' ? 'Portrait 3:4' : 'Square 1:1'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="px-2.5 py-1 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1"
                            title="Edit Product Details & Images"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => requestDeleteItem(prod.id, prod.name, 'Products')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-beige-100/70 border-b border-beige-200 text-xs font-bold uppercase tracking-wider text-beige-900/70">
                        <th className="px-6 py-3.5">Product & Image</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Price</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-100 text-xs">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-beige-50/60 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-beige-200 shrink-0 border border-beige-300">
                                {prod.image ? (
                                  <img src={prod.image} className="w-full h-full object-cover" alt={prod.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-beige-900/40">
                                    <ImageOff size={16} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-beige-900 block">{prod.name}</span>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  {prod.tag && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#5d4037] bg-beige-100 px-2 py-0.5 rounded">
                                      {prod.tag}
                                    </span>
                                  )}
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                    {prod.imageAspectRatio === 'portrait' ? 'Portrait (3:4)' : 'Square (1:1)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-beige-900/70">
                            {categories.find(c => c.id === prod.categoryId)?.name || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-[#5d4037]">{formatPrice(prod.price)}</td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => openEditProductModal(prod)} 
                                className="px-3 py-1.5 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer transition-colors text-xs"
                                title="Edit Product Details & Images"
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>
                              <button 
                                onClick={() => requestDeleteItem(prod.id, prod.name, 'Products')} 
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold cursor-pointer transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Carousel Images Tab */}
        {activeTab === 'Carousel' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-beige-200">
              <div>
                <h3 className="text-base font-bold text-beige-900">Homepage Carousel Sliders ({carousel.length})</h3>
                <p className="text-xs text-beige-900/60">Upload header background banner photos</p>
              </div>
              <button 
                onClick={() => { setEditingItem({ id: '', image: '', order: carousel.length + 1 }); setIsModalOpen(true); }} 
                className="bg-[#5d4037] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm hover:bg-[#4a332c]"
              >
                <Plus size={16} /> <span>Add Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {carousel.map((img) => (
                <div key={img.id} className="relative group aspect-[3/4] bg-beige-200 rounded-2xl overflow-hidden shadow-2xs border border-beige-300">
                  <img src={img.image} className="w-full h-full object-cover" alt="Carousel item" />
                  <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                    <button onClick={() => { setEditingItem(img); setIsModalOpen(true); }} className="p-2 bg-white rounded-full text-beige-900 shadow-md hover:bg-beige-100 cursor-pointer"><Edit2 size={16} /></button>
                    <button onClick={() => requestDeleteItem(img.id, undefined, 'Carousel')} className="p-2 bg-white rounded-full text-red-500 shadow-md hover:bg-red-50 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Settings Tab */}
        {activeTab === 'Settings' && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
            <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-beige-200 shadow-2xs sticky top-14 md:top-4 z-20">
              <div>
                <h3 className="text-base font-bold text-beige-900">Store Branding Settings</h3>
                <p className="text-xs text-beige-900/50">Update store title, hero banner headers & footers</p>
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-[#5d4037] hover:bg-[#4a332c] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                <span>{isSavingSettings ? 'Saving...' : settingsSavedSuccess ? 'Saved!' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-beige-200 space-y-4">
              <h4 className="font-bold text-sm text-[#5d4037] uppercase tracking-wider">Store Logo Text</h4>
              <input 
                type="text" 
                value={settingsForm?.logo || ''} 
                onChange={(e) => setSettingsForm(prev => prev ? { ...prev, logo: e.target.value } : null)}
                className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5d4037]" 
              />
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-beige-200 space-y-4">
              <h4 className="font-bold text-sm text-[#5d4037] uppercase tracking-wider">Hero Section Text</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-beige-900/70 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={settingsForm?.hero?.title || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, hero: { ...prev.hero || { title: '', subtitle: '' }, title: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5d4037]" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-beige-900/70 mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={settingsForm?.hero?.subtitle || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, hero: { ...prev.hero || { title: '', subtitle: '' }, subtitle: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5d4037]" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-beige-200 space-y-4">
              <h4 className="font-bold text-sm text-[#5d4037] uppercase tracking-wider">Footer Copyright Content</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-beige-900/70 mb-1">Tagline</label>
                  <input 
                    type="text" 
                    value={settingsForm?.footer?.tagline || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, footer: { ...prev.footer || { tagline: '', copyright: '' }, tagline: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5d4037]" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-beige-900/70 mb-1">Copyright Line</label>
                  <input 
                    type="text" 
                    value={settingsForm?.footer?.copyright || ''} 
                    onChange={(e) => setSettingsForm(prev => prev ? { ...prev, footer: { ...prev.footer || { tagline: '', copyright: '' }, copyright: e.target.value } } : null)}
                    className="w-full bg-beige-50 border border-beige-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#5d4037]" 
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Edit / Create Item Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-montserrat"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-beige-200 flex justify-between items-center shrink-0 bg-[#FFF7E6]">
                <div>
                  <h3 className="font-bold text-base text-beige-900">
                    {editingItem.id ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                  </h3>
                  <p className="text-[11px] text-beige-900/60">Fill in the fields below and click Save Changes</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-beige-900/60 hover:text-beige-900 hover:bg-beige-200 transition-colors cursor-pointer"><X size={18} /></button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveItem} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-grow text-xs">
                {activeTab === 'Collections' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-beige-900">Collection Name *</label>
                      <input placeholder="e.g. Fresh Flowers" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-semibold text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-beige-900">Description *</label>
                      <textarea placeholder="Brief description of the collection" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-medium text-beige-900 h-20 focus:outline-none focus:border-[#5d4037]" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} required />
                    </div>

                    {/* Image Section with Option to Remove Image */}
                    <div className="space-y-2 pt-2 border-t border-beige-200">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-beige-900">Collection Cover Image</label>
                        {editingItem.image && (
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, image: '' })}
                            className="text-red-600 hover:text-red-700 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                          >
                            <ImageOff size={13} />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>

                      <label className="cursor-pointer border-2 border-dashed border-beige-300 hover:border-[#5d4037] bg-beige-50 hover:bg-beige-100 rounded-xl p-3.5 flex flex-col items-center justify-center transition-all text-center group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} disabled={isUploadingImage} />
                        <Upload size={20} className="text-beige-900/50 group-hover:text-[#5d4037] mb-1 transition-colors" />
                        <span className="font-bold text-beige-900 group-hover:text-[#5d4037]">
                          {isUploadingImage ? "Uploading Image..." : "Upload Image File"}
                        </span>
                      </label>

                      {editingItem.image ? (
                        <div className="relative rounded-xl overflow-hidden border border-beige-300 aspect-video bg-beige-100 max-h-36 flex items-center justify-center">
                          <img src={editingItem.image} alt="Preview" className="h-full w-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setEditingItem({...editingItem, image: ''})} 
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-beige-100 rounded-xl text-center text-beige-900/50 text-[11px] font-semibold">
                          No image currently attached.
                        </div>
                      )}

                      <input placeholder="Or paste direct Image URL" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-medium focus:outline-none focus:border-[#5d4037]" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} />
                    </div>
                  </>
                )}

                {activeTab === 'Products' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-beige-900">Product Name *</label>
                      <input placeholder="e.g. Red Rose Bouquet" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-semibold text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-beige-900">Price (₹) *</label>
                        <input placeholder="e.g. 699" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-semibold text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} required />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-beige-900">Category *</label>
                        <select className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-semibold text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.categoryId || ''} onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})} required>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-beige-900">Tag / Badge</label>
                        <input placeholder="e.g. Bestseller, New" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-medium text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.tag || ''} onChange={e => setEditingItem({...editingItem, tag: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-beige-900">Description</label>
                        <input placeholder="Short details" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-medium text-beige-900 focus:outline-none focus:border-[#5d4037]" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} />
                      </div>
                    </div>

                    {/* Product Images Section (Up to 5 Images) */}
                    <div className="space-y-3 pt-3 border-t border-beige-200">
                      <div>
                        <label className="font-bold text-beige-900 text-xs block">Product Images (Up to 5 Images)</label>
                        <span className="text-[10px] text-beige-900/60 block mt-0.5">
                          Upload or link up to 5 photos for product gallery. Image #1 serves as the primary cover.
                        </span>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {[0, 1, 2, 3, 4].map((slotIdx) => {
                          const currentImages = Array.isArray(editingItem.images) ? editingItem.images : (editingItem.image ? [editingItem.image] : []);
                          const currentRatios = Array.isArray(editingItem.imageAspectRatios) ? editingItem.imageAspectRatios : [];
                          const slotVal = currentImages[slotIdx] || '';
                          const slotRatio = currentRatios[slotIdx] || editingItem.imageAspectRatio || 'square';
                          const isSlotPortrait = slotRatio === 'portrait';

                          return (
                            <div key={slotIdx} className="p-3 bg-beige-50 rounded-xl border border-beige-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-xs text-[#5d4037]">
                                    Image #{slotIdx + 1} {slotIdx === 0 ? '(Main Cover)' : ''}
                                  </span>
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                    isSlotPortrait ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-beige-200 text-beige-900 border-beige-300'
                                  }`}>
                                    {isSlotPortrait ? 'Portrait 3:4' : 'Square 1:1'}
                                  </span>
                                </div>
                                {slotVal && (
                                  <button
                                    type="button"
                                    onClick={() => removeProductImageSlot(slotIdx)}
                                    className="text-red-600 hover:text-red-700 font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                                    title="Remove this image slot"
                                  >
                                    <Trash2 size={12} />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center space-x-3">
                                {slotVal ? (
                                  <div className={`relative w-14 rounded-lg overflow-hidden border border-beige-300 bg-beige-200 shrink-0 ${
                                    isSlotPortrait ? 'aspect-[3/4]' : 'aspect-square'
                                  }`}>
                                    <img src={slotVal} alt={`Slot ${slotIdx + 1}`} className={`w-full h-full ${isSlotPortrait ? 'object-contain bg-[#faf6f0]' : 'object-cover'}`} />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-lg border border-dashed border-beige-300 bg-white flex flex-col items-center justify-center shrink-0 text-beige-900/40">
                                    <ImageIcon size={16} />
                                    <span className="text-[9px] font-semibold mt-0.5">Empty</span>
                                  </div>
                                )}

                                <div className="flex-grow space-y-1.5 min-w-0">
                                  <div className="flex items-center space-x-1.5">
                                    <label className="inline-flex items-center space-x-1 px-2 py-1 bg-white border border-beige-300 hover:bg-beige-100 rounded-lg text-[10px] font-bold text-beige-900 cursor-pointer shadow-2xs shrink-0">
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleProductImageSlotUpload(slotIdx, e)} 
                                        disabled={isUploadingImage} 
                                      />
                                      <Upload size={11} />
                                      <span>{slotVal ? "Replace" : "Upload"}</span>
                                    </label>
                                    <input 
                                      placeholder="Or paste direct Image URL" 
                                      className="flex-grow min-w-0 p-1 bg-white border border-beige-300 rounded-lg text-[10px] font-medium text-beige-900 focus:outline-none focus:border-[#5d4037]" 
                                      value={slotVal} 
                                      onChange={(e) => updateProductImageSlotUrl(slotIdx, e.target.value)} 
                                    />
                                  </div>

                                  {/* Individual Image Shape Selector */}
                                  <div className="flex items-center space-x-2 pt-0.5">
                                    <span className="text-[10px] font-bold text-beige-900/70">Shape:</span>
                                    <div className="flex items-center space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => updateProductImageSlotRatio(slotIdx, 'square')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                                          !isSlotPortrait
                                            ? 'bg-[#5d4037] text-white shadow-2xs'
                                            : 'bg-white text-beige-900 border border-beige-300 hover:bg-beige-100'
                                        }`}
                                      >
                                        <Square size={10} />
                                        <span>Square (1:1)</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateProductImageSlotRatio(slotIdx, 'portrait')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                                          isSlotPortrait
                                            ? 'bg-[#5d4037] text-white shadow-2xs'
                                            : 'bg-white text-beige-900 border border-beige-300 hover:bg-beige-100'
                                        }`}
                                      >
                                        <RectangleVertical size={10} />
                                        <span>Portrait (3:4)</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Image Display Shape (Aspect Ratio) Option */}
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-beige-900 text-xs flex items-center space-x-1.5">
                            <Maximize2 size={14} className="text-[#5d4037]" />
                            <span>Image Display Shape / Aspect Ratio</span>
                          </label>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5d4037] bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                            {(editingItem.imageAspectRatio || 'square') === 'portrait' ? 'Portrait (3:4)' : 'Square (1:1)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-beige-900/75 leading-relaxed">
                          Choose <strong>Portrait (3:4)</strong> if your uploaded photos are vertical or long so they display fully in your store without awkward cropping. Choose <strong>Square (1:1)</strong> for standard square photos.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, imageAspectRatio: 'square' })}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                              (editingItem.imageAspectRatio || 'square') === 'square'
                                ? 'bg-[#5d4037] text-white border-[#5d4037] shadow-xs'
                                : 'bg-white text-beige-900 border-beige-300 hover:bg-beige-100'
                            }`}
                          >
                            <Square size={15} />
                            <span>Square (1:1)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, imageAspectRatio: 'portrait' })}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                              editingItem.imageAspectRatio === 'portrait'
                                ? 'bg-[#5d4037] text-white border-[#5d4037] shadow-xs'
                                : 'bg-white text-beige-900 border-beige-300 hover:bg-beige-100'
                            }`}
                          >
                            <RectangleVertical size={15} />
                            <span>Portrait (3:4)</span>
                          </button>
                        </div>

                        {/* Live Store Preview Box */}
                        {(editingItem.image || (editingItem.images && editingItem.images.find(Boolean))) && (
                          <div className="pt-2 border-t border-amber-200/60 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-beige-900/70 block mb-1.5 self-start">
                              Store Front Display Preview ({editingItem.imageAspectRatio === 'portrait' ? 'Portrait 3:4' : 'Square 1:1'}):
                            </span>
                            <div className={`w-36 rounded-xl overflow-hidden border-2 border-[#5d4037] bg-white transition-all shadow-xs ${
                              editingItem.imageAspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
                            }`}>
                              <img
                                src={editingItem.image || (editingItem.images && editingItem.images.find(Boolean))}
                                alt="Store preview"
                                className={`w-full h-full ${editingItem.imageAspectRatio === 'portrait' ? 'object-contain bg-[#faf6f0]' : 'object-cover'}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'Carousel' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-beige-900">Carousel Slide Image</label>
                      {editingItem.image && (
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, image: '' })}
                          className="text-red-600 hover:text-red-700 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <ImageOff size={13} />
                          <span>Remove Image</span>
                        </button>
                      )}
                    </div>

                    <label className="cursor-pointer border-2 border-dashed border-beige-300 hover:border-[#5d4037] bg-beige-50 hover:bg-beige-100 rounded-xl p-4 flex flex-col items-center justify-center transition-all text-center group">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} disabled={isUploadingImage} />
                      <Upload size={22} className="text-beige-900/50 group-hover:text-[#5d4037] mb-1 transition-colors" />
                      <span className="font-bold text-beige-900 group-hover:text-[#5d4037]">
                        {isUploadingImage ? "Uploading Image..." : "Upload Carousel Image File"}
                      </span>
                    </label>

                    {editingItem.image && (
                      <div className="relative rounded-xl overflow-hidden border border-beige-300 aspect-video bg-beige-100 max-h-36 flex items-center justify-center">
                        <img src={editingItem.image} alt="Preview" className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setEditingItem({...editingItem, image: ''})} 
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                    <input placeholder="Or paste direct Image URL" className="w-full p-2.5 bg-beige-50 border border-beige-300 rounded-xl font-medium focus:outline-none focus:border-[#5d4037]" value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-beige-200 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-beige-900/60 hover:text-beige-900 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-[#5d4037] text-white rounded-xl text-xs font-bold hover:bg-[#4a332c] shadow-sm cursor-pointer">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Deletion Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingItem && setItemToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden font-montserrat p-6 space-y-4 border border-beige-200"
            >
              <div className="flex items-center space-x-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-beige-900">Confirm Deletion</h3>
                  <p className="text-xs text-beige-900/60">
                    {itemToDelete.type === 'Products' ? 'Delete Product' : itemToDelete.type === 'Collections' ? 'Delete Collection' : 'Delete Slide'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-100 text-xs text-beige-900/80 leading-relaxed space-y-2">
                <p>
                  Are you sure you want to delete{" "}
                  <strong className="text-beige-900 font-bold">
                    {itemToDelete.name ? `"${itemToDelete.name}"` : 'this item'}
                  </strong>
                  ?
                </p>
                <p className="text-[11px] text-red-700 font-medium">
                  ⚠️ It will be permanently deleted from Firestore and will not appear again anywhere in your store.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeletingItem}
                  className="px-4 py-2 bg-beige-100 hover:bg-beige-200 text-beige-900 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteItem}
                  disabled={isDeletingItem}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeletingItem ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
