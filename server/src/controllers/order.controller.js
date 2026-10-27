import prisma from '../lib/prisma.js';

// Generate unique order number: KV-YEAR-XXXXX
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `KV-${year}-${randomNum}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod = 'DEMO_PAYMENT',
      paymentSimulation = 'SUCCESS', // 'SUCCESS', 'FAILED', or 'PENDING'
      promoCode,
    } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return res.status(400).json({
        success: false,
        message: 'A complete shipping address is required.',
      });
    }

    // Fetch user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    // Step 1: Pre-validate stock and prices authoritatively
    let calculatedSubtotal = 0;
    const itemsToOrder = [];

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is no longer available.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`,
        });
      }

      const images = typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images;

      const unitPrice = product.price;
      const lineTotal = parseFloat((unitPrice * item.quantity).toFixed(2));
      calculatedSubtotal += lineTotal;

      itemsToOrder.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: Array.isArray(images) && images.length > 0 ? images[0] : null,
        unitPrice,
        quantity: item.quantity,
        total: lineTotal,
      });
    }

    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    // Calculate discount
    let discount = 0;
    if (promoCode && promoCode.toUpperCase() === 'KIVO10') {
      discount = parseFloat((calculatedSubtotal * 0.1).toFixed(2)); // 10% discount
    }

    const discountedSubtotal = Math.max(0, calculatedSubtotal - discount);
    const shippingFee = discountedSubtotal >= 999 ? 0.0 : 99.0;
    const tax = parseFloat((discountedSubtotal * 0.18).toFixed(2));
    const grandTotal = parseFloat((discountedSubtotal + shippingFee + tax).toFixed(2));

    // Handle payment simulation mode
    const isPaymentFailed = paymentSimulation === 'FAILED';
    const isPaymentPending = paymentSimulation === 'PENDING';
    const paymentStatus = isPaymentFailed ? 'FAILED' : isPaymentPending ? 'PENDING' : 'COMPLETED';
    const orderStatus = isPaymentFailed ? 'CANCELLED' : 'CONFIRMED';
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderNumber = generateOrderNumber();

    // Step 2: Atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      // If payment didn't fail, decrement inventory
      if (!isPaymentFailed) {
        for (const item of itemsToOrder) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerEmail: req.user.email,
          customerName: req.user.name,
          status: orderStatus,
          subtotal: calculatedSubtotal,
          shippingFee,
          tax,
          discount,
          total: grandTotal,
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
          paymentStatus,
          items: {
            create: itemsToOrder.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku,
              productImage: item.productImage,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              total: item.total,
            })),
          },
          payments: {
            create: {
              amount: grandTotal,
              currency: 'INR',
              provider: paymentMethod,
              status: paymentStatus,
              transactionId,
              metadata: JSON.stringify({
                simulationMode: paymentSimulation,
                timestamp: new Date().toISOString(),
              }),
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // Clear the user's cart only if order was created and payment wasn't simulated as failed
      if (!isPaymentFailed) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return createdOrder;
    });

    if (isPaymentFailed) {
      return res.status(400).json({
        success: false,
        message: 'Payment simulation failed. Your order was not confirmed and inventory was not deducted.',
        data: { order: result },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for choosing Kivo.',
      data: { order: result },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          items: true,
          payments: true,
        },
      }),
    ]);

    const formatted = orders.map((ord) => ({
      ...ord,
      shippingAddress: typeof ord.shippingAddress === 'string'
        ? JSON.parse(ord.shippingAddress)
        : ord.shippingAddress,
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(isAdmin ? {} : { userId }), // non-admins can only see their own orders
      },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const formatted = {
      ...order,
      shippingAddress: typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress,
    };

    res.status(200).json({
      success: true,
      data: { order: formatted },
    });
  } catch (err) {
    next(err);
  }
};
