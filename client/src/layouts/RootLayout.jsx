import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import CartDrawer from '../components/cart/CartDrawer.jsx';
import Toast from '../components/common/Toast.jsx';
import { useCart } from '../context/CartContext.jsx';

export const RootLayout = () => {
  const { toast, showToast } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast toast={toast} onClose={() => showToast(null)} />
    </div>
  );
};

export default RootLayout;
