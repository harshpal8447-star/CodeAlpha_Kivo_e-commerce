import { PrismaClient } from '@prisma/client';
import bcrypt from '../server/node_modules/bcryptjs/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Kivo database seeding (Indian Rupee & Expanded 48+ Catalog)...');

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

  console.log('✅ Created Admin and Demo Customer accounts with Indian addresses.');

  // 2. Create 8 Curated Categories
  const categoriesData = [
    {
      name: 'Audio & Tech',
      slug: 'audio-tech',
      description: 'Studio-grade headphones, tactile wireless mechanical keyboards, and acoustic fidelity components.',
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
      description: 'Heavyweight organic cotton staples, relaxed tailoring, and weather-resistant minimalist outerwear.',
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
      description: 'Italian leather low-profile sneakers, lightweight merino runners, and cushioned indoor-outdoor mules.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    },
    {
      name: 'Wellness & Scents',
      slug: 'wellness-scents',
      description: 'Cold-pressed botanical oils, hand-poured soy wax candles, and meditative ultrasonic ceramic diffusers.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    },
    {
      name: 'Watches & Accessories',
      slug: 'watches-accessories',
      description: 'Sapphire crystal automatic timepieces, titanium chronographs, and aerospace-grade everyday gear.',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    },
    {
      name: 'Workspace & Desk',
      slug: 'workspace-desk',
      description: 'Solid American walnut monitor stands, full-grain leather desk pads, and precision milled pen trays.',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Created ${categoriesData.length} product categories.`);

  // 3. Create 48 Detailed Products in Indian Rupees (₹)
  const productsData = [
    // ----------------------------------------------------
    // Category 1: Audio & Tech (6 products)
    // ----------------------------------------------------
    {
      name: 'Kivo Studio Over-Ear ANC Headphones',
      slug: 'kivo-studio-anc-headphones',
      description: 'Engineered with custom 40mm beryllium drivers, hybrid active noise cancellation, and ultra-soft memory foam earcups. 42 hours of battery life with USB-C quick charge.',
      price: 24999.00,
      compareAtPrice: 29999.00,
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
      slug: 'haptic-mechanical-wireless-keyboard',
      description: 'Precision CNC-anodized aluminum frame with hot-swappable tactile switches, sound-dampening silicone gasket mount, and multi-device Bluetooth 5.2 pairing.',
      price: 12499.00,
      compareAtPrice: 14999.00,
      sku: 'KV-AUD-002',
      stock: 22,
      categoryId: categories['audio-tech'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 34,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      ]),
    },
    {
      name: 'Acoustic Precision Hi-Fi Earbuds',
      slug: 'acoustic-precision-hifi-earbuds',
      description: 'Dual balanced-armature drivers in miniature ceramic acoustic chambers. Transparent ambient passthrough, IPX5 water resistance, and 30-hour wireless case.',
      price: 7999.00,
      compareAtPrice: 9999.00,
      sku: 'KV-AUD-003',
      stock: 40,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 29,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
      ]),
    },
    {
      name: 'Solid Aluminum Desktop DAC & Amp',
      slug: 'solid-aluminum-desktop-dac-amp',
      description: 'Audiophile 32-bit/768kHz ESS Sabre DAC with balanced 4.4mm and 6.35mm outputs. Milled from a single billet of aircraft aluminum with smooth weighted volume attenuator.',
      price: 18999.00,
      compareAtPrice: 22499.00,
      sku: 'KV-AUD-004',
      stock: 14,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
      ]),
    },
    {
      name: 'Studio Condenser Podcast Microphone',
      slug: 'studio-condenser-podcast-microphone',
      description: 'Gold-sputtered large diaphragm cardioid capsule with 24-bit/96kHz onboard processing. Zero-latency headphone monitoring and internal shockmount.',
      price: 10999.00,
      compareAtPrice: 13499.00,
      sku: 'KV-AUD-005',
      stock: 28,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 23,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=800&q=80',
      ]),
    },
    {
      name: 'Magnetic Fast Wireless Charging Pad',
      slug: 'magnetic-fast-wireless-charging-pad',
      description: 'Braided recycled-nylon cable paired with matte zinc base and Italian full-grain leather touch surface. Delivers up to 15W Qi-certified rapid charging.',
      price: 3499.00,
      compareAtPrice: 4299.00,
      sku: 'KV-AUD-006',
      stock: 65,
      categoryId: categories['audio-tech'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 38,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622445268462-9599554a9d70?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 2: Home & Living (6 products)
    // ----------------------------------------------------
    {
      name: 'Artisanal Ceramic Pour-Over & Carafe',
      slug: 'artisanal-ceramic-pour-over-carafe',
      description: 'Wheel-thrown stoneware glazed in natural chalk white. Designed with internal spiral extraction ribs for optimum bloom and sweet balanced morning pour-overs.',
      price: 3899.00,
      compareAtPrice: 4599.00,
      sku: 'KV-HOM-001',
      stock: 30,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 36,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
      ]),
    },
    {
      name: 'Sculptural Cast Brass Task Lamp',
      slug: 'sculptural-cast-brass-task-lamp',
      description: 'Solid untreated spun brass shade with counterbalanced steel pivot arm. Touch-capacitive 3-stage stepless dimming with warm 2700K museum-grade CRI 95 LEDs.',
      price: 14499.00,
      compareAtPrice: 17999.00,
      sku: 'KV-HOM-002',
      stock: 12,
      categoryId: categories['home-living'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 21,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      ]),
    },
    {
      name: 'Pure Washed Belgian Linen Duvet Set',
      slug: 'pure-washed-belgian-linen-duvet-set',
      description: 'Woven from 100% natural European flax and enzyme garment washed for lived-in softness. Breathable, hypoallergenic, and includes duvet cover plus two pillowcases.',
      price: 8999.00,
      compareAtPrice: 11499.00,
      sku: 'KV-HOM-003',
      stock: 18,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 42,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      ]),
    },
    {
      name: 'Minimalist Matte Wall Clock',
      slug: 'minimalist-matte-wall-clock',
      description: 'A 30cm powder-coated steel disc with debossed hourly markers and silent sweep quartz German movement. No ticking distractions.',
      price: 2999.00,
      compareAtPrice: 3799.00,
      sku: 'KV-HOM-004',
      stock: 45,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80',
      ]),
    },
    {
      name: 'Hand-Carved Travertine Stone Catchall',
      slug: 'hand-carved-travertine-stone-catchall',
      description: 'Carved from natural Italian travertine stone with honed matte texture. Perfect for storing pocket watches, everyday keys, and jewelry.',
      price: 3299.00,
      compareAtPrice: 3999.00,
      sku: 'KV-HOM-005',
      stock: 25,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 15,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
      ]),
    },
    {
      name: 'Handcrafted Ceramic Tumbler Set (4-Pack)',
      slug: 'handcrafted-ceramic-tumbler-set',
      description: 'Set of four stoneware drinking vessels with earthy raw clay bases and satin mist glazes. Stackable, dishwasher safe, and microwave friendly.',
      price: 2499.00,
      compareAtPrice: 2999.00,
      sku: 'KV-HOM-006',
      stock: 35,
      categoryId: categories['home-living'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 28,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 3: Apparel (6 products)
    // ----------------------------------------------------
    {
      name: 'Heavyweight Supima Cotton Crewneck Tee',
      slug: 'heavyweight-supima-cotton-crewneck',
      description: 'Crafted from 280 GSM long-staple organic Supima cotton. Features reinforced double-needle collar ribbing, blind hems, and pre-shrunk finish.',
      price: 1499.00,
      compareAtPrice: 1999.00,
      sku: 'KV-APP-001',
      stock: 120,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 88,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      ]),
    },
    {
      name: 'Relaxed Merino Wool Knit Sweater',
      slug: 'relaxed-merino-wool-knit-sweater',
      description: 'Spun from 19.5-micron non-mulesed Australian extra-fine merino wool. Naturally odor-resistant, thermoregulating, and luxuriously soft against bare skin.',
      price: 6499.00,
      compareAtPrice: 7999.00,
      sku: 'KV-APP-002',
      stock: 45,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 32,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      ]),
    },
    {
      name: 'Japanese Selvedge Denim Trousers',
      slug: 'japanese-selvedge-denim-trousers',
      description: 'Shuttle-loomed in Kojima, Japan from 13.5oz indigo-dyed raw denim. Finished with pink selvedge ticker line, custom brass donut buttons, and vegetable-tanned leather patch.',
      price: 7999.00,
      compareAtPrice: 9499.00,
      sku: 'KV-APP-003',
      stock: 30,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 26,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80',
      ]),
    },
    {
      name: 'Waterproof All-Weather Commuter Parka',
      slug: 'waterproof-all-weather-commuter-parka',
      description: '3-layer laminated recycled nylon shell rated at 20,000mm waterproofing. Fully taped seams, magnetic pocket closures, and adjustable storm hood.',
      price: 13999.00,
      compareAtPrice: 16999.00,
      sku: 'KV-APP-004',
      stock: 18,
      categoryId: categories['apparel'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 22,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80',
      ]),
    },
    {
      name: 'Relaxed French Terry Cotton Hoodie',
      slug: 'relaxed-french-terry-cotton-hoodie',
      description: '450 GSM diagonal-loop French terry cotton. Custom double-layer hood without drawstrings for clean silhouette, ribbed side gussets, and kangaroo pocket.',
      price: 3499.00,
      compareAtPrice: 4299.00,
      sku: 'KV-APP-005',
      stock: 55,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 40,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      ]),
    },
    {
      name: 'Camp Collar Organic Linen Shirt',
      slug: 'camp-collar-organic-linen-shirt',
      description: 'Breathable lightweight organic linen in relaxed boxy silhouette. Features real mother-of-pearl buttons and straight vented hem.',
      price: 2799.00,
      compareAtPrice: 3499.00,
      sku: 'KV-APP-006',
      stock: 40,
      categoryId: categories['apparel'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 4: Bags & Carry (6 products)
    // ----------------------------------------------------
    {
      name: 'Minimalist Weatherproof Commuter Backpack',
      slug: 'minimalist-weatherproof-commuter-backpack',
      description: 'Constructed from recycled 840D ballistic nylon with TPU water-resistant coating. Dedicated padded 16-inch laptop compartment, luggage trolley sleeve, and YKK AquaGuard zippers.',
      price: 7499.00,
      compareAtPrice: 8999.00,
      sku: 'KV-BAG-001',
      stock: 35,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 39,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
      ]),
    },
    {
      name: 'Full-Grain Italian Leather Weekender Duffle',
      slug: 'full-grain-leather-weekender-duffle',
      description: 'Handcrafted in Tuscany from vegetable-tanned Vacchetta leather that patinas richly over years. Antique solid brass hardware and reinforced heavy-duty cotton twill lining.',
      price: 18999.00,
      compareAtPrice: 22999.00,
      sku: 'KV-BAG-002',
      stock: 12,
      categoryId: categories['bags-carry'].id,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 18,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80',
        'https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=800&q=80',
      ]),
    },
    {
      name: 'RFID-Shielded Slim Leather Cardholder',
      slug: 'rfid-shielded-slim-leather-cardholder',
      description: 'Holds up to 8 cards and folded currency in an ultra-slim 4mm profile. Lined with electromagnetic shielding fabric to safeguard against unauthorized wireless skimming.',
      price: 1699.00,
      compareAtPrice: 2199.00,
      sku: 'KV-BAG-003',
      stock: 80,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 52,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      ]),
    },
    {
      name: 'Crossbody Ripstop Utility Sling Pack',
      slug: 'crossbody-ripstop-utility-sling-pack',
      description: 'Featherlight 2.5L capacity sling bag with Fidlock magnetic V-buckle. Features microfleece-lined phone pocket, key tether, and expandable gusset.',
      price: 2999.00,
      compareAtPrice: 3799.00,
      sku: 'KV-BAG-004',
      stock: 45,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 31,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      ]),
    },
    {
      name: 'Waxed Canvas Heavy Duty Tote Bag',
      slug: 'waxed-canvas-heavy-duty-tote-bag',
      description: '18oz paraffin-waxed duck canvas with saddle-stitched bridle leather handles. Self-standing structured base with internal water bottle sleeve.',
      price: 3899.00,
      compareAtPrice: 4699.00,
      sku: 'KV-BAG-005',
      stock: 28,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 24,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      ]),
    },
    {
      name: 'Waterproof Tech Organizer Dopp Kit',
      slug: 'waterproof-tech-organizer-dopp-kit',
      description: 'Origami-style clamshell opening with elastic mesh cord holders, SD card slots, and zippered battery compartment. Keeps cables tangle-free.',
      price: 2199.00,
      compareAtPrice: 2699.00,
      sku: 'KV-BAG-006',
      stock: 60,
      categoryId: categories['bags-carry'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 45,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 5: Footwear (6 products)
    // ----------------------------------------------------
    {
      name: 'Low-Profile Italian Leather Sneaker',
      slug: 'low-profile-italian-leather-sneaker',
      description: 'Minimalist cupsole silhouette made from buttery full-grain calfskin leather in Marche, Italy. Stitched Margom rubber outsoles and ergonomic leather-lined insoles.',
      price: 11999.00,
      compareAtPrice: 14499.00,
      sku: 'KV-FTW-001',
      stock: 24,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 44,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      ]),
    },
    {
      name: 'Breathable Merino Wool Knit Runners',
      slug: 'breathable-merino-wool-knit-runners',
      description: 'Seamless single-piece merino wool upper that flexes naturally with every stride. Sugarcane SweetFoam midsole provides lightweight bouncy shock absorption.',
      price: 7499.00,
      compareAtPrice: 8999.00,
      sku: 'KV-FTW-002',
      stock: 35,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 38,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      ]),
    },
    {
      name: 'Water-Resistant Chelsea Commuter Boot',
      slug: 'water-resistant-chelsea-commuter-boot',
      description: 'Oiled waterproof nubuck leather with elasticated side gores and pull tabs. Goodyear welted Vibram lug sole delivers supreme grip across wet city sidewalks.',
      price: 13499.00,
      compareAtPrice: 16999.00,
      sku: 'KV-FTW-003',
      stock: 20,
      categoryId: categories['footwear'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 29,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
      ]),
    },
    {
      name: 'Cushioned Suede Indoor-Outdoor Mules',
      slug: 'cushioned-suede-indoor-outdoor-mules',
      description: 'Rich velvety split suede upper lined with natural shearling wool. Molded cork-latex footbed contours to your foot arch over time.',
      price: 5999.00,
      compareAtPrice: 7299.00,
      sku: 'KV-FTW-004',
      stock: 32,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 25,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      ]),
    },
    {
      name: 'Lightweight Canvas Deck Slip-On',
      slug: 'lightweight-canvas-deck-slip-on',
      description: '10oz washed organic cotton canvas with vulcanized gum rubber sole and padded heel counter. The quintessential relaxed warm-weather staple.',
      price: 2999.00,
      compareAtPrice: 3699.00,
      sku: 'KV-FTW-005',
      stock: 50,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 31,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      ]),
    },
    {
      name: 'Retro Gumsole Court Trainer',
      slug: 'retro-gumsole-court-trainer',
      description: 'Vintage 1970s tennis court design reimagined with smooth white leather and grey suede T-toe detailing. Non-marking gum rubber traction.',
      price: 8999.00,
      compareAtPrice: 10999.00,
      sku: 'KV-FTW-006',
      stock: 28,
      categoryId: categories['footwear'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 6: Wellness & Scents (6 products)
    // ----------------------------------------------------
    {
      name: 'Cedar & Amber Hand-Poured Soy Candle',
      slug: 'cedar-amber-hand-poured-soy-candle',
      description: '100% natural Midwestern soy wax blended with Atlas cedarwood, warm amber resin, and vetiver. Dual lead-free cotton wicks provide 65 hours of clean soot-free burn.',
      price: 1899.00,
      compareAtPrice: 2299.00,
      sku: 'KV-WEL-001',
      stock: 75,
      categoryId: categories['wellness-scents'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 54,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80',
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
    {
      name: 'Ultrasonic Ceramic Aroma Diffuser',
      slug: 'ultrasonic-ceramic-aroma-diffuser',
      description: 'Matte unglazed porcelain cover with subtle ambient LED ring. Whispers quiet 2.4MHz ultrasonic vibration provides up to 9 hours of humidifying aromatherapy.',
      price: 4499.00,
      compareAtPrice: 5499.00,
      sku: 'KV-WEL-002',
      stock: 30,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 30,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },
    {
      name: 'Botanical Hinoki & Bergamot Room Mist',
      slug: 'botanical-hinoki-bergamot-room-mist',
      description: 'Distilled with pure Japanese Hinoki wood essential oil, crisp Italian bergamot, and sweet orange blossom. Spray lightly on linens and workspace for instant calm.',
      price: 1499.00,
      compareAtPrice: 1899.00,
      sku: 'KV-WEL-003',
      stock: 60,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 22,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
      ]),
    },
    {
      name: 'Solid Cast Brass Incense Burner',
      slug: 'solid-cast-brass-incense-burner',
      description: 'Weighted 450g solid brass sphere with stepped tray. Accommodates traditional stick incense, Japanese bamboo core dhoop, and cone burners.',
      price: 2499.00,
      compareAtPrice: 3199.00,
      sku: 'KV-WEL-004',
      stock: 40,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 17,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      ]),
    },
    {
      name: 'Handcrafted Tibetan Meditation Singing Bowl',
      slug: 'tibetan-meditation-singing-bowl',
      description: 'Hand-hammered from traditional seven-metal bell bronze alloy. Includes hand-turned rosewood mallet and brocade ring cushion for rich resonant sound waves.',
      price: 3299.00,
      compareAtPrice: 3999.00,
      sku: 'KV-WEL-005',
      stock: 25,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 16,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      ]),
    },
    {
      name: 'Cold-Pressed Organic Rosehip Facial Elixir',
      slug: 'organic-rosehip-facial-elixir',
      description: '100% single-origin cold-pressed Chilean rosehip seed oil enriched with plant squalane and Vitamin E. Rapidly absorbing hydration for skin renewal.',
      price: 1999.00,
      compareAtPrice: 2499.00,
      sku: 'KV-WEL-006',
      stock: 50,
      categoryId: categories['wellness-scents'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 35,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 7: Watches & Accessories (6 products)
    // ----------------------------------------------------
    {
      name: 'Minimalist Automatic Sapphire Timepiece',
      slug: 'minimalist-automatic-sapphire-timepiece',
      description: 'Japanese Miyota 9015 mechanical automatic movement with 42-hour power reserve. Domed anti-reflective sapphire crystal glass and quick-release Milanese mesh strap.',
      price: 21999.00,
      compareAtPrice: 26999.00,
      sku: 'KV-WCH-001',
      stock: 16,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 27,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      ]),
    },
    {
      name: 'Matte Titanium Field Chronograph',
      slug: 'matte-titanium-field-chronograph',
      description: 'Grade 2 titanium case weighing just 58 grams. 100m water resistance, Swiss Super-LumiNova BGW9 luminous hands, and rugged military-spec Cordura strap.',
      price: 17499.00,
      compareAtPrice: 20999.00,
      sku: 'KV-WCH-002',
      stock: 20,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 21,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      ]),
    },
    {
      name: 'Aerospace Aluminum Key Organizer',
      slug: 'aerospace-aluminum-key-organizer',
      description: 'Holds up to 8 keys in a compact jingling-free pocket silhouette. Includes integrated titanium pocket clip and smooth detent locking mechanism.',
      price: 1899.00,
      compareAtPrice: 2399.00,
      sku: 'KV-WCH-003',
      stock: 65,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 46,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      ]),
    },
    {
      name: 'Polarized Hand-Finished Acetate Sunglasses',
      slug: 'polarized-acetate-sunglasses',
      description: 'Handcrafted from plant-based Mazzucchelli cellulose acetate with custom 5-barrel German hinges. Category 3 polarized lenses with 100% UVA/UVB blockage.',
      price: 6499.00,
      compareAtPrice: 7999.00,
      sku: 'KV-WCH-004',
      stock: 30,
      categoryId: categories['watches-accessories'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 33,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      ]),
    },
    {
      name: 'Forged Carbon Fiber Money Clip',
      slug: 'forged-carbon-fiber-money-clip',
      description: 'Manufactured from autoclave-cured aerospace carbon fiber. Extraordinary strength-to-weight ratio with spring tension that never stretches or deforms.',
      price: 1999.00,
      compareAtPrice: 2499.00,
      sku: 'KV-WCH-005',
      stock: 45,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 18,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
      ]),
    },
    {
      name: 'Solid Brass Rollerball Desk Pen',
      slug: 'solid-brass-rollerball-desk-pen',
      description: 'Precision balanced hexagonal barrel engineered from raw brass. Compatible with universal Schmidt rollerball refills. Comes with solid brass fluted base.',
      price: 3299.00,
      compareAtPrice: 3999.00,
      sku: 'KV-WCH-006',
      stock: 50,
      categoryId: categories['watches-accessories'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 29,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585336261026-77884873c38f?w=800&q=80',
      ]),
    },

    // ----------------------------------------------------
    // Category 8: Workspace & Desk (6 products)
    // ----------------------------------------------------
    {
      name: 'Solid Walnut Dual-Monitor Stand & Shelf',
      slug: 'solid-walnut-dual-monitor-stand',
      description: 'Crafted from sustainable American Black Walnut with satin oil wax seal. Supported by laser-cut structural steel legs with natural cork floor dampening.',
      price: 6999.00,
      compareAtPrice: 8499.00,
      sku: 'KV-WRK-001',
      stock: 22,
      categoryId: categories['workspace-desk'].id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 47,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      ]),
    },
    {
      name: 'Full-Grain Leather Large Desk Blotter Pad',
      slug: 'full-grain-leather-desk-blotter-pad',
      description: '80cm x 40cm workspace surface crafted from vegetable-tanned top-grain leather backed with non-slip natural Merino wool felt. Provides buttery mouse gliding.',
      price: 3499.00,
      compareAtPrice: 4299.00,
      sku: 'KV-WRK-002',
      stock: 40,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 39,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      ]),
    },
    {
      name: 'Precision Aluminum Laptop Riser Stand',
      slug: 'precision-aluminum-laptop-riser',
      description: 'Ergonomic 15-degree elevated angle to relieve cervical neck tension. Open airflow architecture keeps M-series and Intel processors running at maximum speeds.',
      price: 2799.00,
      compareAtPrice: 3499.00,
      sku: 'KV-WRK-003',
      stock: 55,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 31,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      ]),
    },
    {
      name: 'Modular Magnetic Cable Anchor (3-Pack)',
      slug: 'modular-magnetic-cable-anchor-pack',
      description: 'Weighted brushed stainless steel dock paired with silicone magnetic cable collars. Prevents charging cables from slipping off your desk behind monitors.',
      price: 1499.00,
      compareAtPrice: 1899.00,
      sku: 'KV-WRK-004',
      stock: 90,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 42,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622445268462-9599554a9d70?w=800&q=80',
      ]),
    },
    {
      name: 'Ergonomic Contoured Walnut Palm Rest',
      slug: 'ergonomic-contoured-walnut-palm-rest',
      description: 'Smoothly radiused 75% keyboard wrist support sculpted from a single piece of kiln-dried walnut. Polished with organic beeswax for silky wrist support.',
      price: 1899.00,
      compareAtPrice: 2299.00,
      sku: 'KV-WRK-005',
      stock: 35,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 28,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      ]),
    },
    {
      name: 'Architectural Aluminum Desk Organizer Tray',
      slug: 'architectural-aluminum-desk-organizer-tray',
      description: 'Three interlocking powder-coated aluminum trays with chamfered edges. Perfectly sized for pens, sticky notes, earbuds, and everyday pocket knives.',
      price: 2499.00,
      compareAtPrice: 2999.00,
      sku: 'KV-WRK-006',
      stock: 45,
      categoryId: categories['workspace-desk'].id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 16,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585336261026-77884873c38f?w=800&q=80',
      ]),
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} realistic products across 8 categories in Indian Rupees (₹).`);

  // 4. Create Initial Product Reviews
  const firstProduct = createdProducts[0]; // Headphones
  const keyboardProduct = createdProducts[1]; // Keyboard
  const teaProduct = createdProducts[6]; // Pour over
  const teeProduct = createdProducts[12]; // Tee

  await prisma.review.createMany({
    data: [
      {
        productId: firstProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'Outstanding soundstage and sublime build',
        comment: 'The active noise cancellation completely blocks out Mumbai local train noise and office hum. Comfort during 8-hour work stretches is genuinely exceptional. Worth every rupee.',
        verifiedPurchase: true,
      },
      {
        productId: keyboardProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'The typing feel is unmatched',
        comment: 'Solid aluminum heft, deep tactile thock, and seamless switching between my Mac and Windows rig. Easily the best keyboard I have ever owned.',
        verifiedPurchase: true,
      },
      {
        productId: teaProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'Daily morning ritual elevated',
        comment: 'The speckled chalk glaze feels wonderful in hand. Heavy, durable, and brews an immaculate clean cup of coffee. Truly artisanal craftsmanship.',
        verifiedPurchase: true,
      },
      {
        productId: teeProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'Heavyweight organic cotton at its finest',
        comment: 'Superb collar construction that does not bacon after multiple washes. The drape is thick, structured, and luxurious.',
        verifiedPurchase: true,
      },
    ],
  });
  console.log('✅ Created initial customer reviews.');

  // 5. Create a Sample Historical Order for Demo Customer in INR
  // Subtotal: 24,999 (Headphones) + 1,499 (Tee) = 26,498
  // Shipping: ₹0 (subtotal >= 999)
  // GST (18%): 4,769.64
  // Total: 31,267.64
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'KV-2026-98421',
      userId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      status: 'DELIVERED',
      subtotal: 26498.00,
      shippingFee: 0.00,
      tax: 4769.64,
      discount: 0.00,
      total: 31267.64,
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
      items: {
        create: [
          {
            productId: firstProduct.id,
            productName: firstProduct.name,
            productSku: firstProduct.sku,
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            unitPrice: 24999.00,
            quantity: 1,
            total: 24999.00,
          },
          {
            productId: teeProduct.id,
            productName: teeProduct.name,
            productSku: teeProduct.sku,
            productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
            unitPrice: 1499.00,
            quantity: 1,
            total: 1499.00,
          },
        ],
      },
      payments: {
        create: {
          amount: 31267.64,
          currency: 'INR',
          provider: 'UPI_RAZORPAY',
          status: 'COMPLETED',
          transactionId: 'TXN-UPI-98421001-IN',
          metadata: JSON.stringify({ note: 'Simulated UPI payment completed via Blue Dart express dispatch' }),
        },
      },
    },
  });

  console.log(`✅ Created sample completed order ${sampleOrder.orderNumber} for ${customer.name} (₹31,267.64).`);
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
