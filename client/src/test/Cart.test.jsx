import { describe, it, expect } from 'vitest';

describe('Cart Calculation Utility Suite (INR System)', () => {
  it('correctly calculates subtotal, free shipping threshold (₹999), and GST (18%)', () => {
    const items = [
      { price: 899.0, quantity: 2 }, // 1798.00
      { price: 499.0, quantity: 1 }, // 499.00
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(2297.0);

    // Free shipping threshold >= ₹999
    const shipping = subtotal >= 999 ? 0 : 99;
    expect(shipping).toBe(0);

    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    expect(tax).toBe(413.46);

    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    expect(total).toBe(2710.46);
  });

  it('charges shipping fee of ₹99 when subtotal is under ₹999', () => {
    const items = [{ price: 699.0, quantity: 1 }];
    const subtotal = 699.0;
    const shipping = subtotal >= 999 ? 0 : 99;
    expect(shipping).toBe(99);

    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    expect(tax).toBe(125.82);

    const total = parseFloat((subtotal + shipping + tax).toFixed(2));
    expect(total).toBe(923.82);
  });
});
