import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx';
import SellerOrdersPage from '../pages/seller/SellerOrdersPage.jsx';
import { adminService } from '../services/admin.service.js';
import { sellerService } from '../services/seller.service.js';
import { CartProvider } from '../context/CartContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

beforeAll(() => {
  window.scrollTo = vi.fn();
});

vi.mock('../services/admin.service.js', () => ({
  adminService: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

vi.mock('../services/seller.service.js', () => ({
  sellerService: {
    getOrders: vi.fn(),
    updateOrderItemStatus: vi.fn(),
  },
}));

const mockOrders = [
  {
    id: 'ord-101',
    orderNumber: 'KV-2026-10882',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah.mitchell@example.com',
    status: 'PROCESSING',
    total: 2475.64,
    shippingFee: 0,
    subtotal: 2098,
    createdAt: '2026-10-28T19:46:19.823Z',
    items: [
      {
        id: 'item-1',
        productName: 'Kivo Studio Wireless ANC Headphones',
        quantity: 1,
        total: 1499,
        status: 'PACKED',
      },
    ],
    shippingAddress: {
      fullName: 'Sarah Mitchell',
      street: 'Flat 402, Sea View',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
    },
  },
];

describe('Admin Orders & Seller Orders Component Rendering', () => {
  it('AdminOrdersPage fetches and renders customer orders with order count and back button', async () => {
    adminService.getOrders.mockResolvedValueOnce({
      orders: mockOrders,
      pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <AdminOrdersPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Initial render shows header
    expect(screen.getByText(/Customer Orders & Fulfillment/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Overview/i)).toBeInTheDocument();

    // After async load, orders are rendered
    await waitFor(() => {
      expect(screen.getByText('KV-2026-10882')).toBeInTheDocument();
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 Order/i)).toBeInTheDocument();
  });

  it('SellerOrdersPage fetches and renders buyer orders with back button', async () => {
    sellerService.getOrders.mockResolvedValueOnce({
      orders: mockOrders,
      pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <SellerOrdersPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Customer Orders Received/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Overview/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('KV-2026-10882')).toBeInTheDocument();
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });
  });
});
