import { PrismaClient } from '@prisma/client';
import bcrypt from '../server/node_modules/bcryptjs/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Kivo database seeding (64 Products across 8 Categories + Reviews + Multi-Vendor)...');

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

  // 1. Create Demo Accounts & Verified Reviewers
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
      sellerBio: 'Direct distributor of certified acoustic fidelity audio, ergonomic desktop gear, and 10-15 minute Kivo Minutes micro-warehouse fulfillment.',
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

  // Seller 3: Zenith Streetwear & Performance Gear
  const seller3 = await prisma.user.create({
    data: {
      email: 'zenith@kivo.com',
      passwordHash: sellerPasswordHash,
      name: 'Kabir Oberoi',
      role: 'SELLER',
      storeName: 'Zenith Gear & Apparel',
      companyName: 'Zenith Lifestyle & Performance Pvt Ltd',
      sellerGstin: '27AAACZ9812M1Z4',
      sellerPhone: '+91 98200 99112',
      sellerCity: 'Bengaluru',
      sellerAddress: '88 Indiranagar 100ft Road, Bengaluru 560038',
      sellerBio: 'Premium minimalist apparel, technical weatherproof bags, urban commute essentials, and ergonomic footwear.',
      isSellerApproved: true,
    },
  });

  // Customers / Verified Reviewers
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
        ],
      },
    },
  });

  // Secondary customer account for demo convenience
  await prisma.user.create({
    data: {
      email: 'customer@kivo.com',
      passwordHash: customerPasswordHash,
      name: 'Demo Customer',
      role: 'CUSTOMER',
    },
  });

  const reviewerNames = [
    { name: 'Rohan Verma', email: 'rohan.verma@example.com', city: 'Delhi' },
    { name: 'Priya Nair', email: 'priya.nair@example.com', city: 'Bengaluru' },
    { name: 'Aditya Sharma', email: 'aditya.sharma@example.com', city: 'Mumbai' },
    { name: 'Ananya Deshmukh', email: 'ananya.deshmukh@example.com', city: 'Pune' },
    { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', city: 'Chennai' },
    { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', city: 'Ahmedabad' },
  ];

  const reviewers = [];
  for (const r of reviewerNames) {
    const user = await prisma.user.create({
      data: {
        email: r.email,
        passwordHash: customerPasswordHash,
        name: r.name,
        role: 'CUSTOMER',
      },
    });
    reviewers.push(user);
  }

  console.log('✅ Created Demo Accounts & 7 Reviewer profiles.');

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Audio & Tech',
      slug: 'audio-tech',
      description: 'Studio headphones, tactile wireless mechanical keyboards, fast charging cables, USB hubs, and acoustic gear.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Handcrafted stoneware ceramics, architectural lamps, French presses, and timeless objects for serene living spaces.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    },
    {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Heavyweight organic cotton staples, relaxed tailoring, linen shirts, chinos, and weather-resistant minimalist streetwear.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    },
    {
      name: 'Bags & Carry',
      slug: 'bags-carry',
      description: 'Weatherproof ballistic nylon packs, vegetable-tanned leather carryalls, laptop sleeves, and modular utility slings.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Low-profile sneakers, lightweight breathable mesh runners, recovery slides, and cushioned indoor-outdoor slides.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    },
    {
      name: 'Wellness & Scents',
      slug: 'wellness-scents',
      description: 'Cold-pressed botanical oils, hand-poured soy wax candles, cold brew coffee, matcha, and meditative diffusers.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    },
    {
      name: 'Watches & Accessories',
      slug: 'watches-accessories',
      description: 'Minimalist automatic timepieces, RFID blocking wallets, titanium bands, sunglasses, and EDC everyday gear.',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    },
    {
      name: 'Workspace & Desk',
      slug: 'workspace-desk',
      description: 'Natural oak monitor risers, vegan leather desk pads, cable docks, laptop stands, and precision milled stationery.',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Created ${categoriesData.length} product categories.`);

  // 3. Products Catalog (64 Products: 8 per Category)
  const productsList = [
    // ==========================================
    // 1. Audio & Tech (8 Products)
    // ==========================================
    {
      name: 'Kivo Studio Wireless ANC Headphones & Earbuds',
      slug: 'kivo-studio-anc-headphones',
      description: 'Engineered with custom 40mm titanium dynamic drivers, hybrid active noise cancellation, and seamless Bluetooth 5.3 pairing. Over-ear studio audio headphones with 32 hours playback, memory foam ear cups, and 10-minute quick charge.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      ]),
    },
    {
      name: '65W Braided Fast-Charging USB-C Cable (2m)',
      slug: 'braided-fast-charging-usbc-cable',
      description: 'Ultra-durable Kevlar-reinforced braided cable supporting PD 3.0 65W ultra-fast charging and 480Mbps data transfer. Tested for 25,000+ bends with aluminum alloy connectors. Compatible with MacBooks, iPhones, Samsung Galaxy, and iPads.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
        'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=800&q=80',
      ]),
    },
    {
      name: 'Compact 30W GaN Dual-Port Fast Charger Adapter',
      slug: 'compact-30w-gan-charger',
      description: 'Gallium Nitride (GaN) fast wall adapter with USB-C and USB-A ports. Powers iPhones, Android devices, and iPads to 50% in under 25 minutes. Features intelligent over-voltage, temperature regulation, and foldable travel prongs.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80',
      ]),
    },
    {
      name: 'Tactile Wireless Mechanical Keyboard (75% Compact)',
      slug: 'tactile-wireless-mechanical-keyboard',
      description: '75% compact wireless mechanical keyboard with quiet brown tactile switches, sound dampening silicone foam, south-facing RGB backlighting, and Bluetooth 5.1/2.4GHz wireless connectivity. Hot-swappable switches and 4000mAh battery.',
      price: 2299.00,
      compareAtPrice: 3499.00,
      sku: 'KV-AUD-004',
      stock: 30,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
      ]),
    },
    {
      name: 'Silent Precision Ergonomic Wireless Optical Mouse',
      slug: 'silent-precision-wireless-mouse',
      description: 'Whisper-quiet optical clicks with 4000 DPI multi-surface sensor, sculpted thumb rest, and rechargeable USB-C battery. Features dual Bluetooth + 2.4GHz wireless modes and works smoothly on glass, wood, and desk pads.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      ]),
    },
    {
      name: 'Portable Bluetooth Waterproof Outdoor Speaker',
      slug: 'portable-bluetooth-speaker',
      description: '360-degree room-filling acoustic bass, IPX7 waterproof submersible rating, and 14 hours battery. Rugged tear-resistant fabric mesh and integrated carabiner strap. Built for showers, desks, and road trips.',
      price: 1299.00,
      compareAtPrice: 1999.00,
      sku: 'KV-AUD-006',
      stock: 40,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      ]),
    },
    {
      name: 'Magnetic Qi2 15W Fast Wireless Charging Pad',
      slug: 'magnetic-qi2-wireless-charging-pad',
      description: 'Aluminum alloy base with soft-touch silicone surface. Delivers certified 15W Qi2 fast magnetic charging for iPhone 12/13/14/15/16 and Qi-compatible Android phones and wireless earbuds cases.',
      price: 899.00,
      compareAtPrice: 1499.00,
      minutesPrice: 749.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-007',
      stock: 50,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&q=80',
      ]),
    },
    {
      name: 'Multi-Device 7-in-1 USB-C Hub & HDMI Adapter',
      slug: 'multidevice-usbc-hdmi-hub',
      description: 'Precision milled aluminum chassis featuring 4K@60Hz HDMI video out, 100W Power Delivery pass-through, 3x USB 3.0 ports (5Gbps), and SD/TF micro card reader slots for laptops, tablets, and phones.',
      price: 1199.00,
      compareAtPrice: 1899.00,
      minutesPrice: 999.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-AUD-008',
      stock: 55,
      sellerId: seller1.id,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      ]),
    },

    // ==========================================
    // 2. Home & Living (8 Products)
    // ==========================================
    {
      name: 'Handcrafted Stoneware Matte Ceramic Mug (380ml)',
      slug: 'handcrafted-stoneware-ceramic-mug',
      description: 'Wheel-thrown artisanal clay mug with raw unglazed textured base and silky matte cream interior. Ergonomic thumb-rest handle. Microwave, oven, and dishwasher safe. Ideal for coffee, tea, and warm soups.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80',
      ]),
    },
    {
      name: 'Minimalist Woven Jute Coaster Set (Pack of 4)',
      slug: 'woven-jute-coaster-set',
      description: 'Natural eco-friendly hand-braided golden jute coasters. Heat-resistant table protectors for hot ceramic coffee mugs, cold beverage glasses, and cocktail tumblers. Clean rustic bohemian appeal.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      ]),
    },
    {
      name: 'Modern Textured Ceramic Off-White Floral Vase',
      slug: 'textured-ceramic-vase',
      description: 'Nordic minimalist off-white sculptural vase with sand-matte textured glaze. Ideal for pampas grass, dried eucalyptus, or fresh floral bouquets on dining tables, credenzas, and consoles.',
      price: 649.00,
      compareAtPrice: 999.00,
      sku: 'KV-HOM-003',
      stock: 45,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=80',
      ]),
    },
    {
      name: 'Pure Brass Incense Holder with Ash Catch Tray',
      slug: 'pure-brass-incense-holder',
      description: 'Solid heavy machined brass burner dish with dual-hole design for agarbatti incense sticks and flat base for dhoop cones. Elegant brass patina that deepens gracefully with time.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&q=80',
      ]),
    },
    {
      name: 'Double-Wall Stainless Steel French Press (800ml)',
      slug: 'insulated-stainless-french-press',
      description: 'Vacuum insulated 304 food-grade stainless steel coffee & tea maker. Keeps brew piping hot for 2 hours with cool-touch handle and 4-level micro-mesh filtration system that eliminates grounds.',
      price: 999.00,
      compareAtPrice: 1599.00,
      minutesPrice: 849.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 15,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-HOM-005',
      stock: 50,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
      ]),
    },
    {
      name: 'Organic Waffle Weave 100% Cotton Throw Blanket',
      slug: 'waffle-weave-cotton-blanket',
      description: 'Generous 50x70 inch breathable 4-season throw blanket crafted from pre-washed organic cotton. Textured honeycomb weave that provides lightweight cozy warmth on sofas and beds.',
      price: 1199.00,
      compareAtPrice: 1899.00,
      sku: 'KV-HOM-006',
      stock: 35,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
      ]),
    },
    {
      name: 'Magnetic Bamboo Wall-Mount Knife Holder Bar (40cm)',
      slug: 'magnetic-bamboo-knife-bar',
      description: 'Heavy-duty neodymium magnetic strip encased in natural sustainably harvested bamboo. Safely holds chef knives, kitchen scissors, and metal culinary utensils with no-drill adhesive option.',
      price: 749.00,
      compareAtPrice: 1199.00,
      sku: 'KV-HOM-007',
      stock: 40,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
      ]),
    },
    {
      name: 'Warm Dimmable LED Bedside & Desk Ambient Lamp',
      slug: 'acoustic-warm-ambient-lamp',
      description: 'Touch-sensitive 3-stage dimming ambient desk lamp with frosted polycarbonate diffuser and warm 2700K eye-comfort glow. Built-in USB charging port at base.',
      price: 1399.00,
      compareAtPrice: 2199.00,
      sku: 'KV-HOM-008',
      stock: 30,
      sellerId: seller2.id,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      ]),
    },

    // ==========================================
    // 3. Apparel (8 Products)
    // ==========================================
    {
      name: 'Heavyweight 240 GSM Organic Cotton Oversized Tee',
      slug: 'heavyweight-oversized-cotton-tee',
      description: 'Crafted from 100% pre-shrunk combed organic cotton. Drop-shoulder relaxed fit with reinforced 1.2-inch ribbed crewneck collar. Clean minimalist everyday streetwear t-shirt.',
      price: 599.00,
      compareAtPrice: 999.00,
      sku: 'KV-APP-001',
      stock: 85,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      ]),
    },
    {
      name: 'Relaxed Fit French Terry 380 GSM Cotton Hoodie',
      slug: 'relaxed-french-terry-hoodie',
      description: '380 GSM plush loopback cotton fleece. Double-layered crossover hood without drawstring clutter, clean hidden side-seam kangaroo pockets, and snug elastane ribbed cuffs.',
      price: 1299.00,
      compareAtPrice: 1999.00,
      sku: 'KV-APP-002',
      stock: 45,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      ]),
    },
    {
      name: 'Breathable Pure European Linen Camp Collar Shirt',
      slug: 'breathable-pure-linen-shirt',
      description: 'Pre-washed 100% European flax linen. Naturally temperature regulating, airy, and textured for warm tropical weather. Features clean mother-of-pearl buttons and relaxed boxy cut.',
      price: 999.00,
      compareAtPrice: 1599.00,
      sku: 'KV-APP-003',
      stock: 50,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      ]),
    },
    {
      name: 'Tailored Stretch Cotton Canvas Chino Trousers',
      slug: 'tailored-cotton-canvas-chinos',
      description: 'Mid-weight 98% cotton 2% elastane twill chinos with clean front pleats, tailored tapered ankle cuffs, YKK brass zip fly, and breathable pocket lining. Transitions from office to weekend.',
      price: 1199.00,
      compareAtPrice: 1899.00,
      sku: 'KV-APP-004',
      stock: 40,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      ]),
    },
    {
      name: 'Seamless Combed Cotton Everyday Crew Socks (Pack of 3)',
      slug: 'seamless-combed-cotton-socks',
      description: 'Breathable combed cotton socks with arch support compression band, reinforced seamless toe box, and cushioned terry sole. Non-slip stay-up elastic cuff.',
      price: 299.00,
      compareAtPrice: 499.00,
      minutesPrice: 249.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-APP-005',
      stock: 130,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80',
      ]),
    },
    {
      name: 'Water-Repellent Commuter Windbreaker Jacket',
      slug: 'lightweight-commuter-windbreaker',
      description: 'Featherlight ripstop nylon outer with DWR water-resistant coating. Packable into its own chest pocket, adjustable bungee hem, and vented back yoke for daily bike commuting and running.',
      price: 1699.00,
      compareAtPrice: 2499.00,
      sku: 'KV-APP-006',
      stock: 35,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80',
      ]),
    },
    {
      name: 'Classic Supima Cotton Ribbed Henley Long Sleeve',
      slug: 'classic-supima-cotton-henley',
      description: 'Long-staple Supima cotton with subtle micro-rib texture. Three-button placket, tailored arm cuffs, and curved hem that looks great tucked or untucked.',
      price: 849.00,
      compareAtPrice: 1399.00,
      sku: 'KV-APP-007',
      stock: 45,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
      ]),
    },
    {
      name: 'Minimalist Structured Washed Cotton Baseball Cap',
      slug: 'minimalist-washed-cotton-cap',
      description: 'Unbranded 6-panel unstructured dad cap made from garment-washed 100% cotton twill. Antique brass buckle strap adjuster and sweatband interior lining.',
      price: 399.00,
      compareAtPrice: 699.00,
      minutesPrice: 349.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-APP-008',
      stock: 75,
      sellerId: seller3.id,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      ]),
    },

    // ==========================================
    // 4. Bags & Carry (8 Products)
    // ==========================================
    {
      name: 'Waterproof Ballistic Nylon Everyday Backpack (22L)',
      slug: 'waterproof-ballistic-nylon-backpack',
      description: '1000D Cordura nylon construction with dedicated padded 16-inch laptop compartment, YKK AquaGuard water-repellent zippers, and luggage pass-through trolley sleeve.',
      price: 1499.00,
      compareAtPrice: 2499.00,
      sku: 'KV-BAG-001',
      stock: 55,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
      ]),
    },
    {
      name: 'Modular Minimalist Crossbody Tech Sling (3.5L)',
      slug: 'modular-crossbody-tech-sling',
      description: 'Quick-access sling with magnetic Fidlock buckle, waterproof interior dividers, and key tether. Fits phone, wallet, passport, power bank, earbuds, and sunglasses.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      ]),
    },
    {
      name: 'Heavy-Duty 16oz Waxed Canvas Weekend Duffle',
      slug: 'waxed-canvas-weekend-duffle',
      description: 'Rugged weather-resistant waxed canvas with genuine full-grain leather trim, solid brass hardware, shoe compartment, and detachable padded shoulder strap.',
      price: 1899.00,
      compareAtPrice: 2999.00,
      sku: 'KV-BAG-003',
      stock: 35,
      sellerId: seller3.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      ]),
    },
    {
      name: 'Weatherproof Padded 14-16" Laptop Sleeve Case',
      slug: 'padded-laptop-sleeve-case',
      description: 'Ultra-slim shock-absorbing neoprene sleeve with soft microfleece interior and external zip accessory pocket for charger cords, mouse, and dongles.',
      price: 599.00,
      compareAtPrice: 999.00,
      minutesPrice: 499.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-BAG-004',
      stock: 65,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
      ]),
    },
    {
      name: 'Foldable Ripstop Nylon Packable Grocery Tote',
      slug: 'foldable-ripstop-nylon-tote',
      description: 'Ultra-strong 20kg weight capacity reusable shopping bag that packs into an internal pocket the size of an apple. Water-resistant and machine washable.',
      price: 249.00,
      compareAtPrice: 399.00,
      minutesPrice: 199.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-BAG-005',
      stock: 140,
      sellerId: seller2.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&q=80',
      ]),
    },
    {
      name: 'Compact Hard-Shell Electronics Cable Travel Pouch',
      slug: 'compact-hardshell-cable-pouch',
      description: 'EVA hard shell organizer case with elastic loops and mesh zippered slots for charging bricks, USB cables, memory cards, and power banks.',
      price: 499.00,
      compareAtPrice: 799.00,
      minutesPrice: 399.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-BAG-006',
      stock: 90,
      sellerId: seller1.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      ]),
    },
    {
      name: 'Genuine Vegetable-Tanned Leather Zip Card Pouch',
      slug: 'genuine-leather-card-pouch',
      description: 'Handcrafted genuine leather pouch with solid brass Japanese YKK zipper. Holds folded cash notes, coins, car keys, and up to 10 credit cards.',
      price: 649.00,
      compareAtPrice: 999.00,
      sku: 'KV-BAG-007',
      stock: 45,
      sellerId: seller2.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      ]),
    },
    {
      name: 'Expandable Rolltop Commuter Travel Backpack (28L)',
      slug: 'rolltop-waterproof-travel-backpack',
      description: 'Waterproof tarpaulin roll-top pack with magnetic closure, side quick-access zipper, sternum stabilizer strap, and modular external gear loops.',
      price: 2199.00,
      compareAtPrice: 3499.00,
      sku: 'KV-BAG-008',
      stock: 25,
      sellerId: seller3.id,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&q=80',
      ]),
    },

    // ==========================================
    // 5. Footwear (8 Products)
    // ==========================================
    {
      name: 'Minimalist Low-Profile Vegan Leather Sneaker',
      slug: 'minimalist-low-profile-sneaker',
      description: 'Supple vegan nappa leather upper with vulcanized stitched rubber cupsole and memory foam cushioned footbed. Clean versatile everyday trainer.',
      price: 1599.00,
      compareAtPrice: 2499.00,
      sku: 'KV-FOO-001',
      stock: 50,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      ]),
    },
    {
      name: 'Ergonomic Cloud EVA Cushioned Recovery Slides',
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
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      ]),
    },
    {
      name: 'Lightweight Breathable Knit Everyday Walking Sneakers',
      slug: 'breathable-knit-walking-sneakers',
      description: 'One-piece seamless engineered knit upper that hugs your foot like a sock. Ultra-lightweight shock-absorbing phylon midsole and rubber traction pods.',
      price: 1399.00,
      compareAtPrice: 2199.00,
      sku: 'KV-FOO-003',
      stock: 45,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
      ]),
    },
    {
      name: 'Handcrafted Suede Leather Penny Loafers',
      slug: 'handcrafted-suede-leather-loafers',
      description: 'Velvety genuine suede leather with classic moc-toe stitching, flexible Goodyear-welted rubber sole, and padded calfskin leather arch lining.',
      price: 2199.00,
      compareAtPrice: 3299.00,
      sku: 'KV-FOO-004',
      stock: 30,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
      ]),
    },
    {
      name: 'Anti-Fatigue Memory Cushion Orthotic Shoe Insoles',
      slug: 'antifatigue-orthotic-insoles',
      description: 'Medical-grade high-rebound PU foam insoles with deep heel cup and anatomical arch support. Relieves plantar fasciitis, heel spurs, and foot fatigue.',
      price: 349.00,
      compareAtPrice: 599.00,
      minutesPrice: 279.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-FOO-005',
      stock: 120,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      ]),
    },
    {
      name: 'All-Weather Slip-On Canvas Boat Deck Shoes',
      slug: 'allweather-slipon-deck-shoes',
      description: 'Sturdy 12oz breathable cotton canvas slip-ons with dual elastic side goring, vulcanized rubber perimeter bumper, and razor-siped wet grip outsole.',
      price: 999.00,
      compareAtPrice: 1499.00,
      sku: 'KV-FOO-006',
      stock: 40,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      ]),
    },
    {
      name: 'All-Terrain Lightweight Trail Running Shoes',
      slug: 'trail-grip-lightweight-running-shoes',
      description: 'Aggressive 5mm multi-directional rubber lugs, reinforced rock plate toe shield, and quick-lace cinch toggle system for hiking and trail running.',
      price: 1899.00,
      compareAtPrice: 2899.00,
      sku: 'KV-FOO-007',
      stock: 35,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
      ]),
    },
    {
      name: 'Breathable Cushioned Gym & Cross-Training Shoes',
      slug: 'cushioned-mesh-cross-trainers',
      description: 'Flat wide stable base with lateral TPU support cage for deadlifts, squats, HIIT interval training, and gym cardio workouts.',
      price: 1499.00,
      compareAtPrice: 2299.00,
      sku: 'KV-FOO-008',
      stock: 45,
      sellerId: seller3.id,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      ]),
    },

    // ==========================================
    // 6. Wellness & Scents (8 Products)
    // ==========================================
    {
      name: 'Hand-Poured Soy Candle - Sandalwood & Amber (220g)',
      slug: 'hand-poured-soy-candle-sandalwood',
      description: '100% natural soy wax infused with pure Mysore sandalwood, warm golden amber, and cedarwood essential oils. 48-hour clean soot-free burn with lead-free cotton wick.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&q=80',
      ]),
    },
    {
      name: 'Organic Cold Brew Nitro Coffee Can (Pack of 2, 250ml)',
      slug: 'cold-brew-nitro-coffee-pack',
      description: 'Single-origin Arabica coffee brewed cold for 18 hours with silky nitrogen micro-bubbles. Zero sugar, zero dairy, rich smooth chocolate undertones.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
      ]),
    },
    {
      name: 'Artisanal Roasted Almond & Cranberry Trail Mix (150g)',
      slug: 'roasted-almond-cranberry-trail-mix',
      description: 'Slow-roasted California almonds, Himalayan pink salt cashews, organic pumpkin seeds, and tart dried cranberries. High energy healthy snack.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      ]),
    },
    {
      name: 'Organic Eucalyptus & Mint Natural Room Mist (100ml)',
      slug: 'eucalyptus-mint-room-mist',
      description: 'Refreshing aromatherapy room and linen spray formulated with pure distilled eucalyptus globulus and cooling peppermint oils. Eliminates odors instantly.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
    {
      name: 'Ceramic Ultrasonic Essential Oil Aroma Diffuser',
      slug: 'ultrasonic-essential-oil-diffuser',
      description: 'Handcrafted ceramic stone cover with whisper-quiet ultrasonic atomization. Features warm ambient glow nightlight and auto-shutoff when water level is low.',
      price: 1199.00,
      compareAtPrice: 1899.00,
      sku: 'KV-WEL-005',
      stock: 40,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      ]),
    },
    {
      name: 'Hand-Carved Himalayan Pink Rock Salt Night Lamp',
      slug: 'himalayan-rock-salt-lamp',
      description: 'Authentic 100% pure Himalayan crystal salt mined from the Punjab foothills. Mounted on solid neem wood base with rotary dimmer switch cord.',
      price: 599.00,
      compareAtPrice: 999.00,
      sku: 'KV-WEL-006',
      stock: 55,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
      ]),
    },
    {
      name: 'Cold-Pressed Virgin Jojoba & Rosemary Hair Oil (100ml)',
      slug: 'cold-pressed-jojoba-rosemary-oil',
      description: 'Unrefined nutrient-dense botanical oil blend of Golden Jojoba and Spanish Rosemary cineole. Stimulates scalp circulation and tames dry flyaway frizz.',
      price: 329.00,
      compareAtPrice: 550.00,
      minutesPrice: 269.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-WEL-007',
      stock: 110,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
    {
      name: 'Premium Ceremonial Grade Japanese Matcha Powder (50g)',
      slug: 'ceremonial-grade-matcha-tea',
      description: 'Stone-ground first harvest shade-grown green tea leaves from Uji, Kyoto. Vibrant emerald green color, velvety umami finish, and calm sustained alertness.',
      price: 499.00,
      compareAtPrice: 799.00,
      minutesPrice: 399.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Beverages & Cold Brew',
      sku: 'KV-WEL-008',
      stock: 75,
      sellerId: seller2.id,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
      ]),
    },

    // ==========================================
    // 7. Watches & Accessories (8 Products)
    // ==========================================
    {
      name: 'Minimalist Brushed Steel Quartz Timepiece (40mm)',
      slug: 'brushed-steel-quartz-timepiece',
      description: '316L stainless steel casing with sapphire-coated crystal glass, Japanese Citizen Miyota quartz movement, and interchangeable quick-release leather strap. 5 ATM water resistant.',
      price: 1899.00,
      compareAtPrice: 2999.00,
      sku: 'KV-WAT-001',
      stock: 35,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      ]),
    },
    {
      name: 'Slim RFID-Blocking Matte Aluminum Cardholder Wallet',
      slug: 'rfid-blocking-aluminum-cardholder',
      description: 'Quick-eject pop-up card mechanism with elastic cash money clip. Blocks 13.56 MHz RFID/NFC skimming scanner signals and holds up to 7 cards securely.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      ]),
    },
    {
      name: 'Classic Chronograph Watch with Italian Leather Strap',
      slug: 'classic-leather-chronograph-watch',
      description: 'Sunburst dial with triple sub-dials (60-minute stopwatch, 24-hour clock, running seconds). Hand-stitched full-grain Italian calfskin strap and luminescent hands.',
      price: 2499.00,
      compareAtPrice: 3899.00,
      sku: 'KV-WAT-003',
      stock: 25,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      ]),
    },
    {
      name: 'Titanium Magnetic Apple Watch Band (44/45/49mm)',
      slug: 'titanium-magnetic-watch-band',
      description: 'Ultra-lightweight titanium link strap with strong neodymium magnetic clasp closure. Sweat-proof, hypoallergenic, and compatible with Apple Watch Ultra and Series 4–10.',
      price: 799.00,
      compareAtPrice: 1299.00,
      minutesPrice: 699.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-WAT-004',
      stock: 60,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80',
      ]),
    },
    {
      name: 'Polarized UV400 Matte Black Wayfarer Sunglasses',
      slug: 'polarized-matte-wayfarer-sunglasses',
      description: 'Handcrafted acetate frame with TAC 9-layer polarized lenses. 100% protection against UVA/UVB rays and reduces harsh driving and water glares.',
      price: 899.00,
      compareAtPrice: 1499.00,
      minutesPrice: 749.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Daily Care & Grooming',
      sku: 'KV-WAT-005',
      stock: 70,
      sellerId: seller3.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      ]),
    },
    {
      name: 'Solid Heavy Machined Brass EDC Carabiner Clip',
      slug: 'solid-brass-keychain-carabiner',
      description: 'Precision wire-cut solid brass keychain with stainless steel spring wire gate and integrated bottle opener. Keeps everyday keys securely clipped to belt loops.',
      price: 249.00,
      compareAtPrice: 399.00,
      minutesPrice: 199.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WAT-006',
      stock: 130,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
      ]),
    },
    {
      name: 'Automatic Self-Winding Open-Heart Exhibition Watch',
      slug: 'automatic-mechanical-openheart-watch',
      description: 'Exhibition dial showcasing beating balance wheel. Powered by the motion of your wrist with 41-hour power reserve, sapphire crystal, and transparent case-back.',
      price: 2899.00,
      compareAtPrice: 4499.00,
      sku: 'KV-WAT-007',
      stock: 20,
      sellerId: seller1.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      ]),
    },
    {
      name: 'Genuine Leather 3-Slot Watch Travel Storage Roll',
      slug: 'leather-travel-watch-roll-case',
      description: 'Rigid protective travel case with soft suede cushion pillows and brass snap button fasteners. Protects your timepieces from scratches during transit.',
      price: 1099.00,
      compareAtPrice: 1799.00,
      sku: 'KV-WAT-008',
      stock: 40,
      sellerId: seller2.id,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      ]),
    },

    // ==========================================
    // 8. Workspace & Desk (8 Products)
    // ==========================================
    {
      name: 'Waterproof Dual-Sided Vegan Leather Desk Mat (80x40cm)',
      slug: 'vegan-leather-desk-mat',
      description: 'Generous smooth-glide surface suitable for laser/optical mice and keyboards. Dual-color reversible design, waterproof, easily wiped clean with damp cloth.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      ]),
    },
    {
      name: 'Foldable Aluminum Laptop Stand with 6 Height Levels',
      slug: 'foldable-aluminum-laptop-stand',
      description: 'Aviation-grade aluminum alloy riser supporting laptops up to 16 inches. Improves posture and heat dissipation, folds flat into flannel carry pouch for travel.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      ]),
    },
    {
      name: 'Magnetic Cable Management Desktop Organizer Dock',
      slug: 'magnetic-cable-organizer-dock',
      description: 'Weighted silicone base with 3 magnetic cable clips to prevent charger cords from falling behind your workspace table. Reusable non-marking micro-suction tape.',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      ]),
    },
    {
      name: 'Solid Natural Walnut Wood Monitor Stand Riser with Shelf',
      slug: 'solid-walnut-monitor-riser',
      description: 'Handcrafted solid North American walnut wood riser with cork padding legs and underneath keyboard storage cavity. Supports up to 35kg monitors and iMacs.',
      price: 1499.00,
      compareAtPrice: 2299.00,
      sku: 'KV-WRK-004',
      stock: 35,
      sellerId: seller2.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      ]),
    },
    {
      name: 'Hardcover 120 GSM Dotted Grid Journal Notebook',
      slug: 'hardcover-dotted-grid-bullet-journal',
      description: 'Lay-flat stitch-bound A5 bullet journal with thick fountain-pen friendly bleed-proof 120 GSM paper, dual ribbon markers, pen loop, and expandable back pocket.',
      price: 299.00,
      compareAtPrice: 499.00,
      minutesPrice: 229.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-005',
      stock: 110,
      sellerId: seller2.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      ]),
    },
    {
      name: 'Matte Black Metal Under-Desk Headphone Hanger Mount',
      slug: 'underdesk-metal-headphone-hanger',
      description: 'Heavy gauge steel hanger with silicone protective padding. Mounts under desktop via industrial 3M VHB tape or screws to declutter gaming and studio headphones.',
      price: 279.00,
      compareAtPrice: 449.00,
      minutesPrice: 219.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Fast Tech & Cables',
      sku: 'KV-WRK-006',
      stock: 90,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      ]),
    },
    {
      name: 'Ergonomic Memory Foam Keyboard & Mouse Wrist Rest Set',
      slug: 'memoryfoam-wristrest-keyboard-set',
      description: 'Contoured slow-rebound memory foam with breathable cooling Lycra fabric and non-skid rubber base. Prevents carpal tunnel strain during long working hours.',
      price: 499.00,
      compareAtPrice: 799.00,
      minutesPrice: 399.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 12,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-007',
      stock: 80,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      ]),
    },
    {
      name: 'Minimalist Heavy Machined Aluminum Desk Pen Holder',
      slug: 'machined-aluminum-pen-holder',
      description: 'Solid billet CNC milled anodized aerospace aluminum cylinder pencil cup with soft non-scratch velvet base. Sleek executive desktop statement.',
      price: 349.00,
      compareAtPrice: 599.00,
      minutesPrice: 279.00,
      isMinutesEligible: true,
      deliveryTimeMinutes: 10,
      minutesCategory: 'Desk Essentials',
      sku: 'KV-WRK-008',
      stock: 65,
      sellerId: seller1.id,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
      ]),
    },
  ];

  const createdProducts = [];
  for (const prod of productsList) {
    const created = await prisma.product.create({
      data: {
        ...prod,
        rating: 4.8,
        reviewCount: 0,
      },
    });
    createdProducts.push(created);
  }
  console.log(`✅ Seeded ${createdProducts.length} diverse products across 8 categories.`);

  // 4. Seed Authentic Customer Reviews (Amazon / Flipkart Style)
  console.log('⭐ Seeding authentic customer reviews and rating breakdowns...');

  const reviewTemplates = [
    {
      rating: 5,
      title: 'Outstanding quality and fast delivery!',
      comment: 'Absolutely exceeded my expectations. The build quality feels exceptionally premium, tactile feel is superb, and it arrived in immaculate condition. Worth every rupee!',
    },
    {
      rating: 5,
      title: 'Verified purchase - Best in class value',
      comment: 'Comparing this to brands charging 2x the price, Kivo has nailed the design. Delivered within the promised timeline and works flawlessly right out of the box.',
    },
    {
      rating: 4,
      title: 'Very good product, sleek design',
      comment: 'Solid ergonomics and clean finish. Material is top notch. Slight minor point on packaging, but the actual product itself is 5 stars. Happy with the purchase.',
    },
    {
      rating: 5,
      title: '⚡ Kivo Minutes delivery was unbelievable!',
      comment: 'Ordered through the quick 10-15 minute delivery channel and rider arrived at my doorstep in Bandra in exactly 12 minutes! Fresh, brand new, and great price.',
    },
    {
      rating: 4,
      title: 'Exceeded expectations for daily use',
      comment: 'Have been using this daily for over two weeks now. Extremely durable, comfortable, and looks modern on my desk. Highly recommended to anyone looking for clean aesthetics.',
    },
    {
      rating: 5,
      title: 'Top notch craftsmanship and authentic feel',
      comment: 'The attention to detail is evident right from the first touch. Customer support was also very responsive. Will definitely order more items from this seller.',
    },
    {
      rating: 3,
      title: 'Decent overall, good for the price',
      comment: 'Good everyday item for the budget. Works as advertised though color tone is slightly warmer than the picture. Overall satisfied.',
    },
  ];

  let reviewCounter = 0;
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    // Each product receives 3 to 5 reviews
    const numReviews = 3 + (i % 3); // 3, 4, or 5 reviews
    const productRatings = [];

    for (let rIdx = 0; rIdx < numReviews; rIdx++) {
      const reviewer = reviewers[(i + rIdx) % reviewers.length];
      const template = reviewTemplates[(i * 2 + rIdx) % reviewTemplates.length];
      
      const daysAgo = (rIdx + 1) * 3 + (i % 5);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          verifiedPurchase: true,
          createdAt,
        },
      });

      productRatings.push(template.rating);
      reviewCounter++;
    }

    // Recalculate average rating for product
    const avgRating = productRatings.reduce((a, b) => a + b, 0) / productRatings.length;
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: productRatings.length,
      },
    });
  }

  console.log(`✅ Seeded ${reviewCounter} authentic verified customer reviews across all products.`);

  // 5. Interconnected Sample Orders for Seller & Admin Dashboards
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
            productId: createdProducts[0].id, // ANC Headphones
            sellerId: seller1.id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            unitPrice: 1499.00,
            quantity: 1,
            total: 1499.00,
            status: 'PACKED',
            isMinutesItem: false,
          },
          {
            productId: createdProducts[16].id, // Oversized Tee
            sellerId: seller3.id,
            productName: createdProducts[16].name,
            productSku: createdProducts[16].sku,
            productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
            unitPrice: 599.00,
            quantity: 1,
            total: 599.00,
            status: 'CONFIRMED',
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

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'KV-MIN-2026-90412',
      userId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      status: 'DELIVERED',
      subtotal: 517.00,
      shippingFee: 69.00,
      tax: 98.28,
      discount: 0.00,
      total: 684.28,
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
            productId: createdProducts[41].id, // Nitro Cold Brew Coffee (Minutes price ₹149)
            sellerId: seller2.id,
            productName: createdProducts[41].name,
            productSku: createdProducts[41].sku,
            productImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
            unitPrice: 149.00,
            quantity: 1,
            total: 149.00,
            status: 'DELIVERED',
            isMinutesItem: true,
          },
          {
            productId: createdProducts[42].id, // Trail mix (Minutes price ₹119)
            sellerId: seller2.id,
            productName: createdProducts[42].name,
            productSku: createdProducts[42].sku,
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
          amount: 684.28,
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
  console.log(`   ⚡ Kivo Minutes Order ${order2.orderNumber} (Delivered in 11 mins by Vikram Sen: ₹684.28)`);
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
