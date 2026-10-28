import prisma from '../lib/prisma.js';

// Helper to generate a slug
const generateSlug = (name) => {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  );
};

// 1. Get Seller Profile & Store Info
export const getSellerProfile = async (req, res, next) => {
  try {
    const seller = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        storeName: true,
        companyName: true,
        sellerGstin: true,
        sellerPhone: true,
        sellerCity: true,
        sellerAddress: true,
        sellerBio: true,
        isSellerApproved: true,
        createdAt: true,
      },
    });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    res.status(200).json({ success: true, data: { seller } });
  } catch (err) {
    next(err);
  }
};

// 2. Update Seller Store Info
export const updateSellerProfile = async (req, res, next) => {
  try {
    const { storeName, companyName, sellerGstin, sellerPhone, sellerCity, sellerAddress, sellerBio } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(storeName !== undefined && { storeName: storeName.trim() }),
        ...(companyName !== undefined && { companyName: companyName.trim() }),
        ...(sellerGstin !== undefined && { sellerGstin: sellerGstin.trim() }),
        ...(sellerPhone !== undefined && { sellerPhone: sellerPhone.trim() }),
        ...(sellerCity !== undefined && { sellerCity: sellerCity.trim() }),
        ...(sellerAddress !== undefined && { sellerAddress: sellerAddress.trim() }),
        ...(sellerBio !== undefined && { sellerBio: sellerBio.trim() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        storeName: true,
        companyName: true,
        sellerGstin: true,
        sellerPhone: true,
        sellerCity: true,
        sellerAddress: true,
        sellerBio: true,
        isSellerApproved: true,
      },
    });

    res.status(200).json({ success: true, message: 'Seller profile updated.', data: { seller: updated } });
  } catch (err) {
    next(err);
  }
};

