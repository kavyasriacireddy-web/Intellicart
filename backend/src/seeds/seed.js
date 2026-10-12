const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Interaction = require('../models/Interaction');

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-performance laptops, smartphones, audio devices, and smart accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80',
    icon: 'Laptop',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy apparel, designer footwear, luxury watches, and modern accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
    icon: 'Shirt',
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Smart appliances, ergonomic furniture, kitchenware, and modern decor',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    icon: 'Home',
  },
  {
    name: 'Fitness & Sports',
    slug: 'fitness-sports',
    description: 'Gym gear, wellness essentials, workout equipment, and athletic wear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    icon: 'Dumbbell',
  },
  {
    name: 'Books & Learning',
    slug: 'books-learning',
    description: 'Bestselling novels, programming & AI guides, self-help, and academic books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    icon: 'BookOpen',
  },
];

// 52 diverse, highly realistic products with detailed descriptions, tags, and specs
const productsData = [
  // --- ELECTRONICS (14 Products) ---
  {
    name: 'Apple MacBook Pro 14" M3 Pro',
    categoryName: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Apple',
    price: 1999.00,
    discount: 5,
    description: 'The 14-inch MacBook Pro blasts forward with M3 Pro, an extremely advanced chip that brings serious speed and capability for demanding workflows.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    tags: ['laptop', 'apple', 'macbook', 'm3', 'programming', 'creatives'],
    specifications: { 'Processor': 'Apple M3 Pro', 'RAM': '18GB Unified', 'Storage': '512GB SSD', 'Display': '14.2-inch Liquid Retina XDR' },
    isFeatured: true,
  },
  {
    name: 'Dell XPS 15 InfinityEdge',
    categoryName: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Dell',
    price: 1749.00,
    discount: 10,
    description: 'Stunning 15.6-inch OLED 3.5K display powered by 13th Gen Intel Core i7 and NVIDIA GeForce RTX 4060 graphics. Crafted with CNC machined aluminum.',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    tags: ['laptop', 'dell', 'windows', 'oled', 'intel', 'developer'],
    specifications: { 'Processor': 'Intel Core i7-13700H', 'RAM': '32GB DDR5', 'Storage': '1TB NVMe SSD', 'GPU': 'RTX 4060 8GB' },
    isFeatured: true,
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    categoryName: 'Electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    price: 399.99,
    discount: 15,
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Exceptional Hi-Res sound quality and 30-hour battery life with quick charging.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    tags: ['audio', 'headphones', 'sony', 'wireless', 'noise-canceling', 'bluetooth'],
    specifications: { 'Battery Life': '30 Hours', 'Bluetooth': 'v5.2', 'Weight': '250g', 'Driver': '30mm Carbon Fiber' },
    isFeatured: true,
  },
  {
    name: 'Bose QuietComfort Ultra Headphones',
    categoryName: 'Electronics',
    subcategory: 'Audio',
    brand: 'Bose',
    price: 429.00,
    discount: 8,
    description: 'Revolutionary spatialized audio for more immersive listening. World-class quiet, CustomTune technology, and luxurious cushioned headband for all-day comfort.',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 32,
    tags: ['audio', 'headphones', 'bose', 'noise-canceling', 'travel'],
    specifications: { 'Battery Life': '24 Hours', 'Spatial Audio': 'Yes', 'Connection': 'Bluetooth 5.3' },
    isFeatured: false,
  },
  {
    name: 'Apple AirPods Pro (2nd Generation, USB-C)',
    categoryName: 'Electronics',
    subcategory: 'Audio',
    brand: 'Apple',
    price: 249.00,
    discount: 12,
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio that seamlessly blends ANC and Transparency mode, and personalized spatial audio with dynamic head tracking.',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    tags: ['earbuds', 'apple', 'wireless', 'audio', 'airpods', 'anc'],
    specifications: { 'Chip': 'H2 Chip', 'Charging': 'MagSafe USB-C', 'Water Resistance': 'IP54' },
    isFeatured: true,
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    categoryName: 'Electronics',
    subcategory: 'Accessories',
    brand: 'Logitech',
    price: 99.99,
    discount: 10,
    description: 'Quiet Click technology with 90% less click noise, 8000 DPI track-on-glass sensor, and the ultra-fast MagSpeed electromagnetic scrolling wheel.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 55,
    tags: ['mouse', 'logitech', 'productivity', 'ergonomic', 'accessories'],
    specifications: { 'DPI': '8000 DPI', 'Battery': '70 Days rechargeable', 'Connectivity': 'Bluetooth / Logi Bolt' },
    isFeatured: false,
  },
  {
    name: 'Logitech MX Mechanical Wireless Keyboard',
    categoryName: 'Electronics',
    subcategory: 'Accessories',
    brand: 'Logitech',
    price: 169.99,
    discount: 5,
    description: 'Low-profile mechanical switches with tactile quiet feedback, smart backlighting that illuminates when your hands approach, and multi-device pairing.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    tags: ['keyboard', 'logitech', 'mechanical', 'productivity', 'typing'],
    specifications: { 'Switch Type': 'Tactile Quiet', 'Layout': 'Full Size', 'Battery': 'Up to 10 months' },
    isFeatured: false,
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    categoryName: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Samsung',
    price: 1299.99,
    discount: 8,
    description: 'Meet Galaxy S24 Ultra with Galaxy AI, titanium exterior, built-in S Pen, and an unmatched 200MP camera system with 100x Space Zoom.',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 28,
    tags: ['smartphone', 'samsung', 'android', 'camera', 'galaxy', 'ai'],
    specifications: { 'Screen': '6.8-inch Dynamic AMOLED 2X 120Hz', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB' },
    isFeatured: true,
  },
  {
    name: 'Apple iPhone 15 Pro Max 256GB',
    categoryName: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    price: 1199.00,
    discount: 4,
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['smartphone', 'apple', 'iphone', 'titanium', 'camera'],
    specifications: { 'Processor': 'A17 Pro', 'Storage': '256GB', 'Screen': '6.7-inch Super Retina XDR' },
    isFeatured: true,
  },
  {
    name: 'LG 27GP850-B UltraGear 27" QHD Gaming Monitor',
    categoryName: 'Electronics',
    subcategory: 'Monitors',
    brand: 'LG',
    price: 379.99,
    discount: 15,
    description: 'Nano IPS 1ms 165Hz (O/C 180Hz) display with NVIDIA G-SYNC compatibility and HDR400 for ultra-fluid gaming and vivid creative work.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    tags: ['monitor', 'gaming', 'lg', 'display', 'ips', 'setup'],
    specifications: { 'Resolution': '2560 x 1440 QHD', 'Refresh Rate': '180Hz', 'Response Time': '1ms GtG' },
    isFeatured: false,
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K 140W)',
    categoryName: 'Electronics',
    subcategory: 'Accessories',
    brand: 'Anker',
    price: 149.99,
    discount: 20,
    description: 'Equipped with Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge for laptops.',
    images: [
      'https://images.unsplash.com/photo-1609592426867-0c7d21b7121b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    tags: ['charger', 'powerbank', 'anker', 'accessories', 'laptop-charging'],
    specifications: { 'Capacity': '24,000mAh', 'Max Output': '140W', 'Ports': '2x USB-C, 1x USB-A' },
    isFeatured: false,
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    categoryName: 'Electronics',
    subcategory: 'Accessories',
    brand: 'Keychron',
    price: 199.00,
    discount: 5,
    description: 'All-metal CNC aluminum body, double-gasket design, hot-swappable switches, and QMK/VIA programmable keymaps for mechanical keyboard enthusiasts.',
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    tags: ['keyboard', 'keychron', 'mechanical', 'custom', 'developer'],
    specifications: { 'Body': 'Full Aluminum CNC', 'Switches': 'K Pro Red', 'Connectivity': 'Bluetooth 5.1 / Type-C' },
    isFeatured: false,
  },
  {
    name: 'Sony PlayStation 5 Slim Console',
    categoryName: 'Electronics',
    subcategory: 'Gaming',
    brand: 'Sony',
    price: 499.99,
    discount: 0,
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    tags: ['gaming', 'playstation', 'ps5', 'sony', 'console'],
    specifications: { 'Storage': '1TB SSD', 'Resolution': 'Up to 4K 120Hz / 8K', 'Controller': 'DualSense' },
    isFeatured: true,
  },
  {
    name: 'Kindle Paperwhite 16GB (6.8" Glare-Free)',
    categoryName: 'Electronics',
    subcategory: 'E-Readers',
    brand: 'Amazon',
    price: 149.99,
    discount: 10,
    description: 'Featuring a 6.8-inch display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    tags: ['kindle', 'ereader', 'reading', 'books', 'amazon'],
    specifications: { 'Display': '6.8" 300 ppi glare-free', 'Storage': '16GB', 'Waterproof': 'IPX8' },
    isFeatured: false,
  },

  // --- FASHION (10 Products) ---
  {
    name: 'Nike Air Max 270 React Premium Sneakers',
    categoryName: 'Fashion',
    subcategory: 'Footwear',
    brand: 'Nike',
    price: 159.99,
    discount: 10,
    description: 'Boasting Nike’s biggest heel Air unit yet, the Air Max 270 delivers unrivaled, all-day comfort with modern athletic styling.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['sneakers', 'nike', 'shoes', 'footwear', 'casual', 'running'],
    specifications: { 'Upper Material': 'Knit Mesh', 'Sole': 'Rubber with Max Air 270', 'Closure': 'Lace-Up' },
    isFeatured: true,
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes',
    categoryName: 'Fashion',
    subcategory: 'Footwear',
    brand: 'Adidas',
    price: 189.99,
    discount: 15,
    description: 'Experience epic energy with the lightest Ultraboost ever made. BOOST midsole delivers ultimate cushioning and propulsion for road running.',
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 25,
    tags: ['shoes', 'adidas', 'running', 'footwear', 'fitness', 'sneakers'],
    specifications: { 'Weight': '299g', 'Midsole Drop': '10mm', 'Outsole': 'Continental Rubber' },
    isFeatured: true,
  },
  {
    name: "Levi's Classic Trucker Denim Jacket",
    categoryName: 'Fashion',
    subcategory: 'Outerwear',
    brand: "Levi's",
    price: 89.50,
    discount: 5,
    description: 'A symbol of self-expression for decades, the original jean jacket since 1967. Designed in 100% heavyweight non-stretch cotton denim.',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    tags: ['jacket', 'denim', 'levis', 'outerwear', 'classic', 'casual'],
    specifications: { 'Material': '100% Cotton', 'Fit': 'Regular', 'Pockets': 'Chest & Side Welt' },
    isFeatured: false,
  },
  {
    name: 'Fossil Grant Chronograph Leather Watch',
    categoryName: 'Fashion',
    subcategory: 'Watches',
    brand: 'Fossil',
    price: 140.00,
    discount: 20,
    description: 'Inspired by vintage clocks, our Grant chronograph features classic Roman numeral markers, rich dark brown genuine leather strap, and stainless steel case.',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    tags: ['watch', 'fossil', 'leather', 'accessories', 'luxury', 'chronograph'],
    specifications: { 'Case Size': '44mm', 'Strap Width': '22mm', 'Water Resistance': '5 ATM' },
    isFeatured: true,
  },
  {
    name: 'Ray-Ban Classic Polarized Aviator Sunglasses',
    categoryName: 'Fashion',
    subcategory: 'Eyewear',
    brand: 'Ray-Ban',
    price: 213.00,
    discount: 10,
    description: 'Originally created for U.S. aviators in 1937, classic aviators offer timeless style with polarized crystal green lenses protecting 100% UV rays.',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    tags: ['sunglasses', 'ray-ban', 'aviator', 'eyewear', 'style'],
    specifications: { 'Frame': 'Polished Gold Metal', 'Lens': 'Green Classic G-15 Polarized' },
    isFeatured: false,
  },
  {
    name: 'Zara Slim Fit Tailored Wool Blazer',
    categoryName: 'Fashion',
    subcategory: 'Formal Wear',
    brand: 'Zara',
    price: 129.00,
    discount: 0,
    description: 'Refined single-breasted blazer woven in breathable wool-blend fabric with notched lapels and structured shoulders for formal elegance.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    tags: ['blazer', 'formal', 'zara', 'suit', 'menswear', 'tailored'],
    specifications: { 'Material': '70% Wool, 30% Polyester', 'Fit': 'Slim Fit', 'Vent': 'Double Back Vent' },
    isFeatured: false,
  },
  {
    name: 'Puma T7 Iconic Track Jacket',
    categoryName: 'Fashion',
    subcategory: 'Sportswear',
    brand: 'Puma',
    price: 65.00,
    discount: 15,
    description: 'Classic sportswear heritage straight from the archives with iconic 7cm sleeve stripes and a comfortable full-zip high collar.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    tags: ['jacket', 'puma', 'sportswear', 'tracksuit', 'athleisure'],
    specifications: { 'Fit': 'Regular Fit', 'Pockets': 'Dual Front Pockets', 'Material': 'Recycled Poly-Cotton' },
    isFeatured: false,
  },
  {
    name: 'Tommy Hilfiger Genuine Leather Bifold Wallet',
    categoryName: 'Fashion',
    subcategory: 'Accessories',
    brand: 'Tommy Hilfiger',
    price: 45.00,
    discount: 10,
    description: '100% cowhide leather featuring the signature Tommy stripe exterior accent, 6 interior credit card slots, and an easy-access thumb glide ID window.',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    tags: ['wallet', 'leather', 'accessories', 'tommy-hilfiger', 'gift'],
    specifications: { 'Material': '100% Leather', 'Slots': '6 Card Slots, 2 Slip Pockets' },
    isFeatured: false,
  },
  {
    name: 'Under Armour Tech 2.0 Short Sleeve T-Shirt',
    categoryName: 'Fashion',
    subcategory: 'Sportswear',
    brand: 'Under Armour',
    price: 25.00,
    discount: 0,
    description: 'UA Tech fabric is quick-drying, ultra-soft, and has a more natural feel. Moisture Transport System wicks sweat away from the body.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 75,
    tags: ['tshirt', 'under-armour', 'gym', 'sportswear', 'quick-dry'],
    specifications: { 'Material': '100% Polyester', 'Fit': 'Loose', 'Technology': 'Anti-Odor & Quick Dry' },
    isFeatured: false,
  },
  {
    name: 'Michael Kors Jet Set Travel Tote Bag',
    categoryName: 'Fashion',
    subcategory: 'Bags',
    brand: 'Michael Kors',
    price: 228.00,
    discount: 25,
    description: 'Signature Saffiano leather tote with polished gold-tone hardware, spacious interior compartments, and laptop-friendly drop handles.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 16,
    tags: ['handbag', 'tote', 'michael-kors', 'leather', 'luxury', 'women'],
    specifications: { 'Material': 'Saffiano Leather', 'Closure': 'Top Zip', 'Dimensions': '17" W x 11.5" H' },
    isFeatured: true,
  },

  // --- HOME & KITCHEN (10 Products) ---
  {
    name: 'KitchenAid Artisan Series 5-Quart Stand Mixer',
    categoryName: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    brand: 'KitchenAid',
    price: 449.99,
    discount: 10,
    description: 'The kitchen powerhouse with 10 speeds to gently knead, thoroughly mix, and whip ingredients for a wide variety of recipes with 59-point planetary action.',
    images: [
      'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    tags: ['mixer', 'kitchenaid', 'baking', 'kitchen', 'appliances', 'cooking'],
    specifications: { 'Capacity': '5 Quarts', 'Speeds': '10 Speed', 'Bowl': 'Stainless Steel with Handle' },
    isFeatured: true,
  },
  {
    name: 'Nespresso VertuoPlus Coffee and Espresso Machine',
    categoryName: 'Home & Kitchen',
    subcategory: 'Coffee & Tea',
    brand: 'Nespresso',
    price: 169.00,
    discount: 15,
    description: 'Brew 5 cup sizes at the touch of a button with Centrifusion technology. Delivers rich crema and smooth espresso or coffee using smart barcode recognition.',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 28,
    tags: ['coffee', 'espresso', 'nespresso', 'kitchen', 'morning'],
    specifications: { 'Water Tank': '40 oz movable', 'Heat up time': '20 seconds', 'Cup Sizes': '5 sizes' },
    isFeatured: true,
  },
  {
    name: 'Ninja Foodi 8-in-1 DualZone Air Fryer (8 Qt)',
    categoryName: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    brand: 'Ninja',
    price: 179.99,
    discount: 10,
    description: '2 independent baskets that let you cook 2 foods, 2 ways at the same time, eliminating back-to-back cooking with Smart Finish technology.',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 32,
    tags: ['air-fryer', 'ninja', 'cooking', 'kitchen', 'healthy'],
    specifications: { 'Capacity': '8 Quarts (2 x 4 Qt)', 'Programs': 'Air Fry, Roast, Broil, Dehydrate' },
    isFeatured: false,
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    categoryName: 'Home & Kitchen',
    subcategory: 'Cleaning',
    brand: 'Dyson',
    price: 749.99,
    discount: 5,
    description: 'Dyson’s most powerful intelligent cordless vacuum. An angled laser reveals invisible dust on hard floors, and an acoustic piezo sensor calculates debris size.',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    tags: ['vacuum', 'dyson', 'cleaning', 'smart-home', 'appliances'],
    specifications: { 'Run Time': 'Up to 60 Minutes', 'Filtration': '99.99% down to 0.3 microns' },
    isFeatured: true,
  },
  {
    name: 'Philips Hue Smart LED Starter Kit (4 Bulbs + Bridge)',
    categoryName: 'Home & Kitchen',
    subcategory: 'Smart Lighting',
    brand: 'Philips',
    price: 199.99,
    discount: 12,
    description: 'Transform your home lighting with 16 million colors and shades of warm-to-cool white light. Control via Philips Hue app, Alexa, Apple HomeKit, or Google Assistant.',
    images: [
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['smart-home', 'lighting', 'philips-hue', 'led', 'home-automation'],
    specifications: { 'Bulb Base': 'E26 Standard', 'Lumens': '1100 Lumens', 'Colors': '16 Million' },
    isFeatured: false,
  },
  {
    name: 'Lodge Pre-Seasoned Cast Iron Skillet 10.25 Inch',
    categoryName: 'Home & Kitchen',
    subcategory: 'Cookware',
    brand: 'Lodge',
    price: 24.90,
    discount: 0,
    description: 'The iconic American cast iron skillet. Unparalleled heat retention and even heating. Seasoned with 100% natural vegetable oil for a natural nonstick finish.',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    tags: ['cookware', 'skillet', 'cast-iron', 'cooking', 'kitchen'],
    specifications: { 'Diameter': '10.25 Inches', 'Material': 'Cast Iron', 'Oven Safe': 'Yes' },
    isFeatured: false,
  },
  {
    name: 'Herman Miller Aeron Ergonomic Office Chair',
    categoryName: 'Home & Kitchen',
    subcategory: 'Furniture',
    brand: 'Herman Miller',
    price: 1295.00,
    discount: 5,
    description: 'The benchmark for ergonomic seating. Features 8Z Pellicle breathable mesh, PostureFit SL sacral support, and fully adjustable tilt mechanics.',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    tags: ['chair', 'ergonomic', 'furniture', 'office', 'desk', 'herman-miller'],
    specifications: { 'Size': 'Medium (B)', 'Support': 'PostureFit SL', 'Warranty': '12 Years' },
    isFeatured: true,
  },
  {
    name: 'Levoit Core 400S Smart Air Purifier',
    categoryName: 'Home & Kitchen',
    subcategory: 'Home Appliances',
    brand: 'Levoit',
    price: 219.99,
    discount: 15,
    description: 'High-efficiency 3-stage filtration with H13 True HEPA filter capturing 99.97% of airborne particles. Cleans rooms up to 403 sq ft in 12 minutes.',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    tags: ['air-purifier', 'smart-home', 'health', 'home', 'levoit'],
    specifications: { 'Coverage': 'Up to 403 sq ft', 'Filter': 'H13 True HEPA', 'Noise': '24dB Quiet' },
    isFeatured: false,
  },
  {
    name: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum',
    categoryName: 'Home & Kitchen',
    subcategory: 'Smart Cleaning',
    brand: 'iRobot',
    price: 599.99,
    discount: 10,
    description: 'Powered by iRobot OS with PrecisionVision navigation that identifies and avoids pet waste and cords. Automatically empties into Clean Base for 60 days.',
    images: [
      'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    tags: ['robot-vacuum', 'roomba', 'cleaning', 'smart-home', 'automation'],
    specifications: { 'Dustbin': 'Automatic Self-Emptying', 'Sensors': 'Optical Camera + Obstacle AI' },
    isFeatured: false,
  },
  {
    name: 'Stanley Quencher H2.0 FlowState Tumbler 40 oz',
    categoryName: 'Home & Kitchen',
    subcategory: 'Drinkware',
    brand: 'Stanley',
    price: 45.00,
    discount: 0,
    description: 'Double-wall vacuum insulation keeps ice cold for up to 48 hours. Features recycled stainless steel body and 3-position rotating FlowState lid.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    tags: ['tumbler', 'stanley', 'water-bottle', 'hydration', 'kitchen'],
    specifications: { 'Capacity': '40 Ounces', 'Insulation': 'Double-Wall Vacuum', 'Fit': 'Car Cupholder Friendly' },
    isFeatured: false,
  },

  // --- FITNESS & SPORTS (9 Products) ---
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    categoryName: 'Fitness & Sports',
    subcategory: 'Strength Training',
    brand: 'Bowflex',
    price: 429.00,
    discount: 10,
    description: 'Replaces 15 sets of weights with a single dial system. Adjusts from 5 to 52.5 lbs in 2.5-lb increments for a full body resistance workout at home.',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    tags: ['fitness', 'dumbbells', 'weights', 'gym', 'strength', 'home-workout'],
    specifications: { 'Weight Range': '5 to 52.5 lbs per dumbbell', 'Adjustment': 'Turn-dial mechanism' },
    isFeatured: true,
  },
  {
    name: 'Garmin Forerunner 265 GPS Running Smartwatch',
    categoryName: 'Fitness & Sports',
    subcategory: 'Fitness Trackers',
    brand: 'Garmin',
    price: 449.99,
    discount: 5,
    description: 'Brilliant 1.3" AMOLED touchscreen with morning report, HRV status, training readiness score, and multi-band GPS with up to 13 days of battery life.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 25,
    tags: ['smartwatch', 'garmin', 'running', 'fitness-tracker', 'gps', 'health'],
    specifications: { 'Screen': '1.3" AMOLED', 'Battery': '13 Days in Smartwatch Mode', 'Water Rating': '5 ATM' },
    isFeatured: true,
  },
  {
    name: 'Manduka PRO Yoga and Pilates Mat 6mm',
    categoryName: 'Fitness & Sports',
    subcategory: 'Yoga',
    brand: 'Manduka',
    price: 138.00,
    discount: 0,
    description: 'The ultra-dense, non-slip 6mm high-performance yoga mat favored by yoga instructors worldwide. Guaranteed for a lifetime of rigorous practice.',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['yoga', 'pilates', 'mat', 'manduka', 'fitness', 'wellness'],
    specifications: { 'Thickness': '6mm High Density', 'Length': '71 Inches', 'Material': 'OEKO-TEX Certified PVC' },
    isFeatured: false,
  },
  {
    name: 'Theragun Pro 5th Gen Percussive Massage Gun',
    categoryName: 'Fitness & Sports',
    subcategory: 'Recovery',
    brand: 'Therabody',
    price: 599.00,
    discount: 10,
    description: 'Smarter and quieter than ever, the commercial-grade deep muscle treatment massage gun with patented triangular handle and OLED visual display.',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    tags: ['massage-gun', 'recovery', 'theragun', 'fitness', 'wellness', 'athlete'],
    specifications: { 'Amplitude': '16mm Depth', 'Stall Force': '60 lbs', 'Speed': '1750-2400 PPM' },
    isFeatured: true,
  },
  {
    name: 'Optimum Nutrition Gold Standard 100% Whey Protein (5 lb)',
    categoryName: 'Fitness & Sports',
    subcategory: 'Nutrition',
    brand: 'Optimum Nutrition',
    price: 79.99,
    discount: 10,
    description: '24g of blended protein consisting of whey protein isolate, whey protein concentrate, and whey peptides to support muscle recovery and growth.',
    images: [
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    tags: ['protein', 'supplements', 'nutrition', 'fitness', 'bodybuilding'],
    specifications: { 'Protein per Serving': '24g', 'BCAAs': '5.5g', 'Flavors': 'Double Rich Chocolate' },
    isFeatured: false,
  },
  {
    name: 'Hydro Flask 32 oz Wide Mouth with Straw Lid',
    categoryName: 'Fitness & Sports',
    subcategory: 'Accessories',
    brand: 'Hydro Flask',
    price: 44.95,
    discount: 5,
    description: 'TempShield double-wall vacuum insulation keeps cold beverages ice cold for up to 24 hours. Durable pro-grade stainless steel construction.',
    images: [
      'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    tags: ['water-bottle', 'hydro-flask', 'hydration', 'fitness', 'outdoor'],
    specifications: { 'Capacity': '32 oz (946 ml)', 'Material': '18/8 Pro-Grade Stainless Steel' },
    isFeatured: false,
  },
  {
    name: 'TRX All-in-One Bodyweight Suspension Trainer',
    categoryName: 'Fitness & Sports',
    subcategory: 'Home Gym',
    brand: 'TRX',
    price: 169.95,
    discount: 15,
    description: 'Full-body workout system utilizing gravity and body weight to build lean muscle, burn fat, improve flexibility, and strengthen core stability anywhere.',
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    tags: ['suspension', 'trx', 'calisthenics', 'home-gym', 'fitness'],
    specifications: { 'Anchor': 'Door & Suspension Anchor included', 'Weight Rating': 'Up to 350 lbs' },
    isFeatured: false,
  },
  {
    name: 'Fitbit Charge 6 Fitness & Health Tracker',
    categoryName: 'Fitness & Sports',
    subcategory: 'Fitness Trackers',
    brand: 'Fitbit',
    price: 159.95,
    discount: 10,
    description: 'Track workouts in real time with built-in GPS, continuous heart rate monitoring, Google Maps navigation, ECG app, and 7-day battery life.',
    images: [
      'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    tags: ['fitbit', 'smartwatch', 'tracker', 'health', 'running'],
    specifications: { 'Battery': '7 Days', 'Heart Rate': 'Continuous 24/7', 'GPS': 'Built-In' },
    isFeatured: false,
  },
  {
    name: 'Iron Gym Total Upper Body Workout Bar',
    categoryName: 'Fitness & Sports',
    subcategory: 'Strength Training',
    brand: 'Iron Gym',
    price: 39.99,
    discount: 0,
    description: 'Multifunctional doorway pull up bar for chin-ups, push-ups, dips, and sit-ups. Attaches and removes from standard door frames without drilling.',
    images: [
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['pull-up-bar', 'strength', 'home-workout', 'gym', 'calisthenics'],
    specifications: { 'Doorway Width': '24-32 Inches', 'Weight Capacity': '300 lbs' },
    isFeatured: false,
  },

  // --- BOOKS & LEARNING (9 Products) ---
  {
    name: 'Designing Data-Intensive Applications',
    categoryName: 'Books & Learning',
    subcategory: 'Computer Science',
    brand: "O'Reilly Media",
    price: 49.99,
    discount: 10,
    description: 'The definitive guide by Martin Kleppmann exploring architecture, consistency, scalability, replication, partitioning, and batch/stream data systems.',
    images: [
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    tags: ['book', 'programming', 'architecture', 'software-engineering', 'data-systems', 'oreilly'],
    specifications: { 'Author': 'Martin Kleppmann', 'Pages': '616', 'Publisher': "O'Reilly Media", 'Language': 'English' },
    isFeatured: true,
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    categoryName: 'Books & Learning',
    subcategory: 'Computer Science',
    brand: 'Prentice Hall',
    price: 44.50,
    discount: 12,
    description: 'Legendary software expert Robert C. Martin presents a revolutionary paradigm with best practices for writing clean, maintainable, readable code.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    tags: ['book', 'clean-code', 'software-engineering', 'refactoring', 'programming'],
    specifications: { 'Author': 'Robert C. Martin', 'Pages': '464', 'Format': 'Paperback' },
    isFeatured: true,
  },
  {
    name: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    categoryName: 'Books & Learning',
    subcategory: 'Artificial Intelligence',
    brand: "O'Reilly Media",
    price: 64.99,
    discount: 15,
    description: 'By Aurélien Géron. A concrete understanding of concepts and tools for building intelligent systems, neural networks, transformers, and deep learning models.',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    tags: ['book', 'machine-learning', 'ai', 'scikit-learn', 'deep-learning', 'python'],
    specifications: { 'Author': 'Aurélien Géron', 'Pages': '856', 'Edition': '3rd Edition' },
    isFeatured: true,
  },
  {
    name: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    categoryName: 'Books & Learning',
    subcategory: 'Self-Help',
    brand: 'Penguin',
    price: 27.00,
    discount: 20,
    description: 'No matter your goals, Atomic Habits by James Clear offers a proven framework for improving every day with small changes that lead to remarkable results.',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 65,
    tags: ['book', 'habits', 'productivity', 'psychology', 'self-help', 'bestseller'],
    specifications: { 'Author': 'James Clear', 'Pages': '320', 'Cover': 'Hardcover' },
    isFeatured: true,
  },
  {
    name: 'The Psychology of Money: Timeless Lessons on Wealth',
    categoryName: 'Books & Learning',
    subcategory: 'Finance',
    brand: 'Harriman House',
    price: 19.99,
    discount: 10,
    description: 'Morgan Housel shares 19 short stories exploring the strange ways people think about money, greed, happiness, and investing decisions.',
    images: [
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    tags: ['book', 'finance', 'investing', 'psychology', 'wealth'],
    specifications: { 'Author': 'Morgan Housel', 'Pages': '256', 'Language': 'English' },
    isFeatured: false,
  },
  {
    name: 'Deep Work: Rules for Focused Success in a Distracted World',
    categoryName: 'Books & Learning',
    subcategory: 'Productivity',
    brand: 'Grand Central',
    price: 28.00,
    discount: 15,
    description: 'Cal Newport argues that the ability to focus without distraction is becoming increasingly rare and vastly more valuable in the modern knowledge economy.',
    images: [
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['book', 'productivity', 'deep-work', 'career', 'focus'],
    specifications: { 'Author': 'Cal Newport', 'Pages': '304', 'Cover': 'Paperback' },
    isFeatured: false,
  },
  {
    name: 'System Design Interview – An Insider’s Guide (Volume 1)',
    categoryName: 'Books & Learning',
    subcategory: 'Computer Science',
    brand: 'ByteDance Press',
    price: 39.99,
    discount: 5,
    description: 'By Alex Xu. Clear diagrams and step-by-step walkthroughs of real-world system design questions: rate limiters, web crawlers, chat apps, and YouTube scale.',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    tags: ['book', 'system-design', 'interview', 'software-engineering', 'distributed-systems'],
    specifications: { 'Author': 'Alex Xu', 'Pages': '300', 'Topic': 'System Architecture' },
    isFeatured: false,
  },
  {
    name: 'Introduction to Algorithms (CLRS 4th Edition)',
    categoryName: 'Books & Learning',
    subcategory: 'Academic',
    brand: 'MIT Press',
    price: 99.99,
    discount: 10,
    description: 'Comprehensive textbook by Cormen, Leiserson, Rivest, and Stein covering sorting, data structures, graph algorithms, dynamic programming, and complexity.',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    tags: ['book', 'algorithms', 'cs', 'data-structures', 'mit', 'academic'],
    specifications: { 'Pages': '1312', 'Publisher': 'The MIT Press', 'Cover': 'Hardcover' },
    isFeatured: false,
  },
  {
    name: 'Zero to One: Notes on Startups, or How to Build the Future',
    categoryName: 'Books & Learning',
    subcategory: 'Business',
    brand: 'Crown Business',
    price: 22.50,
    discount: 10,
    description: 'Peter Thiel shows how we can still find singular ways to create new things and escape competition through monopoly innovation and technology.',
    images: [
      'https://images.unsplash.com/photo-1507842229451-7f01be7a50d2?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    tags: ['book', 'startups', 'business', 'entrepreneurship', 'innovation'],
    specifications: { 'Author': 'Peter Thiel & Blake Masters', 'Pages': '224', 'Cover': 'Hardcover' },
    isFeatured: false,
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intellicart';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB: ${mongoUri}`);

    // Clear existing collections cleanly
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Interaction.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing database records.');

    // 1. Seed Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Inserted ${createdCategories.length} categories.`);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat;
    });

    // 2. Seed Users
    const usersData = [
      {
        name: 'Administrator',
        email: 'admin@intellicart.com',
        password: 'admin123',
        role: 'ADMIN',
        phone: '+91 98765 43210',
        address: { street: '123 Tech Park Blvd', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', country: 'India' },
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.tech@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98765 11111',
        address: { street: '45 Silicon Valley St', city: 'Bengaluru', state: 'Karnataka', postalCode: '560100', country: 'India' },
      },
      {
        name: 'Priya Patel',
        email: 'priya.fashion@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98765 22222',
        address: { street: '12 Marine Drive', city: 'Mumbai', state: 'Maharashtra', postalCode: '400020', country: 'India' },
      },
      {
        name: 'Anita Roy',
        email: 'anita.fit@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98765 33333',
        address: { street: '78 Park Street', city: 'Kolkata', state: 'West Bengal', postalCode: '700016', country: 'India' },
      },
      {
        name: 'Vikram Mehta',
        email: 'vikram.books@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98765 44444',
        address: { street: '9 Connaught Place', city: 'New Delhi', state: 'Delhi', postalCode: '110001', country: 'India' },
      },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const userDoc = new User(u);
      await userDoc.save();
      createdUsers.push(userDoc);
    }
    console.log(`[Seed] Inserted ${createdUsers.length} users with hashed credentials.`);

    // 3. Seed Products
    const mappedProducts = productsData.map((p) => {
      const cat = categoryMap[p.categoryName];
      return {
        ...p,
        category: cat._id,
      };
    });

    const createdProducts = [];
    for (const p of mappedProducts) {
      const prod = new Product(p);
      await prod.save();
      createdProducts.push(prod);
    }
    console.log(`[Seed] Inserted ${createdProducts.length} rich product documents.`);

    // Update item counts in categories
    for (const cat of createdCategories) {
      const count = await Product.countDocuments({ category: cat._id });
      cat.itemCount = count;
      await cat.save();
    }

    // Helper map of products by name
    const productMap = {};
    createdProducts.forEach((p) => {
      productMap[p.name] = p;
    });

    const [adminUser, rahulUser, priyaUser, anitaUser, vikramUser] = createdUsers;

    // 4. Seed Carts and Wishlists
    // Rahul has MX Master 3S in cart
    const mxMouse = productMap['Logitech MX Master 3S Wireless Performance Mouse'];
    const macbook = productMap['Apple MacBook Pro 14" M3 Pro'];
    const sonyHeadphones = productMap['Sony WH-1000XM5 Wireless Noise-Canceling Headphones'];
    const boseHeadphones = productMap['Bose QuietComfort Ultra Headphones'];
    const keychron = productMap['Keychron Q1 Pro Wireless Custom Mechanical Keyboard'];

    await Cart.create({
      user: rahulUser._id,
      items: [{ product: mxMouse._id, quantity: 1, price: mxMouse.finalPrice }],
    });

    await Wishlist.create({
      user: rahulUser._id,
      products: [keychron._id, boseHeadphones._id],
    });

    // Priya (Fashion) Cart & Wishlist
    const nikeShoes = productMap['Nike Air Max 270 React Premium Sneakers'];
    const mkBag = productMap['Michael Kors Jet Set Travel Tote Bag'];
    const fossilWatch = productMap['Fossil Grant Chronograph Leather Watch'];
    await Cart.create({
      user: priyaUser._id,
      items: [{ product: mkBag._id, quantity: 1, price: mkBag.finalPrice }],
    });
    await Wishlist.create({
      user: priyaUser._id,
      products: [fossilWatch._id, nikeShoes._id],
    });

    // 5. Seed Orders (Demonstrating verified purchase status)
    // Order 1: Rahul purchased Apple MacBook Pro and Sony Headphones
    const order1 = await Order.create({
      user: rahulUser._id,
      orderItems: [
        {
          product: macbook._id,
          name: macbook.name,
          quantity: 1,
          price: macbook.finalPrice,
          image: macbook.images[0],
        },
        {
          product: sonyHeadphones._id,
          name: sonyHeadphones.name,
          quantity: 1,
          price: sonyHeadphones.finalPrice,
          image: sonyHeadphones.images[0],
        },
      ],
      shippingAddress: rahulUser.address,
      paymentMethod: 'CARD',
      paymentResult: { id: 'SIM_TXN_TECH_9921', status: 'COMPLETED', updateTime: new Date().toISOString() },
      itemsPrice: macbook.finalPrice + sonyHeadphones.finalPrice,
      taxPrice: Math.round((macbook.finalPrice + sonyHeadphones.finalPrice) * 0.18 * 100) / 100,
      shippingPrice: 0,
      totalPrice: Math.round((macbook.finalPrice + sonyHeadphones.finalPrice) * 1.18 * 100) / 100,
      isPaid: true,
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      orderStatus: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    // Order 2: Priya purchased Nike Shoes and Fossil Watch
    const order2 = await Order.create({
      user: priyaUser._id,
      orderItems: [
        {
          product: nikeShoes._id,
          name: nikeShoes.name,
          quantity: 1,
          price: nikeShoes.finalPrice,
          image: nikeShoes.images[0],
        },
        {
          product: fossilWatch._id,
          name: fossilWatch.name,
          quantity: 1,
          price: fossilWatch.finalPrice,
          image: fossilWatch.images[0],
        },
      ],
      shippingAddress: priyaUser.address,
      paymentMethod: 'UPI',
      paymentResult: { id: 'SIM_TXN_FASH_4412', status: 'COMPLETED', updateTime: new Date().toISOString() },
      itemsPrice: nikeShoes.finalPrice + fossilWatch.finalPrice,
      taxPrice: Math.round((nikeShoes.finalPrice + fossilWatch.finalPrice) * 0.12 * 100) / 100,
      shippingPrice: 0,
      totalPrice: Math.round((nikeShoes.finalPrice + fossilWatch.finalPrice) * 1.12 * 100) / 100,
      isPaid: true,
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      orderStatus: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Order 3: Anita (Fitness) purchased Dumbbells & Garmin Watch
    const bowflex = productMap['Bowflex SelectTech 552 Adjustable Dumbbells (Pair)'];
    const garmin = productMap['Garmin Forerunner 265 GPS Running Smartwatch'];
    await Order.create({
      user: anitaUser._id,
      orderItems: [
        {
          product: bowflex._id,
          name: bowflex.name,
          quantity: 1,
          price: bowflex.finalPrice,
          image: bowflex.images[0],
        },
        {
          product: garmin._id,
          name: garmin.name,
          quantity: 1,
          price: garmin.finalPrice,
          image: garmin.images[0],
        },
      ],
      shippingAddress: anitaUser.address,
      paymentMethod: 'COD',
      itemsPrice: bowflex.finalPrice + garmin.finalPrice,
      taxPrice: Math.round((bowflex.finalPrice + garmin.finalPrice) * 0.18 * 100) / 100,
      shippingPrice: 15,
      totalPrice: Math.round((bowflex.finalPrice + garmin.finalPrice) * 1.18 * 100) / 100 + 15,
      isPaid: true,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      orderStatus: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Created realistic historical orders.');

    // 6. Seed Reviews (Verified purchase reviews)
    const reviews = [
      {
        product: macbook._id,
        user: rahulUser._id,
        userName: rahulUser.name,
        rating: 5,
        title: 'Unbelievable power and battery life for coding',
        comment: 'Compilation times dropped by more than 50% compared to my older Intel machine. The Liquid Retina XDR screen is razor sharp.',
        isVerifiedPurchase: true,
      },
      {
        product: sonyHeadphones._id,
        user: rahulUser._id,
        userName: rahulUser.name,
        rating: 5,
        title: 'The best noise cancellation for open offices',
        comment: 'Completely blocks out ambient office hum. The mic quality during Zoom calls is crystal clear.',
        isVerifiedPurchase: true,
      },
      {
        product: nikeShoes._id,
        user: priyaUser._id,
        userName: priyaUser.name,
        rating: 5,
        title: 'Super stylish and comfortable!',
        comment: 'Walked over 15,000 steps on vacation with zero foot fatigue. Absolutely love the silhouette and cushioning.',
        isVerifiedPurchase: true,
      },
      {
        product: fossilWatch._id,
        user: priyaUser._id,
        userName: priyaUser.name,
        rating: 4,
        title: 'Timeless vintage aesthetic',
        comment: 'Leather strap feels authentic and aged gracefully. Looks much more expensive than it actually is.',
        isVerifiedPurchase: true,
      },
      {
        product: bowflex._id,
        user: anitaUser._id,
        userName: anitaUser.name,
        rating: 5,
        title: 'Game changer for home fitness',
        comment: 'Space saving design is a marvel. Changing weights takes literally 2 seconds with the smooth dials.',
        isVerifiedPurchase: true,
      },
      {
        product: garmin._id,
        user: anitaUser._id,
        userName: anitaUser.name,
        rating: 5,
        title: 'Unbeatable metrics for runners',
        comment: 'The AMOLED screen pops under direct sunlight and training readiness score keeps me from overtraining.',
        isVerifiedPurchase: true,
      },
    ];

    for (const r of reviews) {
      await Review.create(r);
      // Update product rating
      const prod = createdProducts.find((p) => p._id.equals(r.product));
      if (prod) {
        prod.rating = r.rating;
        prod.numReviews = (prod.numReviews || 0) + 1;
        await prod.save();
      }
    }
    console.log(`[Seed] Seeded verified user reviews and updated ratings.`);

    // 7. Seed Diverse Realistic Interactions for AI Engine
    // User A (Rahul) -> Tech lover
    // User B (Priya) -> Fashion & Luxury
    // User C (Anita) -> Fitness & Health
    // User D (Vikram) -> Books & Knowledge
    const interactionsData = [
      // Rahul (Tech)
      { userId: rahulUser._id, productId: macbook._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: rahulUser._id, productId: macbook._id, action: 'ADD_TO_CART', weight: 4 },
      { userId: rahulUser._id, productId: macbook._id, action: 'PURCHASE', weight: 5 },
      { userId: rahulUser._id, productId: sonyHeadphones._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: rahulUser._id, productId: sonyHeadphones._id, action: 'PURCHASE', weight: 5 },
      { userId: rahulUser._id, productId: boseHeadphones._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: rahulUser._id, productId: boseHeadphones._id, action: 'WISHLIST', weight: 3 },
      { userId: rahulUser._id, productId: mxMouse._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: rahulUser._id, productId: mxMouse._id, action: 'ADD_TO_CART', weight: 4 },
      { userId: rahulUser._id, productId: keychron._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: rahulUser._id, productId: keychron._id, action: 'WISHLIST', weight: 3 },
      { userId: rahulUser._id, action: 'SEARCH', metadata: { query: 'wireless mechanical keyboard' }, weight: 2 },
      { userId: rahulUser._id, action: 'CATEGORY_VIEW', metadata: { categoryName: 'Electronics' }, weight: 1.5 },

      // Priya (Fashion)
      { userId: priyaUser._id, productId: nikeShoes._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: priyaUser._id, productId: nikeShoes._id, action: 'PURCHASE', weight: 5 },
      { userId: priyaUser._id, productId: fossilWatch._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: priyaUser._id, productId: fossilWatch._id, action: 'PURCHASE', weight: 5 },
      { userId: priyaUser._id, productId: mkBag._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: priyaUser._id, productId: mkBag._id, action: 'ADD_TO_CART', weight: 4 },
      { userId: priyaUser._id, productId: productMap["Levi's Classic Trucker Denim Jacket"]._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: priyaUser._id, productId: productMap['Ray-Ban Classic Polarized Aviator Sunglasses']._id, action: 'WISHLIST', weight: 3 },
      { userId: priyaUser._id, action: 'SEARCH', metadata: { query: 'leather handbags' }, weight: 2 },
      { userId: priyaUser._id, action: 'CATEGORY_VIEW', metadata: { categoryName: 'Fashion' }, weight: 1.5 },

      // Anita (Fitness)
      { userId: anitaUser._id, productId: bowflex._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: anitaUser._id, productId: bowflex._id, action: 'PURCHASE', weight: 5 },
      { userId: anitaUser._id, productId: garmin._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: anitaUser._id, productId: garmin._id, action: 'PURCHASE', weight: 5 },
      { userId: anitaUser._id, productId: productMap['Manduka PRO Yoga and Pilates Mat 6mm']._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: anitaUser._id, productId: productMap['Theragun Pro 5th Gen Percussive Massage Gun']._id, action: 'WISHLIST', weight: 3 },
      { userId: anitaUser._id, productId: productMap['Optimum Nutrition Gold Standard 100% Whey Protein (5 lb)']._id, action: 'ADD_TO_CART', weight: 4 },
      { userId: anitaUser._id, action: 'CATEGORY_VIEW', metadata: { categoryName: 'Fitness & Sports' }, weight: 1.5 },

      // Vikram (Books & Learning)
      { userId: vikramUser._id, productId: productMap['Designing Data-Intensive Applications']._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: vikramUser._id, productId: productMap['Designing Data-Intensive Applications']._id, action: 'PURCHASE', weight: 5 },
      { userId: vikramUser._id, productId: productMap['Clean Code: A Handbook of Agile Software Craftsmanship']._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: vikramUser._id, productId: productMap['Atomic Habits: An Easy & Proven Way to Build Good Habits']._id, action: 'PURCHASE', weight: 5 },
      { userId: vikramUser._id, productId: productMap['Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow']._id, action: 'WISHLIST', weight: 3 },
      { userId: vikramUser._id, productId: productMap['Kindle Paperwhite 16GB (6.8" Glare-Free)']._id, action: 'PRODUCT_VIEW', weight: 1 },
      { userId: vikramUser._id, action: 'SEARCH', metadata: { query: 'system design' }, weight: 2 },
      { userId: vikramUser._id, action: 'CATEGORY_VIEW', metadata: { categoryName: 'Books & Learning' }, weight: 1.5 },
    ];

    await Interaction.insertMany(interactionsData);
    console.log(`[Seed] Seeded ${interactionsData.length} behavioral interaction events across diverse personas.`);

    console.log('\n=======================================================');
    console.log('✅ INTELLICART DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('Admin Account: admin@intellicart.com / admin123');
    console.log('Tech Persona:  rahul.tech@example.com / password123');
    console.log('Fashion Persona: priya.fashion@example.com / password123');
    console.log('Fitness Persona: anita.fit@example.com / password123');
    console.log('Books Persona: vikram.books@example.com / password123');
    console.log('=======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
}

seedDatabase();
