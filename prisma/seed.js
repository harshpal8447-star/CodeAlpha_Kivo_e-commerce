import { PrismaClient } from '@prisma/client';
import bcrypt from '../server/node_modules/bcryptjs/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Kivo database seeding...');

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

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPassword123!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@kivo.com',
      passwordHash: adminPasswordHash,
      name: 'Kivo Administrator',
      role: 'ADMIN',
    },
  });

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
            street: '742 Evergreen Terrace, Apt 4B',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
            phone: '+1 (503) 555-0199',
            isDefault: true,
          },
          {
            fullName: 'Sarah Mitchell (Studio)',
            street: '120 NW 9th Ave, Suite 300',
            city: 'Portland',
            state: 'OR',
            postalCode: '97209',
            country: 'United States',
            phone: '+1 (503) 555-0144',
            isDefault: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created Admin and Demo Customer accounts.');

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Audio & Tech',
      slug: 'audio-tech',
      description: 'Studio-grade headphones, tactile mechanical keyboards, and sleek workspace essentials.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Handcrafted ceramic drinkware, architectural desk lamps, and sculptural objects for mindful living.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    },
    {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Heavyweight organic cotton tees, relaxed tailoring, and timeless weather-resistant outerwear.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    },
    {
      name: 'Bags & Carry',
      slug: 'bags-carry',
      description: 'Weatherproof ripstop backpacks, minimalist leather cardholders, and utilitarian weekender bags.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Low-profile Italian leather sneakers, breathable knit runners, and cushioned indoor mules.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    },
    {
      name: 'Wellness & Scents',
      slug: 'wellness-scents',
      description: 'Natural soy wax candles, cold-pressed botanical mists, and meditative incense burners.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Created ${categoriesData.length} product categories.`);

  // 3. Create Products
  const productsData = [
    // Audio & Tech
    {
      name: 'Kivo Studio Over-Ear ANC Headphones',
      slug: 'kivo-studio-anc-headphones',
      description: 'Engineered with custom 40mm beryllium drivers, hybrid active noise cancellation, and ultra-soft memory foam earcups. 42 hours of battery life with USB-C quick charge.',
      price: 289.00,
      compareAtPrice: 349.00,
      sku: 'KV-AUD-001',
      stock: 35,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 48,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
      ]),
    },
    {
      name: 'Haptic Mechanical Wireless Keyboard',
      slug: 'haptic-mechanical-keyboard',
      description: 'Solid CNC anodized aluminum chassis with custom pre-lubed tactile switches, hot-swappable sockets, and PBT double-shot keycaps. Multi-device Bluetooth 5.2 and 2.4GHz dongle.',
      price: 165.00,
      compareAtPrice: 195.00,
      sku: 'KV-AUD-002',
      stock: 18,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 32,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
      ]),
    },
    {
      name: 'Monolith Portable Hi-Fi Bluetooth Speaker',
      slug: 'monolith-portable-hifi-speaker',
      description: 'Seamless acoustic fabric with brushed copper trim. 360-degree sound projection, IPX7 water resistance, and an integrated leather carry handle for seamless portability.',
      price: 139.00,
      compareAtPrice: null,
      sku: 'KV-AUD-003',
      stock: 4, // Low stock showcase
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      ]),
    },
    {
      name: 'Precision Wireless Charging Pad',
      slug: 'precision-wireless-charging-pad',
      description: 'Crafted from Italian walnut veneer and weighted space-grade aluminum. Fast 15W Qi-certified induction charging with intelligent thermal regulation.',
      price: 58.00,
      compareAtPrice: 70.00,
      sku: 'KV-AUD-004',
      stock: 62,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 27,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622445262464-84b14e0745b1?w=800&q=80',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
      ]),
    },

    // Home & Living
    {
      name: 'Artisanal Matte Ceramic Mug Set (Pair)',
      slug: 'artisanal-matte-ceramic-mug-set',
      description: 'Wheel-thrown stoneware glazed in speckled chalk white and raw textured clay base. Ergonomic silhouette designed for morning pour-overs and herbal infusions.',
      price: 44.00,
      compareAtPrice: null,
      sku: 'KV-HOM-001',
      stock: 40,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 64,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
      ]),
    },
    {
      name: 'Nordic Adjustable Brass Task Lamp',
      slug: 'nordic-adjustable-brass-task-lamp',
      description: 'Spun brass hood with cantilevered steel arms and solid travertine stone counterweight. Warm dimming 2700K integrated LED provides glare-free illumination.',
      price: 185.00,
      compareAtPrice: 220.00,
      sku: 'KV-HOM-002',
      stock: 12,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 21,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      ]),
    },
    {
      name: 'Double-Walled Borosilicate Glass Carafe',
      slug: 'double-walled-glass-carafe',
      description: 'Thermally insulated hand-blown borosilicate glass with drip-free silicone pour spout. Holds 1.2L of hot brew or cold chilled water without exterior condensation.',
      price: 52.00,
      compareAtPrice: 65.00,
      sku: 'KV-HOM-003',
      stock: 28,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 15,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80',
      ]),
    },

    // Apparel
    {
      name: 'Heavyweight Supima Relaxed T-Shirt',
      slug: 'heavyweight-supima-relaxed-tee',
      description: '280 GSM long-staple organic Supima cotton. Pre-shrunk with blind-stitched hems and a structured ribbed neckline. Cut in a contemporary relaxed boxy drape.',
      price: 48.00,
      compareAtPrice: null,
      sku: 'KV-APP-001',
      stock: 55,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 78,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      ]),
    },
    {
      name: 'Merino Wool Minimalist Mockneck',
      slug: 'merino-wool-minimalist-mockneck',
      description: 'Spun from 19.5 micron extrafine Australian merino wool. Naturally thermoregulating, odor-resistant, and silky soft against bare skin.',
      price: 135.00,
      compareAtPrice: 160.00,
      sku: 'KV-APP-002',
      stock: 15,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 36,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
      ]),
    },
    {
      name: 'Technical Storm-Proof Trench Shell',
      slug: 'technical-storm-proof-trench',
      description: '3-layer bonded Japanese waterproof membrane with fully taped seams, magnetic storm flap, and hidden internal phone pocket. Built for unpredictable city commutes.',
      price: 340.00,
      compareAtPrice: 420.00,
      sku: 'KV-APP-003',
      stock: 8,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 14,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
      ]),
    },

    // Bags & Carry
    {
      name: 'Waterproof Rolltop Commuter Backpack 24L',
      slug: 'waterproof-rolltop-commuter-backpack',
      description: 'Crafted from 100% recycled 600D ripstop fabric with TPU coating. Dedicated floating 16-inch padded laptop compartment, luggage pass-through sleeve, and magnetic Fidlock buckle.',
      price: 158.00,
      compareAtPrice: 185.00,
      sku: 'KV-BAG-001',
      stock: 22,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 52,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
      ]),
    },
    {
      name: 'Full-Grain Vegetable Tanned Cardholder',
      slug: 'vegetable-tanned-leather-cardholder',
      description: 'Hand-burnished edges and saddle-stitched bonded nylon thread. Holds up to 8 cards and folded bills. Develops an organic rich patina uniquely your own over time.',
      price: 45.00,
      compareAtPrice: null,
      sku: 'KV-BAG-002',
      stock: 45,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 39,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        'https://images.unsplash.com/photo-1606503829026-6d73f1d53aa4?w=800&q=80',
      ]),
    },
    {
      name: 'Weekend Overnighter Duffle Bag 38L',
      slug: 'weekend-overnighter-duffle-bag',
      description: 'Heavy 18oz water-repellent duck canvas with harness leather handles and brass YKK two-way zips. Includes separated ventilated shoe chamber.',
      price: 195.00,
      compareAtPrice: 230.00,
      sku: 'KV-BAG-003',
      stock: 14,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 22,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80',
      ]),
    },

    // Footwear
    {
      name: 'Court Leather Low-Top Sneaker',
      slug: 'court-leather-low-top-sneaker',
      description: 'Handcrafted in Marche, Italy using butter-soft calfskin leather, stitched Margom rubber cupsole, and anti-microbial vegetable leather insoles.',
      price: 215.00,
      compareAtPrice: 250.00,
      sku: 'KV-FTW-001',
      stock: 20,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 41,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      ]),
    },
    {
      name: 'Wool Felt Indoor/Outdoor Slip-On Mule',
      slug: 'wool-felt-slip-on-mule',
      description: 'Natural boiled Tyrolean wool felt upper with an anatomical cork-latex footbed and non-marking natural crepe rubber sole for indoor lounge and outdoor errands.',
      price: 110.00,
      compareAtPrice: null,
      sku: 'KV-FTW-002',
      stock: 0, // Out of stock showcase
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 18,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
      ]),
    },

    // Wellness & Scents
    {
      name: 'Hinoki Wood & Amber Soy Wax Candle',
      slug: 'hinoki-wood-amber-soy-candle',
      description: 'Notes of Japanese cypress, smoked cedarwood, and resinous amber. Hand-poured in small batches into a frosted stoneware tumbler with an FSC-certified wooden wick.',
      price: 38.00,
      compareAtPrice: 45.00,
      sku: 'KV-WEL-001',
      stock: 50,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 56,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
    {
      name: 'Ultrasonic Ceramic Aroma Diffuser',
      slug: 'ultrasonic-ceramic-aroma-diffuser',
      description: 'Matte unglazed porcelain cover with subtle ambient LED ring. Whispers quiet 2.4MHz ultrasonic vibration provides up to 9 hours of humidifying aromatherapy.',
      price: 88.00,
      compareAtPrice: 105.00,
      sku: 'KV-WEL-002',
      stock: 25,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 30,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} realistic products.`);

  // 4. Create Initial Product Reviews
  const firstProduct = createdProducts[0];
  await prisma.review.createMany({
    data: [
      {
        productId: firstProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'Outstanding soundstage and sublime build',
        comment: 'The noise cancellation completely blocks out subway chatter and office hum. Comfort during 8-hour work stretches is genuinely exceptional. Worth every penny.',
        verifiedPurchase: true,
      },
      {
        productId: createdProducts[4].id, // Mug set
        userId: customer.id,
        rating: 5,
        title: 'Daily morning ritual elevated',
        comment: 'The speckled chalk glaze feels wonderful in hand. Heavy, durable, and keeps my espresso and flat whites hot. Truly artisanal craftsmanship.',
        verifiedPurchase: true,
      },
    ],
  });
  console.log('✅ Created initial customer reviews.');

  // 5. Create a Sample Historical Order for Demo Customer
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'KV-2026-98421',
      userId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      status: 'DELIVERED',
      subtotal: 337.00,
      shippingFee: 0.00, // Free shipping over $50
      tax: 26.96,
      discount: 0.00,
      total: 363.96,
      shippingAddress: JSON.stringify({
        fullName: 'Sarah Mitchell',
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States',
        phone: '+1 (503) 555-0199',
      }),
      paymentMethod: 'DEMO_PAYMENT',
      paymentStatus: 'COMPLETED',
      items: {
        create: [
          {
            productId: firstProduct.id,
            productName: firstProduct.name,
            productSku: firstProduct.sku,
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            unitPrice: 289.00,
            quantity: 1,
            total: 289.00,
          },
          {
            productId: createdProducts[7].id, // Heavyweight Supima tee
            productName: createdProducts[7].name,
            productSku: createdProducts[7].sku,
            productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
            unitPrice: 48.00,
            quantity: 1,
            total: 48.00,
          },
        ],
      },
      payments: {
        create: {
          amount: 363.96,
          currency: 'USD',
          provider: 'DEMO',
          status: 'COMPLETED',
          transactionId: 'TXN-DEMO-98421001',
          metadata: JSON.stringify({ note: 'Simulated demo payment completed' }),
        },
      },
    },
  });

  console.log(`✅ Created sample completed order ${sampleOrder.orderNumber} for ${customer.name}.`);
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