// 3. Get Seller Dashboard Metrics
export const getSellerMetrics = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Total products & Kivo Minutes SKUs
    const [totalProducts, minutesSkus] = await Promise.all([
      prisma.product.count({ where: { sellerId, isActive: true } }),
      prisma.product.count({ where: { sellerId, isActive: true, isMinutesEligible: true } }),
    ]);

    // Order items belonging to this seller
    const sellerItems = await prisma.orderItem.findMany({
      where: { sellerId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            status: true,
            createdAt: true,
            isMinutesDelivery: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const totalOrdersCount = new Set(sellerItems.map((item) => item.orderId)).size;
    const totalRevenue = sellerItems
      .filter((item) => item.order.status !== 'CANCELLED')
      .reduce((sum, item) => sum + item.total, 0);

    const pendingFulfillment = sellerItems.filter(
      (item) => item.status === 'CONFIRMED' || item.status === 'PACKED'
    ).length;

    const recentSales = sellerItems.slice(0, 5).map((item) => ({
      itemId: item.id,
      orderNumber: item.order.orderNumber,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      status: item.status,
      customerName: item.order.customerName,
      isMinutesDelivery: item.order.isMinutesDelivery,
      createdAt: item.order.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          minutesSkus,
          totalOrders: totalOrdersCount,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          pendingFulfillment,
        },
        recentSales,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Seller's Products
export const getSellerProducts = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 20, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { sellerId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formatted,
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

// 5. Create Product (by Seller)
export const createSellerProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const {
      name,
      description,
      price,
      compareAtPrice,
      minutesPrice,
      isMinutesEligible,
      deliveryTimeMinutes,
      minutesCategory,
      stock,
      images,
      categoryId,
      sku,
      gender,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Product name, standard price, and category are required.',
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Standard price must be a positive number.',
      });
    }

    const generatedSku =
      sku && sku.trim()
        ? sku.trim().toUpperCase()
        : `KV-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const slug = generateSlug(name);
    const parsedImages = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === 'string' && images.startsWith('[')
      ? images
      : JSON.stringify([images || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80']);

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description || name,
        price: parsedPrice,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        minutesPrice: minutesPrice ? parseFloat(minutesPrice) : null,
        isMinutesEligible: Boolean(isMinutesEligible),
        deliveryTimeMinutes: deliveryTimeMinutes ? parseInt(deliveryTimeMinutes, 10) : 12,
        minutesCategory: minutesCategory || null,
        sku: generatedSku,
        stock: stock !== undefined ? Math.max(0, parseInt(stock, 10)) : 10,
        images: parsedImages,
        categoryId,
        sellerId,
        gender: gender ? gender.trim().toUpperCase() : 'UNISEX',
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully in your store!',
      data: {
        product: {
          ...newProduct,
          images: JSON.parse(newProduct.images),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 6. Update Product (by Seller)
export const updateSellerProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (existing.sellerId !== sellerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not own this product.' });
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      minutesPrice,
      isMinutesEligible,
      deliveryTimeMinutes,
      minutesCategory,
      stock,
      images,
      categoryId,
      isActive,
      gender,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (minutesPrice !== undefined) data.minutesPrice = minutesPrice ? parseFloat(minutesPrice) : null;
    if (isMinutesEligible !== undefined) data.isMinutesEligible = Boolean(isMinutesEligible);
    if (deliveryTimeMinutes !== undefined) data.deliveryTimeMinutes = parseInt(deliveryTimeMinutes, 10);
    if (minutesCategory !== undefined) data.minutesCategory = minutesCategory;
    if (stock !== undefined) data.stock = parseInt(stock, 10);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (gender !== undefined) data.gender = gender ? gender.trim().toUpperCase() : 'UNISEX';

    if (images !== undefined) {
      data.images = Array.isArray(images)
        ? JSON.stringify(images)
        : typeof images === 'string' && images.startsWith('[')
        ? images
        : JSON.stringify([images]);
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product: {
          ...updated,
          images: typeof updated.images === 'string' ? JSON.parse(updated.images) : updated.images,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 7. Delete Product (Deactivate)
export const deleteSellerProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (existing.sellerId !== sellerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Soft delete by deactivating so historical orders remain valid
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({ success: true, message: 'Product removed from your active catalog.' });
  } catch (err) {
    next(err);
  }
};

// 8. Get Orders Received by Seller
export const getSellerOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const targetSellerId = isAdmin && req.query.sellerId ? req.query.sellerId : req.user.id;
    const { status, page = 1, limit = 100 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const cleanStatus = status && status !== 'ALL' && status !== 'undefined' ? status : null;

    const itemFilter = {};
    if (!isAdmin || req.query.sellerId) {
      itemFilter.sellerId = targetSellerId;
    }
    if (cleanStatus) {
      itemFilter.status = cleanStatus;
    }

    // Find orders where at least one item belongs to this seller (or all for admin viewing)
    const where = Object.keys(itemFilter).length > 0 ? { items: { some: itemFilter } } : {};

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          items: (!isAdmin || req.query.sellerId)
            ? { where: { sellerId: targetSellerId } }
            : true,
        },
      }),
    ]);

    const formattedOrders = orders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      customerEmail: ord.customerEmail,
      shippingAddress: typeof ord.shippingAddress === 'string' ? JSON.parse(ord.shippingAddress) : ord.shippingAddress,
      paymentMethod: ord.paymentMethod,
      paymentStatus: ord.paymentStatus,
      isMinutesDelivery: ord.isMinutesDelivery,
      deliveryEtaMinutes: ord.deliveryEtaMinutes,
      assignedRider: ord.assignedRider,
      riderPhone: ord.riderPhone,
      orderStatus: ord.status,
      createdAt: ord.createdAt,
      items: ord.items || [],
      sellerSubtotal: (ord.items || []).reduce((sum, item) => sum + (item.total || 0), 0),
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
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

// 9. Update Seller Order Item Fulfillment Status
export const updateSellerOrderItemStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body; // CONFIRMED, PACKED, DISPATCHED, DELIVERED, CANCELLED
    const sellerId = req.user.id;

    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { items: true } } },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Order item not found.' });
    }

    if (item.sellerId !== sellerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this item.' });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
    });

    // Check if all items in order are DELIVERED or DISPATCHED to synchronize parent order status
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: item.orderId },
    });

    const allDelivered = allItems.every((it) => it.status === 'DELIVERED');
    const allDispatched = allItems.every((it) => it.status === 'DISPATCHED' || it.status === 'DELIVERED');

    if (allDelivered) {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { status: 'DELIVERED' },
      });
    } else if (allDispatched) {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { status: 'SHIPPED' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}.`,
      data: { item: updatedItem },
    });
  } catch (err) {
    next(err);
  }
};
