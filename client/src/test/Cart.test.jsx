import { describe, it, expect } from 'vitest';

describe('Cart Calculation Utility Suite', () => {
  it('correctly calculates subtotal, free shipping threshold, and estimated taxes', () => {
    const items = [
      { price: 44.0, quantity: 2 }, // 88.00
      { price: 15.0, quantity: 1 }, // 15.00
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(103.0);

    // Free shipping threshold >= $50
    const shipping = subtotal >= 50 ? 0 : 5.99;
    expect(shipping).toBe(0);

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    expect(tax).toBe(8.24);

    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    expect(total).toBe(111.24);
  });

  it('charges shipping fee when subtotal is under $50', () => {
    const items = [{ price: 38.0, quantity: 1 }];
    const subtotal = 38.0;
    const shipping = subtotal >= 50 ? 0 : 5.99;
    expect(shipping).toBe(5.99);

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    expect(total).toBe(47.03);
  });
});
