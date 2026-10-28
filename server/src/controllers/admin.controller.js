import prisma from '../lib/prisma.js';

export const getAdminMetrics = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalUsers, completedOrders, lowStockProducts, recentOrders] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.order.findMany({
          where: { paymentStatus: 'COMPLETED' },
          select: { total: true },
        }),
        prisma.product.findMany({
          where: { stock: { lt: 10 }, isActive: true },
          select: { id: true, name: true, sku: true, stock: true, price: true },
        }),
        prisma.order.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        }),
      ]);

    const totalRevenue = completedOrders.reduce((sum, ord) => sum + ord.total, 0);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          totalProducts,
          totalCustomers: totalUsers,
        },
        lowStockAlerts: lowStockProducts,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const formatted = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    }));

    res.status(200).json({
      success: true,
      data: { products: formatted },
    });
  } catch (err) {
    next(err);
  }
};

export const createAdminProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
      stock,
      categoryId,
      images,
      isFeatured,
      isActive,
      gender,
    } = req.body;

    if (!name || !price || !sku || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, SKU, and category are required.',
      });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const imagesArray = Array.isArray(images)
      ? images
      : [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        ];

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || '',
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku: sku.trim().toUpperCase(),
        stock: parseInt(stock, 10) || 0,
        categoryId,
        images: JSON.stringify(imagesArray),
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        gender: gender ? gender.trim().toUpperCase() : 'UNISEX',
      },
      include: { category: true },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        product: {
          ...product,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
      stock,
      categoryId,
      images,
      isFeatured,
      isActive,
      gender,
    } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (slug !== undefined) dataToUpdate.slug = slug.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (compareAtPrice !== undefined) {
      dataToUpdate.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    }
    if (sku !== undefined) dataToUpdate.sku = sku.trim().toUpperCase();
    if (stock !== undefined) dataToUpdate.stock = parseInt(stock, 10);
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (images !== undefined) {
      dataToUpdate.images = JSON.stringify(Array.isArray(images) ? images : [images]);
    }
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
    if (gender !== undefined) dataToUpdate.gender = gender ? gender.trim().toUpperCase() : 'UNISEX';

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
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

export const deleteAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product is part of any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Safe archival / soft deactivate so historical orders remain valid
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return res.status(200).json({
        success: true,
        message: 'Product is referenced in existing customer orders. It has been deactivated and removed from storefront catalog.',
      });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Product deleted permanently.',
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'ALL' && status !== 'undefined') {
      where.status = status;
    }

    if (search && search.trim() && search.trim() !== 'undefined') {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          items: true,
          payments: true,
        },
      }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      shippingAddress: typeof o.shippingAddress === 'string'
        ? JSON.parse(o.shippingAddress)
        : o.shippingAddress,
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

export const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        payments: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: { order: updated },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminSellers = async (req, res, next) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true,
        name: true,
        email: true,
        storeName: true,
        companyName: true,
        sellerGstin: true,
        sellerPhone: true,
        sellerCity: true,
        sellerAddress: true,
        sellerBio: true,
        isSellerApproved: true,
        createdAt: true,
        _count: {
          select: {
            sellerProducts: true,
            sellerOrderItems: true,
          },
        },
        sellerOrderItems: {
          select: {
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSellers = sellers.map((s) => {
      const totalRevenue = s.sellerOrderItems
        .filter((it) => it.status !== 'CANCELLED')
        .reduce((sum, it) => sum + it.total, 0);

      const { sellerOrderItems, ...rest } = s;
      return {
        ...rest,
        totalProducts: s._count.sellerProducts,
        totalOrdersCount: s._count.sellerOrderItems,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      };
    });

    res.status(200).json({
      success: true,
      data: { sellers: formattedSellers },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminSellerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSellerApproved } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { isSellerApproved: Boolean(isSellerApproved) },
      select: {
        id: true,
        name: true,
        email: true,
        storeName: true,
        companyName: true,
        isSellerApproved: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Seller status updated successfully.`,
      data: { seller: updated },
    });
  } catch (err) {
    next(err);
  }
};
