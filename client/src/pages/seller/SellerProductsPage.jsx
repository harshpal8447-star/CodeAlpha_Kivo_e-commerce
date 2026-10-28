import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Zap,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  X,
  AlertCircle,
  Truck,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { sellerService } from '../../services/seller.service.js';
import { formatRupee } from '../../utils/currency.js';
import { exportToExcel } from '../../utils/excelExport.js';
import api from '../../services/api.js';

export const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('ALL_TABLES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    gender: 'UNISEX',
    sku: '',
    description: '',
    price: '',
    compareAtPrice: '',
    isMinutesEligible: false,
    minutesPrice: '',
    deliveryTimeMinutes: '12',
    minutesCategory: 'Fast Tech & Cables',
    stock: '15',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        sellerService.getProducts(),
        api.get('/categories'),
      ]);
      setProducts(prodRes?.products || []);
      setCategories(catRes?.data?.categories || catRes?.categories || []);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      sku: `KV-SEL-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      price: '',
      compareAtPrice: '',
      isMinutesEligible: false,
      minutesPrice: '',
      deliveryTimeMinutes: '12',
      minutesCategory: 'Fast Tech & Cables',
      stock: '25',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    const img = Array.isArray(prod.images) ? prod.images[0] : prod.images;
    setFormData({
      name: prod.name,
      categoryId: prod.categoryId,
      sku: prod.sku,
      description: prod.description,
      price: prod.price.toString(),
      compareAtPrice: prod.compareAtPrice ? prod.compareAtPrice.toString() : '',
      isMinutesEligible: Boolean(prod.isMinutesEligible),
      minutesPrice: prod.minutesPrice ? prod.minutesPrice.toString() : '',
      deliveryTimeMinutes: (prod.deliveryTimeMinutes || 12).toString(),
      minutesCategory: prod.minutesCategory || 'Fast Tech & Cables',
      stock: prod.stock.toString(),
      imageUrl: img || '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId || categories[0]?.id,
        sku: formData.sku,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        isMinutesEligible: Boolean(formData.isMinutesEligible),
        minutesPrice: formData.isMinutesEligible && formData.minutesPrice ? parseFloat(formData.minutesPrice) : null,
        deliveryTimeMinutes: formData.isMinutesEligible ? parseInt(formData.deliveryTimeMinutes, 10) : null,
        minutesCategory: formData.isMinutesEligible ? formData.minutesCategory : null,
        stock: parseInt(formData.stock, 10) || 0,
        images: [formData.imageUrl],
      };

      if (editingProduct) {
        await sellerService.updateProduct(editingProduct.id, payload);
        setToastMessage(`Product "${payload.name}" updated successfully!`);
      } else {
        await sellerService.createProduct(payload);
        setToastMessage(`Product "${payload.name}" listed in your store!`);
      }

      setIsModalOpen(false);
      loadData();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove "${name}" from your active store catalog?`)) {
      return;
    }

    try {
      await sellerService.deleteProduct(id);
      setToastMessage(`Product "${name}" removed from catalog.`);
      loadData();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to remove product.');
    }
  };

  const handleExportInventory = () => {
    if (!products || products.length === 0) {
      alert('No products available to export.');
      return;
    }

    const data = products.map((p) => ({
      'SKU': p.sku,
      'Product Name': p.name,
      'Category': p.category?.name || 'General',
      'Target Department': p.gender || 'UNISEX',
      'Standard Price (₹)': p.price,
      'Compare At Price (₹)': p.compareAtPrice || '',
      'Kivo Minutes Price (₹)': p.minutesPrice || '',
      '10-15 Min Eligible': p.isMinutesEligible ? 'YES' : 'NO',
      'Delivery SLA': p.isMinutesEligible ? `${p.deliveryTimeMinutes || 12} Mins` : '2-4 Days Standard',
      'Stock Units': p.stock,
      'Stock Health': p.stock <= 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock Alert' : 'Healthy',
      'Customer Rating': p.rating || 4.8,
      'Reviews Count': p.reviewCount || 0,
      'Listing Status': p.isActive ? 'Active' : 'Draft',
    }));

    exportToExcel(data, 'Kivo_Seller_Inventory_Catalog', 'Inventory');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')}>&times;</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>My Store Catalog</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
              {products.length} Products
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your product inventory, calibrate standard and Kivo Minutes pricing, and stock levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportInventory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
            title="Download complete catalog as Excel spreadsheet (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Catalog (.xlsx)</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search Input & Segment Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter products by title or SKU..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
          />
        </div>

        {/* Segmented Table View Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSegment('ALL_TABLES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedSegment === 'ALL_TABLES'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Segmented Tables</span>
          </button>

          <button
            onClick={() => setSelectedSegment('MINUTES_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedSegment === 'MINUTES_ONLY'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ 10–15 Min Table ({filteredProducts.filter((p) => p.isMinutesEligible).length})</span>
          </button>

          <button
            onClick={() => setSelectedSegment('STANDARD_ONLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedSegment === 'STANDARD_ONLY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Standard Courier Table ({filteredProducts.filter((p) => !p.isMinutesEligible).length})</span>
          </button>

          <button
            onClick={() => setSelectedSegment('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedSegment === 'LOW_STOCK'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Restock Alerts ({filteredProducts.filter((p) => p.stock < 10).length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading catalog tables...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-xs text-slate-500">No products matching your search criteria. Click "Add New Product" to list an item.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ⚡ TABLE 1: Kivo Minutes Quick-Delivery Products Table */}
          {(selectedSegment === 'ALL_TABLES' || selectedSegment === 'MINUTES_ONLY') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 overflow-hidden shadow-2xs">
              <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-b border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Zap className="w-5 h-5 fill-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>⚡ Kivo Minutes Dark-Store SKUs Table</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                        {filteredProducts.filter((p) => p.isMinutesEligible).length} Quick Items Listed
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Items stocked in automated micro-fulfillment hubs for guaranteed 10–15 min electric rider dispatch.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-50/50 dark:bg-amber-950/20 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">⚡ Quick Price</th>
                      <th className="py-3 px-4">Standard Price</th>
                      <th className="py-3 px-4">Delivery ETA</th>
                      <th className="py-3 px-4">Local Stock</th>
                      <th className="py-3 px-4">Quick Category</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/60 dark:divide-amber-900/40">
                    {filteredProducts
                      .filter((p) => p.isMinutesEligible)
                      .map((prod) => {
                        const img = Array.isArray(prod.images) ? prod.images[0] : prod.images;
                        return (
                          <tr key={prod.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                                />
                                <span className="font-bold text-slate-900 dark:text-white block max-w-xs truncate">
                                  {prod.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">{prod.sku}</td>
                            <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {formatRupee(prod.minutesPrice || prod.price)}
                            </td>
                            <td className="py-3 px-4 text-slate-400 line-through">
                              {formatRupee(prod.price)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-[10px]">
                                <Zap className="w-2.5 h-2.5" /> {prod.deliveryTimeMinutes || 12}m
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {prod.stock} units
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {prod.minutesCategory || 'Essentials'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(prod)}
                                  className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                                  title="Deactivate Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 📦 TABLE 2: Standard Shipping Products Table */}
          {(selectedSegment === 'ALL_TABLES' || selectedSegment === 'STANDARD_ONLY') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>📦 Standard Marketplace Courier Products Table</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                        {filteredProducts.filter((p) => !p.isMinutesEligible).length} Items (2–4 Days Delivery)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Standard catalog items fulfilled via insured surface and air couriers (Blue Dart & Delhivery).
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Delivery Mode</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProducts
                      .filter((p) => !p.isMinutesEligible)
                      .map((prod) => {
                        const img = Array.isArray(prod.images) ? prod.images[0] : prod.images;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                                />
                                <span className="font-bold text-slate-900 dark:text-white block max-w-xs truncate">
                                  {prod.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-500">{prod.sku}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {prod.category?.name || 'General'}
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                              {formatRupee(prod.price)}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {prod.stock} units
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                                <Truck className="w-2.5 h-2.5" /> 2–4 Days Standard
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(prod)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                                  title="Deactivate Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ⚠️ TABLE 3: Low Inventory Priority Restock Table */}
          {(selectedSegment === 'ALL_TABLES' || selectedSegment === 'LOW_STOCK') &&
            filteredProducts.filter((p) => p.stock < 10).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 overflow-hidden shadow-2xs">
                <div className="p-5 sm:p-6 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Low Stock Priority Table ({filteredProducts.filter((p) => p.stock < 10).length} items below 10 units)</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-rose-50/40 dark:bg-rose-950/10 text-slate-500 font-semibold uppercase text-[11px]">
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4">SKU</th>
                        <th className="py-2.5 px-4">Remaining Units</th>
                        <th className="py-2.5 px-4">Fulfillment Channel</th>
                        <th className="py-2.5 px-4 text-right">Replenish Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100/60 dark:divide-rose-950/40">
                      {filteredProducts
                        .filter((p) => p.stock < 10)
                        .map((prod) => (
                          <tr key={prod.id}>
                            <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{prod.name}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-500">{prod.sku}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold">
                                {prod.stock} units left
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              {prod.isMinutesEligible ? '⚡ Kivo Minutes Hub' : 'Standard Courier'}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => openEditModal(prod)}
                                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px]"
                              >
                                Restock Units
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <span>{editingProduct ? 'Edit Listed Product' : 'Add New Product to Store'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 65W Braided Fast-Charging USB-C Cable"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Standard Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Standard Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="499.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* ⚡ Kivo Minutes Hyperlocal Configuration */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      Kivo Minutes (10-15m Dark Store Fulfillment)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMinutesEligible}
                      onChange={(e) => setFormData({ ...formData, isMinutesEligible: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {formData.isMinutesEligible && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Minutes Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.minutesPrice}
                        onChange={(e) => setFormData({ ...formData, minutesPrice: e.target.value })}
                        placeholder="e.g. 199.00"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Delivery ETA
                      </label>
                      <select
                        value={formData.deliveryTimeMinutes}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeMinutes: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="10">10 Minutes (Ultra-Fast)</option>
                        <option value="12">12 Minutes (Standard)</option>
                        <option value="15">15 Minutes (Extended)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Minutes Category
                      </label>
                      <select
                        value={formData.minutesCategory}
                        onChange={(e) => setFormData({ ...formData, minutesCategory: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Instant Munchies">Instant Munchies</option>
                        <option value="Fast Tech & Cables">Fast Tech & Cables</option>
                        <option value="Beverages & Cold Brew">Beverages & Cold Brew</option>
                        <option value="Daily Care & Grooming">Daily Care & Grooming</option>
                        <option value="Desk Essentials">Desk Essentials</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Product Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe material, specifications, warranty, dimensions..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'List Product Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
