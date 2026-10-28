import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Building,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../../services/admin.service.js';
import { formatRupee } from '../../utils/currency.js';

export const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const loadSellers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSellers();
      setSellers(data || []);
    } catch (err) {
      console.error('Failed to load marketplace sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleToggleApproval = async (sellerId, currentApproved) => {
    try {
      await adminService.updateSellerStatus(sellerId, !currentApproved);
      setToastMessage(`Seller approval status updated.`);
      loadSellers();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update seller status.');
    }
  };

  const filtered = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.companyName && s.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (s.storeName && s.storeName.toLowerCase().includes(search.toLowerCase())) ||
      (s.sellerGstin && s.sellerGstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')}>&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
              &larr; Admin Overview
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Marketplace Sellers & Companies</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
              {sellers.length} Partners
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review registered seller enterprises, GSTIN credentials, catalog sizes, and platform revenue.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name, brand, or GSTIN..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
        />
      </div>

      {/* Sellers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading sellers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No marketplace sellers found matching "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Company & Store</th>
                  <th className="py-3.5 px-4">Contact & Hub</th>
                  <th className="py-3.5 px-4">GSTIN Identification</th>
                  <th className="py-3.5 px-4">Catalog SKUs</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Gross Revenue</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4 text-right">Approval Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Company & Brand */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block text-sm">
                          {seller.companyName || 'Sole Proprietorship'}
                        </span>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          <span>{seller.storeName || seller.name}</span>
                        </span>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="py-4 px-4 space-y-1 text-slate-600 dark:text-slate-400">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{seller.name}</p>
                      <p className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{seller.email}</span>
                      </p>
                      {seller.sellerCity && (
                        <p className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{seller.sellerCity}</span>
                        </p>
                      )}
                    </td>

                    {/* GSTIN */}
                    <td className="py-4 px-4">
                      {seller.sellerGstin ? (
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-200 font-semibold">
                          {seller.sellerGstin}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending submission</span>
                      )}
                    </td>

                    {/* Catalog SKUs */}
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {seller.totalProducts} SKUs
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {seller.totalOrdersCount}
                    </td>

                    {/* Revenue */}
                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                      {formatRupee(seller.totalRevenue)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {seller.isSellerApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Approved Partner
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
                          <XCircle className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleApproval(seller.id, seller.isSellerApproved)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors ${
                          seller.isSellerApproved
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {seller.isSellerApproved ? 'Revoke Approval' : 'Approve Partner'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellersPage;
