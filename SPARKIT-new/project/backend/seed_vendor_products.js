import { db } from './config/db.js';
import { users, categories, products, productMedia } from './models/schema.js';
import { eq, and } from 'drizzle-orm';
import cloudinary from './config/cloudinary.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedVendorProducts = async () => {
  console.log("Starting vendor products seeding with Cloudinary uploads...");

  if (!db) {
    console.error("Database connection is not active. Please define DATABASE_URL in .env!");
    process.exit(1);
  }

  try {
    // 1. Find the target vendor
    console.log("Searching for vendor: vendor1@sparkit.com...");
    const [vendor] = await db.select().from(users).where(eq(users.email, 'vendor1@sparkit.com')).limit(1);
    
    if (!vendor) {
      console.error("Vendor vendor1@sparkit.com not found in the database. Please run npm run seed first!");
      process.exit(1);
    }
    console.log(`Found vendor: ${vendor.name} (ID: ${vendor.id})`);

    // 2. Ensure categories exist
    console.log("Ensuring categories exist...");
    const ensureCategory = async (name, slug) => {
      const [existing] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
      if (existing) {
        return existing;
      }
      const [newCat] = await db.insert(categories).values({ name, slug }).returning();
      console.log(`Created category: ${name} (${slug})`);
      return newCat;
    };

    const catMobiles = await ensureCategory('Mobiles', 'mobiles');
    const catAudio = await ensureCategory('Audio', 'audio');
    const catAccessories = await ensureCategory('Computer Accessories', 'computer-accessories');

    // 3. Define the products to seed
    const productsToSeed = [
      {
        name: 'SAMSUNG Galaxy S20 FE 5G (Cloud Mint, 128 GB)',
        description: 'SAMSUNG Galaxy S20 FE 5G in beautiful Cloud Mint color with 128 GB storage and 8 GB RAM. Features a high-refresh-rate AMOLED screen, versatile triple camera setup, and long-lasting battery life with fast charging support.',
        price: '399.99',
        compareAtPrice: '499.99',
        stock: 45,
        sku: 'SAM-S20FE-MINT',
        categoryId: catMobiles.id,
        returnWindowDays: 10,
        images: [
          '../images/mobile/SAMSUNG Galaxy S20 FE 5G (Cloud Mint, 128 GB) (8 GB RAM) 1.webp',
          '../images/mobile/SAMSUNG Galaxy S20 FE 5G (Cloud Mint, 128 GB) (8 GB RAM) 2.webp',
          '../images/mobile/SAMSUNG Galaxy S20 FE 5G (Cloud Mint, 128 GB) (8 GB RAM) 3.webp'
        ]
      },
      {
        name: 'realme GT 5G (Racing Yellow, 256 GB)',
        description: 'Flagship realme GT 5G phone in eye-catching Racing Yellow dual-tone leather design. Features 256 GB storage, massive 12 GB RAM, Snapdragon 888 processor, 120Hz Super AMOLED display, and 65W SuperDart charging.',
        price: '499.99',
        compareAtPrice: '599.99',
        stock: 30,
        sku: 'RLM-GT5G-YELLOW',
        categoryId: catMobiles.id,
        returnWindowDays: 10,
        images: [
          '../images/mobile/realme GT 5G (Racing Yellow, 256 GB) (12 GB RAM) 1.webp',
          '../images/mobile/realme GT 5G (Racing Yellow, 256 GB) (12 GB RAM) 2.webp',
          '../images/mobile/realme GT 5G (Racing Yellow, 256 GB) (12 GB RAM) 3.webp',
          '../images/mobile/realme GT 5G (Racing Yellow, 256 GB) (12 GB RAM) 4.webp'
        ]
      },
      {
        name: 'boAt Airdopes 131 Wireless Earbuds',
        description: 'boAt Airdopes 131 wireless earbuds. Features IWP technology, 13mm drivers for immersive signature sound, Bluetooth v5.0, up to 15 hours playback, and ergonomic design for all-day comfortable listening.',
        price: '29.99',
        compareAtPrice: '49.99',
        stock: 150,
        sku: 'BOAT-AD131-BLUE',
        categoryId: catAudio.id,
        returnWindowDays: 7,
        images: [
          '../images/airpodes/boAt Airdopes 131 1.webp',
          '../images/airpodes/boAt Airdopes 131 2.webp',
          '../images/airpodes/boAt Airdopes 131 3.webp',
          '../images/airpodes/boAt Airdopes 131 4.webp'
        ]
      },
      {
        name: 'ASUS Marshmallow Silent Wireless Mouse',
        description: 'ASUS Marshmallow Silent wireless mouse in Quiet Blue. Features adjustable DPI, multi-mode connectivity (2.4GHz and Bluetooth), silent clicking switches, and a custom solar cover style.',
        price: '19.99',
        compareAtPrice: '29.99',
        stock: 85,
        sku: 'ASU-MARSH-BLUE',
        categoryId: catAccessories.id,
        returnWindowDays: 15,
        images: [
          '../images/mouse/ASUS Marshmallow - Silent, Adj. DPI, Multi-Mode, With Solar Cover Wireless Optical Mouse (2.4GHz Wireless, Bluetooth, Quiet Blue) 1.webp',
          '../images/mouse/ASUS Marshmallow - Silent, Adj. DPI, Multi-Mode, With Solar Cover Wireless Optical Mouse (2.4GHz Wireless, Bluetooth, Quiet Blue) 2.webp',
          '../images/mouse/ASUS Marshmallow - Silent, Adj. DPI, Multi-Mode, With Solar Cover Wireless Optical Mouse (2.4GHz Wireless, Bluetooth, Quiet Blue) 3.webp',
          '../images/mouse/ASUS Marshmallow - Silent, Adj. DPI, Multi-Mode, With Solar Cover Wireless Optical Mouse (2.4GHz Wireless, Bluetooth, Quiet Blue) 4.webp'
        ]
      },
      {
        name: 'HP 250 Wireless Optical Mouse',
        description: 'Reliable HP 250 wireless optical mouse with 2.4GHz wireless connection. Features a contoured, ambidextrous design for everyday comfort and high-precision tracking sensor.',
        price: '14.99',
        compareAtPrice: '19.99',
        stock: 200,
        sku: 'HP-250-MOUSE-BLK',
        categoryId: catAccessories.id,
        returnWindowDays: 15,
        images: [
          '../images/mouse/HP 250 Wireless Optical Mouse (2.4GHz Wireless, Black) 1.webp',
          '../images/mouse/HP 250 Wireless Optical Mouse (2.4GHz Wireless, Black) 2.webp',
          '../images/mouse/HP 250 Wireless Optical Mouse (2.4GHz Wireless, Black) 3.webp',
          '../images/mouse/HP 250 Wireless Optical Mouse (2.4GHz Wireless, Black) 4.webp'
        ]
      }
    ];

    // 4. Seed each product
    for (const prodData of productsToSeed) {
      console.log(`\n--------------------------------------------`);
      console.log(`Processing product: ${prodData.name}`);

      // Check if product already exists. If yes, delete it (which cascades to media)
      const baseSlug = prodData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const [existingProd] = await db.select().from(products).where(eq(products.name, prodData.name)).limit(1);

      if (existingProd) {
        console.log(`Product "${prodData.name}" already exists. Deleting it to refresh...`);
        await db.delete(products).where(eq(products.id, existingProd.id));
      }

      // Generate a unique slug
      let uniqueSlug = baseSlug;
      let suffix = 1;
      while (true) {
        const [existingSlug] = await db.select().from(products).where(eq(products.slug, uniqueSlug)).limit(1);
        if (!existingSlug) break;
        uniqueSlug = `${baseSlug}-${suffix++}`;
      }

      // Insert product
      const [product] = await db.insert(products).values({
        vendorId: vendor.id,
        categoryId: prodData.categoryId,
        name: prodData.name,
        slug: uniqueSlug,
        description: prodData.description,
        price: prodData.price,
        compareAtPrice: prodData.compareAtPrice,
        stock: prodData.stock,
        sku: prodData.sku,
        isActive: true,
        isDeleted: false,
        returnWindowDays: prodData.returnWindowDays
      }).returning();

      console.log(`Inserted product row with ID: ${product.id}`);

      // Upload photos to Cloudinary
      const mediaRecords = [];
      let position = 0;
      for (const imageRelPath of prodData.images) {
        const absoluteImagePath = path.resolve(__dirname, imageRelPath);
        
        if (!fs.existsSync(absoluteImagePath)) {
          console.warn(`WARNING: File does not exist at ${absoluteImagePath}. Skipping this image.`);
          continue;
        }

        console.log(`Uploading to Cloudinary: ${path.basename(absoluteImagePath)}...`);
        try {
          const uploadRes = await cloudinary.uploader.upload(absoluteImagePath, {
            folder: 'sparkit/products/images',
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
          });

          console.log(`Uploaded successfully! URL: ${uploadRes.secure_url}`);
          mediaRecords.push({
            productId: product.id,
            type: 'IMAGE',
            url: uploadRes.secure_url,
            publicId: uploadRes.public_id,
            position: position++
          });
        } catch (uploadErr) {
          console.error(`Cloudinary upload failed for ${path.basename(absoluteImagePath)}:`, uploadErr.message);
        }
      }

      if (mediaRecords.length > 0) {
        console.log(`Saving ${mediaRecords.length} media records in database...`);
        await db.insert(productMedia).values(mediaRecords);
        console.log(`Media records saved.`);
      } else {
        console.warn(`No media records saved for product: ${product.name}`);
      }
    }

    console.log(`\n============================================`);
    console.log("Vendor product seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding vendor products failed:", error);
    process.exit(1);
  }
};

seedVendorProducts();
