import { PrismaClient } from '@prisma/client';
import bcrypt from '../server/node_modules/bcryptjs/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Kivo database seeding (Calibrated Affordable Pricing, Multi-Vendor Sellers, & Kivo Minutes)...');

  // Clean existing data in reverse relation order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Create Demo Accounts
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const sellerPasswordHash = await bcrypt.hash('SellerPassword123!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);

  // Admin Account
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kivo.com',
      passwordHash: adminPasswordHash,
      name: 'Kivo Administrator',
      role: 'ADMIN',
    },
  });

  // Seller 1: Apex Retail & Hyperlocal Tech Pvt Ltd
  const seller1 = await prisma.user.create({
    data: {
      email: 'seller@kivo.com',
      passwordHash: sellerPasswordHash,
      name: 'Vikramaditya Singhania',
      role: 'SELLER',
      storeName: 'Apex Studio & Fast Tech',
      companyName: 'Apex Retail & Hyperlocal Tech Pvt Ltd',
      sellerGstin: '27AABCA1234F1Z8',
      sellerPhone: '+91 98200 77889',
      sellerCity: 'Mumbai',
      sellerAddress: 'Unit 405, Marathon NextGen Innova, Lower Parel, Mumbai 400013',
      sellerBio: 'Direct distributor of certified acoustic fidelity audio, ergonomic desktop gear, and 12-minute Kivo Minutes micro-warehouse fulfillment.',
      isSellerApproved: true,
    },
  });

  // Seller 2: Aura Living & Artisanal Studio
  const seller2 = await prisma.user.create({
    data: {
      email: 'artisan@kivo.com',
      passwordHash: sellerPasswordHash,
      name: 'Aanya Sharma',
      role: 'SELLER',
      storeName: 'Aura Living & Craft',
      companyName: 'Aura Living & Artisanal Studio',
      sellerGstin: '27AAACA5678G2Z1',
      sellerPhone: '+91 98200 33445',
      sellerCity: 'Pune',
      sellerAddress: 'Studio 14, Koregaon Park Craft Enclave, Pune 411001',
      sellerBio: 'Handcrafted stoneware ceramics, botanical fragrances, organic textiles, and sustainable minimalist home accents.',
      isSellerApproved: true,
    },
  });

  // Customer: Sarah Mitchell
  const customer = await prisma.user.create({
    data: {
      email: 'sarah.mitchell@example.com',
      passwordHash: customerPasswordHash,
      name: 'Sarah Mitchell',
      role: 'CUSTOMER',
      addresses: {
        create: [
          {
            fullName: 'Sarah Mitchell',
            street: 'Flat 402, Sea View Apartments, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            phone: '+91 98200 12345',
            isDefault: true,
          },
          {
            fullName: 'Sarah Mitchell (Studio)',
            street: '12th Floor, Maker Chambers V, Nariman Point',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400021',
            country: 'India',
            phone: '+91 98200 54321',
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created Demo Accounts:');
  console.log('   👑 Admin:    admin@kivo.com / AdminPassword123!');
  console.log('   🏪 Seller 1: seller@kivo.com / SellerPassword123! (Apex Retail & Hyperlocal Tech)');
  console.log('   🎨 Seller 2: artisan@kivo.com / SellerPassword123! (Aura Living & Artisanal Studio)');
  console.log('   🛍️ Customer: sarah.mitchell@example.com / Customer123!');

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Audio & Tech',
      slug: 'audio-tech',
      description: 'Studio headphones, tactile wireless mechanical keyboards, fast charging cables, and acoustic gear.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Handcrafted stoneware ceramics, architectural lamps, and timeless objects for serene living spaces.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    },
    {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Heavyweight organic cotton staples, relaxed tailoring, and weather-resistant minimalist streetwear.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    },
    {
      name: 'Bags & Carry',
      slug: 'bags-carry',
      description: 'Weatherproof ballistic nylon packs, vegetable-tanned leather carryalls, and modular utility slings.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Low-profile sneakers, lightweight breathable mesh runners, and cushioned indoor-outdoor slides.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    },
    {
      name: 'Wellness & Scents',
      slug: 'wellness-scents',
      description: 'Cold-pressed botanical oils, hand-poured soy wax candles, and meditative ceramic diffusers.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    },
    {
      name: 'Watches & Accessories',
      slug: 'watches-accessories',
      description: 'Minimalist automatic timepieces, titanium matte bands, and aerospace-grade everyday gear.',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    },
    {
      name: 'Workspace & Desk',
      slug: 'workspace-desk',
      description: 'Natural oak monitor risers, vegan leather desk pads, cable docks, and precision milled stationery.',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Created ${categoriesData.length} product categories.`);

  // 3. Products Catalog with Realistic, Calibrated Affordable Indian Rupee Prices
  // (Standard Prices: ₹249 to ₹2,499 | Kivo Minutes Prices: ₹99 to ₹499)
  const productsList = [
    // --- Audio & Tech (Apex Retail) ---
    {
      name: 'Kivo Studio Wireless ANC Headphones & Earbuds',
      slug: 'kivo-studio-anc-headphones',
      description: 'Engineered with custom 40mm titanium dynamic drivers, hybrid active noise cancellation, and seamless Bluetooth 5.3 pairing. Over-ear studio audio headphones with 32 hours playback and quick charge.',
      price: 1499.00,
      compareAtPrice: 2499.00,
      minutesPrice: 1399.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-001',
      stock: 45,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 94,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      ]),
    },
    {
      name: '65W Braided Fast-Charging USB-C Cable (2m)',
      slug: 'braided-fast-charging-usbc-cable',
      description: 'Ultra-durable Kevlar-reinforced braided cable supporting PD 3.0 65W ultra-fast charging and 480Mbps data transfer. Tested for 25,000+ bends.',
      price: 299.00,
      compareAtPrice: 599.00,
      minutesPrice: 199.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-002',
      stock: 120,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 310,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
        'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=800&q=80',
      ]),
    },
    {
      name: 'Compact 30W GaN Dual-Port Fast Charger',
      slug: 'compact-30w-gan-charger',
      description: 'Gallium Nitride (GaN) fast wall adapter with USB-C and USB-A ports. Powers iPhones, Android devices, and iPads to 50% in under 25 minutes.',
      price: 699.00,
      compareAtPrice: 1199.00,
      minutesPrice: 549.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-003',
      stock: 80,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 142,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80',
      ]),
    },
    {
      name: 'Tactile Wireless Mechanical Keyboard',
      slug: 'tactile-wireless-mechanical-keyboard',
      description: '75% compact wireless mechanical keyboard with quiet brown tactile switches, sound dampening foam, RGB backlighting, and Bluetooth/2.4G wireless.',
      price: 2299.00,
      compareAtPrice: 3499.00,
      sku: 'KV-AUD-004',
      stock: 30,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 88,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
      ]),
    },
    {
      name: 'Silent Precision Ergonomic Wireless Mouse',
      slug: 'silent-precision-wireless-mouse',
      description: 'Whisper-quiet optical clicks with 4000 DPI sensor, contoured thumb rest, and recharge via USB-C. Works on glass and desk surfaces.',
      price: 649.00,
      compareAtPrice: 999.00,
      minutesPrice: 499.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-005',
      stock: 65,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 74,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      ]),
    },
    {
      name: 'Portable Bluetooth Waterproof Speaker',
      slug: 'portable-bluetooth-speaker',
      description: '360-degree room-filling acoustic bass, IPX7 waterproof submersible rating, and 14 hours battery. Built for showers, desks, and road trips.',
      price: 1299.00,
      compareAtPrice: 1999.00,
      sku: 'KV-AUD-006',
      stock: 40,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 65,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      ]),
    },

    // --- Home & Living (Aura Living & Craft) ---
    {
      name: 'Handcrafted Stoneware Matte Ceramic Mug (380ml)',
      slug: 'handcrafted-stoneware-ceramic-mug',
      description: 'Wheel-thrown clay mug with raw unglazed textured base and silky matte cream interior. Microwave and dishwasher safe.',
      price: 299.00,
      compareAtPrice: 499.00,
      minutesPrice: 249.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 15,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-HOM-001',
      stock: 90,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 164,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80',
      ]),
    },
    {
      name: 'Minimalist Woven Jute Coaster Set (Pack of 4)',
      slug: 'woven-jute-coaster-set',
      description: 'Natural eco-friendly hand-braided golden jute coasters. Heat-resistant table protectors for coffee mugs and cold beverage glasses.',
      price: 199.00,
      compareAtPrice: 349.00,
      minutesPrice: 149.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-HOM-002',
      stock: 110,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 52,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      ]),
    },
    {
      name: 'Modern Textured Ceramic Floral Vase',
      slug: 'textured-ceramic-vase',
      description: 'Nordic minimalist off-white sculptural vase with sand-matte glaze. Ideal for pampas grass, eucalyptus, or dry bouquets.',
      price: 649.00,
      compareAtPrice: 999.00,
      sku: 'KV-HOM-003',
      stock: 45,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 83,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80',
      ]),
    },
    {
      name: 'Pure Brass Incense Holder with Ash Catch Tray',
      slug: 'pure-brass-incense-holder',
      description: 'Solid heavy machined brass burner dish. Clean minimalist lines suitable for agarbatti incense sticks and dhoop cones.',
      price: 399.00,
      compareAtPrice: 599.00,
      minutesPrice: 299.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-HOM-004',
      stock: 60,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 41,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&q=80',
      ]),
    },

    // --- Apparel & Streetwear (Aura Living & Craft) ---
    {
      name: 'Heavyweight 240 GSM Organic Cotton Oversized Tee',
      slug: 'heavyweight-oversized-cotton-tee',
      description: 'Crafted from 100% pre-shrunk combed organic cotton. Drop-shoulder relaxed fit with reinforced ribbed crewneck collar.',
      price: 599.00,
      compareAtPrice: 999.00,
      sku: 'KV-APP-001',
      stock: 85,
      sellerId: seller2.id,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 220,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      ]),
    },
    {
      name: 'Relaxed Fit French Terry Cotton Hoodie',
      slug: 'relaxed-french-terry-hoodie',
      description: '380 GSM plush loopback cotton fleece. Double-layered crossover hood, clean hidden kangaroo pocket, and ribbed cuffs.',
      price: 1299.00,
      compareAtPrice: 1999.00,
      sku: 'KV-APP-002',
      stock: 45,
      sellerId: seller2.id,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 95,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      ]),
    },
    {
      name: 'Breathable Pure Linen Camp Collar Shirt',
      slug: 'breathable-pure-linen-shirt',
      description: 'Pre-washed 100% European flax linen. Naturally temperature regulating, airy, and textured for warm tropical weather.',
      price: 999.00,
      compareAtPrice: 1599.00,
      sku: 'KV-APP-003',
      stock: 50,
      sellerId: seller2.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 67,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      ]),
    },
    {
      name: 'Tailored Cotton Canvas Chino Trousers',
      slug: 'tailored-cotton-canvas-chinos',
      description: 'Mid-weight stretch cotton twill chinos with clean front pleats, tapered ankle cuffs, and breathable lining.',
      price: 1199.00,
      compareAtPrice: 1899.00,
      sku: 'KV-APP-004',
      stock: 40,
      sellerId: seller2.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 48,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      ]),
    },

    // --- Bags & Carry (Apex Retail) ---
    {
      name: 'Waterproof Ballistic Nylon Everyday Backpack (22L)',
      slug: 'waterproof-ballistic-nylon-backpack',
      description: '1000D Cordura nylon construction with dedicated padded 16-inch laptop compartment, YKK AquaGuard water-repellent zippers, and luggage pass-through.',
      price: 1499.00,
      compareAtPrice: 2499.00,
      sku: 'KV-BAG-001',
      stock: 55,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 130,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
      ]),
    },
    {
      name: 'Modular Minimalist Crossbody Tech Sling (3.5L)',
      slug: 'modular-crossbody-tech-sling',
      description: 'Quick-access sling with magnetic Fidlock buckle, waterproof interior dividers, and key tether. Fits phone, wallet, earbuds, and sunglasses.',
      price: 799.00,
      compareAtPrice: 1299.00,
      minutesPrice: 699.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-BAG-002',
      stock: 75,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 89,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      ]),
    },
    {
      name: 'Heavy-Duty 16oz Waxed Canvas Weekend Duffle',
      slug: 'waxed-canvas-weekend-duffle',
      description: 'Rugged weather-resistant waxed canvas with genuine leather trim, solid brass hardware, and detachable padded shoulder strap.',
      price: 1899.00,
      compareAtPrice: 2999.00,
      sku: 'KV-BAG-003',
      stock: 35,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 44,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      ]),
    },

    // --- Footwear (Apex Retail) ---
    {
      name: 'Minimalist Low-Profile Leather Sneaker',
      slug: 'minimalist-low-profile-sneaker',
      description: 'Supple vegan nappa leather upper with vulcanized stitched rubber cupsole and memory foam cushioned footbed. Clean versatile everyday trainer.',
      price: 1599.00,
      compareAtPrice: 2499.00,
      sku: 'KV-FOO-001',
      stock: 50,
      sellerId: seller1.id,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 112,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      ]),
    },
    {
      name: 'Ergonomic Cloud EVA Cushioned Slides',
      slug: 'cloud-eva-cushioned-slides',
      description: 'Thick 4cm high-density rebound EVA foam slide sandals. Anti-slip textured sole for wet bathrooms, indoor lounges, and quick grocery runs.',
      price: 499.00,
      compareAtPrice: 899.00,
      minutesPrice: 399.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-FOO-002',
      stock: 80,
      sellerId: seller1.id,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 98,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      ]),
    },

    // --- Wellness, Scents & Munchies (Aura Living & Craft) ---
    {
      name: 'Hand-Poured Soy Candle - Sandalwood & Amber (220g)',
      slug: 'hand-poured-soy-candle-sandalwood',
      description: '100% natural soy wax infused with pure Mysore sandalwood, warm golden amber, and cedarwood essential oils. 48-hour clean burn.',
      price: 349.00,
      compareAtPrice: 599.00,
      minutesPrice: 299.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-WEL-001',
      stock: 95,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 175,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&q=80',
      ]),
    },
    {
      name: 'Organic Cold Brew Nitro Coffee Can (Pack of 2, 250ml)',
      slug: 'cold-brew-nitro-coffee-pack',
      description: 'Single-origin Arabica coffee brewed cold for 18 hours with silky nitrogen micro-bubbles. Zero sugar, rich smooth caffeine kick.',
      price: 179.00,
      compareAtPrice: 250.00,
      minutesPrice: 149.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Beverages & Cold Brew',
      sku: 'KV-WEL-002',
      stock: 150,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 340,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
      ]),
    },
    {
      name: 'Artisanal Roasted Almond & Cranberry Trail Mix (150g)',
      slug: 'roasted-almond-cranberry-trail-mix',
      description: 'Slow-roasted California almonds, Himalayan pink salt cashews, organic pumpkin seeds, and tart dried cranberries. High energy quick snack.',
      price: 149.00,
      compareAtPrice: 220.00,
      minutesPrice: 119.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Instant Munchies',
      sku: 'KV-WEL-003',
      stock: 200,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 412,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      ]),
    },
    {
      name: 'Organic Eucalyptus & Mint Natural Room Mist (100ml)',
      slug: 'eucalyptus-mint-room-mist',
      description: 'Refreshing aromatherapy room and linen spray formulated with pure distilled eucalyptus globulus and cooling peppermint oils.',
      price: 249.00,
      compareAtPrice: 399.00,
      minutesPrice: 199.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-WEL-004',
      stock: 80,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 56,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },

    // --- Watches & Everyday Accessories (Apex Retail) ---
    {
      name: 'Minimalist Brushed Steel Quartz Timepiece (40mm)',
      slug: 'brushed-steel-quartz-timepiece',
      description: '316L stainless steel casing with sapphire-coated crystal glass, Japanese quartz movement, and interchangeable quick-release leather strap.',
      price: 1899.00,
      compareAtPrice: 2999.00,
      sku: 'KV-WAT-001',
      stock: 35,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 81,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      ]),
    },
    {
      name: 'Slim RFID-Blocking Matte Aluminum Cardholder Wallet',
      slug: 'rfid-blocking-aluminum-cardholder',
      description: 'Quick-eject pop-up card mechanism with elastic money clip. Blocks 13.56 MHz RFID scanner signals and holds up to 7 cards securely.',
      price: 399.00,
      compareAtPrice: 699.00,
      minutesPrice: 329.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WAT-002',
      stock: 100,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 162,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      ]),
    },

    // --- Workspace & Desk (Apex Retail) ---
    {
      name: 'Waterproof Dual-Sided Vegan Leather Desk Mat (80x40cm)',
      slug: 'vegan-leather-desk-mat',
      description: 'Generous smooth-glide surface suitable for laser/optical mice and keyboards. Waterproof, easily wiped clean with damp cloth.',
      price: 449.00,
      compareAtPrice: 799.00,
      minutesPrice: 369.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-001',
      stock: 70,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 114,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      ]),
    },
    {
      name: 'Foldable Aluminum Laptop Stand with 6 Height Levels',
      slug: 'foldable-aluminum-laptop-stand',
      description: 'Aviation-grade aluminum alloy riser supporting laptops up to 16 inches. Improves posture and heat dissipation, folds flat into carry pouch.',
      price: 599.00,
      compareAtPrice: 999.00,
      minutesPrice: 499.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-002',
      stock: 85,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 198,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      ]),
    },
    {
      name: 'Magnetic Cable Management Desktop Organizer Dock',
      slug: 'magnetic-cable-organizer-dock',
      description: 'Weighted silicone base with 3 magnetic cable clips to prevent charger cords from falling behind your workspace table.',
      price: 249.00,
      compareAtPrice: 399.00,
      minutesPrice: 199.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-003',
      stock: 120,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 83,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      ]),
    },
  ];

  const createdProducts = [];
  for (const prod of productsList) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Seeded ${createdProducts.length} calibrated products with standard and Kivo Minutes pricing.`);

  // 4. Create Sample Orders Interconnected with Sellers
  // Order 1: Placed by Sarah Mitchell containing items from Apex Retail (seller1)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'KV-2026-10882',
      userId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      status: 'PROCESSING',
      subtotal: 2098.00,
      shippingFee: 0.00,
      tax: 377.64,
      discount: 0.00,
      total: 2475.64,
      shippingAddress: JSON.stringify({
        fullName: 'Sarah Mitchell',
        street: 'Flat 402, Sea View Apartments, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
        phone: '+91 98200 12345',
      }),
      paymentMethod: 'UPI_ONLINE',
      paymentStatus: 'COMPLETED',
      isMinutesDelivery: false,
      items: {
        create: [
          {
            productId: createdProducts[0].id, // ANC Earbuds
            sellerId: seller1.id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
            unitPrice: 1499.00,
            quantity: 1,
            total: 1499.00,
            status: 'PACKED', // Seller can see this in their order portal!
            isMinutesItem: false,
          },
          {
            productId: createdProducts[10].id, // Oversized Tee
            sellerId: seller2.id,
            productName: createdProducts[10].name,
            productSku: createdProducts[10].sku,
            productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
            unitPrice: 599.00,
            quantity: 1,
            total: 599.00,
            status: 'CONFIRMED', // Waiting for seller2 to pack
            isMinutesItem: false,
          },
        ],
      },
      payments: {
        create: {
          amount: 2475.64,
          currency: 'INR',
          provider: 'UPI_RAZORPAY',
          status: 'COMPLETED',
          transactionId: 'TXN-UPI-98421001-IN',
          metadata: JSON.stringify({ note: 'Simulated UPI payment via HDFC Bank netbanking' }),
        },
      },
    },
  });

  // Order 2: ⚡ Kivo Minutes Hyperlocal Order delivered in 11 minutes
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'KV-MIN-2026-90412',
      userId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      status: 'DELIVERED',
      subtotal: 517.00,
      shippingFee: 29.00,
      tax: 98.28,
      discount: 0.00,
      total: 644.28,
      shippingAddress: JSON.stringify({
        fullName: 'Sarah Mitchell',
        street: 'Flat 402, Sea View Apartments, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
        phone: '+91 98200 12345',
      }),
      paymentMethod: 'UPI_ONLINE',
      paymentStatus: 'COMPLETED',
      isMinutesDelivery: true,
      deliveryEtaMinutes: 12,
      assignedRider: 'Vikram Sen (Hero Electric Nyx #412)',
      riderPhone: '+91 98201 88990',
      items: {
        create: [
          {
            productId: createdProducts[1].id, // USB-C Cable (Minutes price ₹199)
            sellerId: seller1.id,
            productName: createdProducts[1].name,
            productSku: createdProducts[1].sku,
            productImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
            unitPrice: 199.00,
            quantity: 1,
            total: 199.00,
            status: 'DELIVERED',
            isMinutesItem: true,
          },
          {
            productId: createdProducts[20].id, // Nitro Cold Brew Coffee (Minutes price ₹149)
            sellerId: seller2.id,
            productName: createdProducts[20].name,
            productSku: createdProducts[20].sku,
            productImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
            unitPrice: 149.00,
            quantity: 1,
            total: 149.00,
            status: 'DELIVERED',
            isMinutesItem: true,
          },
          {
            productId: createdProducts[21].id, // Trail mix (Minutes price ₹119)
            sellerId: seller2.id,
            productName: createdProducts[21].name,
            productSku: createdProducts[21].sku,
            productImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
            unitPrice: 119.00,
            quantity: 1,
            total: 119.00,
            status: 'DELIVERED',
            isMinutesItem: true,
          },
        ],
      },
      payments: {
        create: {
          amount: 644.28,
          currency: 'INR',
          provider: 'UPI_RAZORPAY',
          status: 'COMPLETED',
          transactionId: 'TXN-UPI-MIN-90412001',
          metadata: JSON.stringify({ note: 'Delivered in 11 minutes via Bandra Micro-Dark Store Hub' }),
        },
      },
    },
  });

  console.log(`✅ Created interconnected sample orders:`);
  console.log(`   📦 Order ${order1.orderNumber} (Standard fulfillment: ₹2,475.64)`);
  console.log(`   ⚡ Kivo Minutes Order ${order2.orderNumber} (Delivered in 11 mins by Vikram Sen: ₹644.28)`);
  console.log('✨ Kivo database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
