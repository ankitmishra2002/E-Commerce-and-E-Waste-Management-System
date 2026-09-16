import { db } from './config/db.js';
import { users, vendorProfiles, categories, products, reviews, complaints, carts } from './models/schema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  console.log("Starting database seeding process...");

  if (!db) {
    console.error("Database connection is not active. Please define DATABASE_URL in .env!");
    process.exit(1);
  }

  try {
    // 1. Clear existing data (optional, but clean for seeding)
    console.log("Wiping existing records...");
    await db.delete(complaints);
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(vendorProfiles);
    await db.delete(carts);
    await db.delete(users);

    console.log("Inserting admin user...");
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const [adminUser] = await db.insert(users).values({
      name: 'SparkIT Admin',
      email: 'admin@sparkit.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true
    }).returning();

    console.log("Inserting vendor users & profiles...");
    const vendorPassword = await bcrypt.hash('Vendor@123', 12);
    
    const [vendor1] = await db.insert(users).values({
      name: 'Alpha Tech Vendor',
      email: 'vendor1@sparkit.com',
      password: vendorPassword,
      role: 'VENDOR',
      isActive: true
    }).returning();

    await db.insert(vendorProfiles).values({
      userId: vendor1.id,
      businessName: 'Alpha Electronics Ltd',
      businessDescription: 'Wholesale distributor of premium smart gadgets.',
      gstNumber: '29AAAAA1111A1Z1',
      isVerified: true
    });

    const [vendor2] = await db.insert(users).values({
      name: 'Trendy Styles VENDOR',
      email: 'vendor2@sparkit.com',
      password: vendorPassword,
      role: 'VENDOR',
      isActive: true
    }).returning();

    await db.insert(vendorProfiles).values({
      userId: vendor2.id,
      businessName: 'Trendy Fashion Hub',
      businessDescription: 'Trendy wear and home essentials.',
      gstNumber: '29BBBBB2222B2Z2',
      isVerified: true
    });

    console.log("Inserting regular users...");
    const userPassword = await bcrypt.hash('User@123', 12);
    const customerList = [];
    
    for (let i = 1; i <= 5; i++) {
      const [cust] = await db.insert(users).values({
        name: `Customer User ${i}`,
        email: `user${i}@sparkit.com`,
        password: userPassword,
        role: 'USER',
        isActive: true
      }).returning();
      
      // Auto-create cart for regular user
      await db.insert(carts).values({
        userId: cust.id
      });
      
      customerList.push(cust);
    }

    console.log("Inserting categories...");
    const [catElectronics] = await db.insert(categories).values({
      name: 'Electronics',
      slug: 'electronics'
    }).returning();

    const [catFashion] = await db.insert(categories).values({
      name: 'Fashion',
      slug: 'fashion'
    }).returning();

    const [catHome] = await db.insert(categories).values({
      name: 'Home & Kitchen',
      slug: 'home-kitchen'
    }).returning();

    console.log("Inserting products...");
    const [prod1] = await db.insert(products).values({
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      name: 'Apex Wireless Noise Cancelling Headphones',
      slug: 'apex-wireless-headphones',
      description: 'Experience pure acoustic bliss with active noise cancellation and 40 hours battery life.',
      price: '199.99',
      compareAtPrice: '249.99',
      stock: 50,
      sku: 'APX-HD-100',
      isActive: true,
      returnWindowDays: 10
    }).returning();

    const [prod2] = await db.insert(products).values({
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      name: 'SmartFit Fitness Tracker Watch',
      slug: 'smartfit-fitness-tracker',
      description: 'Track your heart rate, workouts, steps, and sleep with this sleek waterproof watch.',
      price: '49.99',
      compareAtPrice: '79.99',
      stock: 120,
      sku: 'SFT-WT-200',
      isActive: true,
      returnWindowDays: 7
    }).returning();

    const [prod3] = await db.insert(products).values({
      vendorId: vendor2.id,
      categoryId: catFashion.id,
      name: 'Classic Leather Jacket',
      slug: 'classic-leather-jacket',
      description: 'Handcrafted premium leather jacket with soft lining, styled for a modern classic fit.',
      price: '129.99',
      compareAtPrice: '179.99',
      stock: 30,
      sku: 'CLS-JK-300',
      isActive: true,
      returnWindowDays: 14
    }).returning();

    const [prod4] = await db.insert(products).values({
      vendorId: vendor2.id,
      categoryId: catFashion.id,
      name: 'Minimalist Canvas Sneaker',
      slug: 'minimalist-canvas-sneakers',
      description: 'Ultralight canvas sneakers designed for maximum comfort and style.',
      price: '39.99',
      stock: 80,
      sku: 'MNM-SN-400',
      isActive: true,
      returnWindowDays: 7
    }).returning();

    const [prod5] = await db.insert(products).values({
      vendorId: vendor2.id,
      categoryId: catHome.id,
      name: 'Culinary Master Chef Knife 8 inch',
      slug: 'chef-knife-8-inch',
      description: 'Razor-sharp high carbon stainless steel kitchen knife for slicing and dicing like a pro.',
      price: '59.99',
      compareAtPrice: '89.99',
      stock: 40,
      sku: 'CLN-KN-500',
      isActive: true,
      returnWindowDays: 15
    }).returning();

    const [prod6] = await db.insert(products).values({
      vendorId: vendor2.id,
      categoryId: catHome.id,
      name: 'Aromatherapy Essential Oil Diffuser',
      slug: 'aromatherapy-oil-diffuser',
      description: 'Ultrasonic cool mist humidifier with 7 color LED lights and auto shut-off function.',
      price: '24.99',
      stock: 150,
      sku: 'ARM-DF-600',
      isActive: true,
      returnWindowDays: 30
    }).returning();

    console.log("Inserting reviews...");
    await db.insert(reviews).values([
      {
        productId: prod1.id,
        userId: customerList[0].id,
        rating: 5,
        title: 'Absolutely worth the price!',
        body: 'Sound quality is superb and noise cancellation blocks out everything on my commute. Best headphones I have ever owned.',
        isVerifiedPurchase: true
      },
      {
        productId: prod3.id,
        userId: customerList[1].id,
        rating: 4,
        title: 'Fits well, leather smells premium',
        body: 'Slightly tight in the shoulders but fits perfectly otherwise. The leather is soft and looks high end.',
        isVerifiedPurchase: true
      }
    ]);

    console.log("Inserting complaint...");
    await db.insert(complaints).values({
      userId: customerList[2].id,
      vendorId: vendor1.id,
      productId: prod2.id,
      subject: 'Watch screen arrived scratched',
      body: 'I received the SmartFit Tracker Watch today, and when opening the package there is a noticeable scratch across the center screen. I would like a replacement.',
      status: 'OPEN'
    });

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seed();
