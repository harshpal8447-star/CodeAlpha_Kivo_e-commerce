import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import { productService } from '../services/product.service.js';
import { CartProvider } from '../context/CartContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

beforeAll(() => {
  window.scrollTo = vi.fn();
});

vi.mock('../services/product.service.js', () => ({
  productService: {
    getProduct: vi.fn(),
    submitReview: vi.fn(),
  },
}));

const mockProduct = {
  id: 'prod-123',
  name: 'Test Oxford Shirt',
  slug: 'test-oxford-shirt',
  description: 'A finely tailored button-down Oxford shirt in pure organic cotton.',
  price: 899.00,
  compareAtPrice: 1499.00,
  stock: 25,
  gender: 'MEN',
  images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'],
  category: { id: 'cat-1', name: 'Apparel', slug: 'apparel' },
  seller: { id: 'sel-1', name: 'Zenith Gear', storeName: 'Zenith Apparel', sellerCity: 'Mumbai' },
  reviews: [
    {
      id: 'rev-1',
      rating: 5,
      title: 'Superb quality and fit',
      comment: 'Very comfortable material and clean finish.',
      verifiedPurchase: true,
      createdAt: '2026-10-25T10:00:00.000Z',
      user: { id: 'u-1', name: 'Aarav Sharma' },
    },
  ],
};

describe('ProductDetailPage Component Rendering', () => {
  it('renders product details and customer reviews without crashing or white screen', async () => {
    productService.getProduct.mockResolvedValueOnce({
      product: mockProduct,
      related: [],
    });

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={['/products/test-oxford-shirt']}>
            <Routes>
              <Route path="/products/:identifier" element={<ProductDetailPage />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    // Initial loading skeleton should be shown
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

    // After async load finishes, product detail must be rendered without crashing
    await waitFor(() => {
      const titles = screen.getAllByText('Test Oxford Shirt');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText(/A finely tailored button-down Oxford shirt/i)).toBeInTheDocument();
    expect(screen.getByText('Superb quality and fit')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
  });
});
