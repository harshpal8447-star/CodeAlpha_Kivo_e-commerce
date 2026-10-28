import prisma from '../lib/prisma.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      minutes,
      sort = 'featured',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      isActive: true,
    };

    // Category filter
    if (category && category.trim()) {
      where.category = {
        slug: category.trim().toLowerCase(),
      };
    }

    // Kivo Minutes filter (10-15 minute delivery)
    if (minutes === 'true' || minutes === true) {
      where.isMinutesEligible = true;
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // In stock filter
    if (inStock === 'true' || inStock === true) {
      where.stock = { gt: 0 };
    }

    // Sorting
    let orderBy = {};
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'featured':
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          seller: {
            select: { id: true, name: true, storeName: true, companyName: true, sellerCity: true },
          },
        },
      }),
    ]);

    const formattedProducts = products.map((prod) => ({
      ...prod,
      images: typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images,
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { rating: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const formatted = products.map((prod) => ({
      ...prod,
      images: typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images,
    }));

    res.status(200).json({
      success: true,
      data: { products: formatted },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isActive: true,
      },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, storeName: true, companyName: true, sellerCity: true, sellerBio: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Fetch up to 4 related products from the same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const formattedProduct = {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    };

    const formattedRelated = related.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    }));

    res.status(200).json({
      success: true,
      data: {
        product: formattedProduct,
        related: formattedRelated,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 5 characters.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId: id, userId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: id,
        userId,
        rating: Math.round(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
        verifiedPurchase: true,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Recalculate average rating for product
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
};
