import prisma from '../lib/prisma.js';

// Helper to calculate totals
const formatCartResponse = (cart) => {
  if (!cart) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    };
  }

  const items = cart.items.map((item) => {
    const images = typeof item.product.images === 'string'
      ? JSON.parse(item.product.images)
      : item.product.images;

    const lineTotal = parseFloat((item.product.price * item.quantity).toFixed(2));

    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      sku: item.product.sku,
      price: item.product.price,
      compareAtPrice: item.product.compareAtPrice,
      image: Array.isArray(images) && images.length > 0 ? images[0] : null,
      stock: item.product.stock,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = parseFloat(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  // Free shipping over $50, else $5.99
  const shipping = subtotal === 0 || subtotal >= 50 ? 0 : 5.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // standard 8% estimated tax
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  return {
    items,
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
  };
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { cart: formatCartResponse(cart) },
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available.',
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock.`,
      });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${existingItem.quantity} in cart and stock is ${product.stock}.`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: qty,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `${product.name} added to your cart.`,
      data: { cart: formatCartResponse(updatedCart) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be 0 or greater.',
      });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (qty > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.product.stock} items available in stock.`,
        });
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: { cart: formatCartResponse(updatedCart) },
    });
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: { cart: formatCartResponse(updatedCart) },
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      data: {
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const syncCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { guestItems = [] } = req.body;

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    for (const gItem of guestItems) {
      if (!gItem.productId || !gItem.quantity) continue;

      const product = await prisma.product.findUnique({ where: { id: gItem.productId } });
      if (!product || !product.isActive || product.stock <= 0) continue;

      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: gItem.productId,
          },
        },
      });

      const desiredQty = existingItem
        ? Math.min(product.stock, existingItem.quantity + gItem.quantity)
        : Math.min(product.stock, gItem.quantity);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: desiredQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: gItem.productId,
            quantity: desiredQty,
          },
        });
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cart synchronized.',
      data: { cart: formatCartResponse(updatedCart) },
    });
  } catch (err) {
    next(err);
  }
};
