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

// Import the rich datasets defined in seed.js
// Since seed.js has them as inline variables, we can extract or execute them safely.
const fs = require('fs');

async function runAdditiveSeed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intellicart';
  console.log(`[Additive Seed] Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  try {
    console.log('[Additive Seed] Starting non-destructive, additive population...');

    // Load definitions by reading seed.js source
    const seedSource = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf8');

    // Extract categoriesData and productsData using Function constructor in isolated scope
    const extractFn = new Function(`
      ${seedSource.substring(seedSource.indexOf('const categoriesData ='), seedSource.indexOf('async function seedDatabase()'))}
      return { categoriesData, productsData };
    `);

    const { categoriesData, productsData } = extractFn();

    // 1. Ensure Categories exist without removing existing ones
    const categoryMap = {};
    let insertedCatCount = 0;

    for (const catData of categoriesData) {
      let existingCat = await Category.findOne({
        $or: [{ slug: catData.slug }, { name: catData.name }],
      });

      if (!existingCat) {
        existingCat = await Category.create(catData);
        insertedCatCount++;
      }
      categoryMap[catData.name] = existingCat;
    }
    console.log(`[Additive Seed] Categories ensured. Inserted ${insertedCatCount} new categories.`);

    // 2. Ensure Products exist without removing existing ones
    const productMap = {};
    let insertedProdCount = 0;

    for (const p of productsData) {
      let existingProd = await Product.findOne({ name: p.name });

      if (!existingProd) {
        const cat = categoryMap[p.categoryName];
        if (!cat) {
          console.warn(`Category not found for product: ${p.name} (${p.categoryName})`);
          continue;
        }

        const finalPrice = p.discount
          ? Math.round((p.price - (p.price * p.discount) / 100) * 100) / 100
          : p.price;

        const baseSlug = p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        existingProd = await Product.create({
          ...p,
          category: cat._id,
          finalPrice,
          slug: baseSlug,
          rating: 0,
          numReviews: 0,
        });
        insertedProdCount++;
      }
      productMap[p.name] = existingProd;
    }
    console.log(`[Additive Seed] Products ensured. Inserted ${insertedProdCount} new curated products.`);

    // 3. Ensure Demo Personas
    const usersData = [
      {
        name: 'IntelliCart Administrator',
        email: 'admin@intellicart.com',
        password: 'admin123',
        role: 'ADMIN',
        phone: '+1 800-555-0199',
        address: {
          fullName: 'IntelliCart Administrator',
          phone: '+1 800-555-0199',
          address: '100 Silicon Way, Tech Plaza, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'USA',
        },
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.tech@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98765 43210',
        address: {
          fullName: 'Rahul Sharma',
          phone: '+91 98765 43210',
          address: '42, Indiranagar 100ft Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya.fashion@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 98111 22334',
        address: {
          fullName: 'Priya Patel',
          phone: '+91 98111 22334',
          address: 'Flat 302, Sea Green Apartments, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
        },
      },
      {
        name: 'Anita Roy',
        email: 'anita.fit@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 97222 33445',
        address: {
          fullName: 'Anita Roy',
          phone: '+91 97222 33445',
          address: 'B-12, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201309',
          country: 'India',
        },
      },
      {
        name: 'Vikram Mehta',
        email: 'vikram.books@example.com',
        password: 'password123',
        role: 'USER',
        phone: '+91 96333 44556',
        address: {
          fullName: 'Vikram Mehta',
          phone: '+91 96333 44556',
          address: '78, Gariahat Road',
          city: 'Kolkata',
          state: 'West Bengal',
          postalCode: '700019',
          country: 'India',
        },
      },
    ];

    const userMap = {};
    let insertedUserCount = 0;
    for (const u of usersData) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = await User.create(u);
        insertedUserCount++;
      }
      userMap[u.email] = existingUser;
    }
    console.log(`[Additive Seed] Users ensured. Inserted ${insertedUserCount} test personas.`);

    // 4. Seed verified reviews for realistic rating displays if none exist
    const macbook = productMap['Apple MacBook Pro 14" M3 Pro'];
    const sonyHeadphones = productMap['Sony WH-1000XM5 Wireless Noise-Canceling Headphones'];
    const nikeShoes = productMap['Nike Air Zoom Pegasus 40 Running Shoes'];
    const fossilWatch = productMap['Fossil Grant Chronograph Light Brown Leather Watch'];
    const bowflex = productMap['Bowflex SelectTech 552 Adjustable Dumbbells (Pair)'];
    const garmin = productMap['Garmin Forerunner 265 GPS Running Smartwatch'];

    const rahulUser = userMap['rahul.tech@example.com'];
    const priyaUser = userMap['priya.fashion@example.com'];
    const anitaUser = userMap['anita.fit@example.com'];
    const vikramUser = userMap['vikram.books@example.com'];

    const reviews = [
      macbook && rahulUser && {
        product: macbook._id,
        user: rahulUser._id,
        userName: rahulUser.name,
        rating: 5,
        title: 'Unbelievable power and battery life for coding',
        comment: 'Compilation times dropped by more than 50% compared to my older Intel machine. The Liquid Retina XDR screen is razor sharp.',
        isVerifiedPurchase: true,
      },
      sonyHeadphones && rahulUser && {
        product: sonyHeadphones._id,
        user: rahulUser._id,
        userName: rahulUser.name,
        rating: 5,
        title: 'The best noise cancellation for open offices',
        comment: 'Completely blocks out ambient office hum. The mic quality during Zoom calls is crystal clear.',
        isVerifiedPurchase: true,
      },
      nikeShoes && priyaUser && {
        product: nikeShoes._id,
        user: priyaUser._id,
        userName: priyaUser.name,
        rating: 5,
        title: 'Super stylish and comfortable!',
        comment: 'Walked over 15,000 steps on vacation with zero foot fatigue. Absolutely love the silhouette and cushioning.',
        isVerifiedPurchase: true,
      },
      fossilWatch && priyaUser && {
        product: fossilWatch._id,
        user: priyaUser._id,
        userName: priyaUser.name,
        rating: 4,
        title: 'Timeless vintage aesthetic',
        comment: 'Leather strap feels authentic and aged gracefully. Looks much more expensive than it actually is.',
        isVerifiedPurchase: true,
      },
      bowflex && anitaUser && {
        product: bowflex._id,
        user: anitaUser._id,
        userName: anitaUser.name,
        rating: 5,
        title: 'Game changer for home fitness',
        comment: 'Space saving design is a marvel. Changing weights takes literally 2 seconds with the smooth dials.',
        isVerifiedPurchase: true,
      },
      garmin && anitaUser && {
        product: garmin._id,
        user: anitaUser._id,
        userName: anitaUser.name,
        rating: 5,
        title: 'Unbeatable metrics for runners',
        comment: 'The AMOLED screen pops under direct sunlight and training readiness score keeps me from overtraining.',
        isVerifiedPurchase: true,
      },
    ].filter(Boolean);

    for (const r of reviews) {
      const existingReview = await Review.findOne({ product: r.product, user: r.user });
      if (!existingReview) {
        await Review.create(r);
        const prod = await Product.findById(r.product);
        if (prod) {
          prod.rating = r.rating;
          prod.numReviews = (prod.numReviews || 0) + 1;
          await prod.save();
        }
      }
    }
    console.log('[Additive Seed] Verified reviews verified and ratings synced.');

    // 5. Seed Interactions for AI Model if none exist for Rahul/Priya/Anita/Vikram
    if (rahulUser && macbook && sonyHeadphones) {
      const existingInteractionsCount = await Interaction.countDocuments({ userId: rahulUser._id });
      if (existingInteractionsCount === 0) {
        const interactionsData = [
          // Rahul (Tech)
          { userId: rahulUser._id, productId: macbook._id, action: 'PRODUCT_VIEW', weight: 1 },
          { userId: rahulUser._id, productId: macbook._id, action: 'ADD_TO_CART', weight: 4 },
          { userId: rahulUser._id, productId: macbook._id, action: 'PURCHASE', weight: 5 },
          { userId: rahulUser._id, productId: sonyHeadphones._id, action: 'PRODUCT_VIEW', weight: 1 },
          { userId: rahulUser._id, productId: sonyHeadphones._id, action: 'PURCHASE', weight: 5 },
          // Priya (Fashion)
          priyaUser && nikeShoes && { userId: priyaUser._id, productId: nikeShoes._id, action: 'PRODUCT_VIEW', weight: 1 },
          priyaUser && nikeShoes && { userId: priyaUser._id, productId: nikeShoes._id, action: 'PURCHASE', weight: 5 },
          priyaUser && fossilWatch && { userId: priyaUser._id, productId: fossilWatch._id, action: 'PRODUCT_VIEW', weight: 1 },
          priyaUser && fossilWatch && { userId: priyaUser._id, productId: fossilWatch._id, action: 'PURCHASE', weight: 5 },
          // Anita (Fitness)
          anitaUser && bowflex && { userId: anitaUser._id, productId: bowflex._id, action: 'PRODUCT_VIEW', weight: 1 },
          anitaUser && bowflex && { userId: anitaUser._id, productId: bowflex._id, action: 'PURCHASE', weight: 5 },
          anitaUser && garmin && { userId: anitaUser._id, productId: garmin._id, action: 'PRODUCT_VIEW', weight: 1 },
          anitaUser && garmin && { userId: anitaUser._id, productId: garmin._id, action: 'PURCHASE', weight: 5 },
        ].filter(Boolean);

        await Interaction.insertMany(interactionsData);
        console.log(`[Additive Seed] Seeded ${interactionsData.length} interaction records for recommendation engine.`);
      }
    }

    const totalProductsCount = await Product.countDocuments();
    console.log(`\n======================================================`);
    console.log(`✅ ADDITIVE SEED COMPLETED! Total Products in DB: ${totalProductsCount}`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error(`[Additive Seed Error]:`, err);
    process.exit(1);
  }
}

runAdditiveSeed();
