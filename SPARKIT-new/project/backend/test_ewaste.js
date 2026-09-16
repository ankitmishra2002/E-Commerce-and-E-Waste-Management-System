import { db } from './config/db.js';
import { users, addresses, ewasteRequests } from './models/schema.js';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const testEwasteFlow = async () => {
  console.log("Starting E-Waste service-level database flow verification...");

  try {
    // 1. Fetch test users
    const [user] = await db.select().from(users).where(eq(users.email, 'user1@sparkit.com')).limit(1);
    const [vendor] = await db.select().from(users).where(eq(users.email, 'vendor1@sparkit.com')).limit(1);
    const [admin] = await db.select().from(users).where(eq(users.email, 'admin@sparkit.com')).limit(1);

    if (!user || !vendor || !admin) {
      console.error("Test users are missing. Please seed the database first using 'npm run seed' in project/backend.");
      process.exit(1);
    }

    console.log(`Found User: ${user.name} (${user.id})`);
    console.log(`Found Vendor: ${vendor.name} (${vendor.id})`);
    console.log(`Found Admin: ${admin.name} (${admin.id})`);

    // 2. Fetch or create a test address for the user
    let [addr] = await db.select().from(addresses).where(eq(addresses.userId, user.id)).limit(1);
    if (!addr) {
      console.log("Creating a mock address for User...");
      [addr] = await db.insert(addresses).values({
        userId: user.id,
        label: 'Home',
        line1: '123 Test Street',
        city: 'Metropolis',
        state: 'NY',
        pincode: '10001',
        country: 'USA',
        isDefault: true
      }).returning();
    }
    console.log(`Address ID: ${addr.id}`);

    // 3. User lists e-waste item and submits request
    console.log("\n--- Step 1: User lists item and raises request ---");
    const [request] = await db.insert(ewasteRequests).values({
      userId: user.id,
      addressId: addr.id,
      category: 'laptop',
      brand: 'MacBook Pro M1',
      condition: 'Minor scratch on lid, battery cycle count 180',
      age: 24,
      accessories: 'Charger & Bill',
      images: ['/uploads/mock_macbook.jpg'],
      status: 'PENDING',
      adminApprovalStatus: 'PENDING',
      paymentStatus: 'UNPAID'
    }).returning();
    console.log(`Created E-Waste Request ID: ${request.id}`);
    console.log(`Status: ${request.status}`);

    // 4. Vendor accepts pickup request
    console.log("\n--- Step 2: Vendor accepts pickup request ---");
    const [acceptedRequest] = await db.update(ewasteRequests)
      .set({
        vendorId: vendor.id,
        status: 'ACCEPTED',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`Request accepted by Vendor ID: ${acceptedRequest.vendorId}`);
    console.log(`New Status: ${acceptedRequest.status}`);

    // 5. Vendor inspects item and quotes price
    console.log("\n--- Step 3: Vendor inspects item and quotes price ---");
    const [inspectedRequest] = await db.update(ewasteRequests)
      .set({
        verifiedCondition: 'Actual battery health is 88%. Screen is scratch-free.',
        quotedPrice: '750.00',
        inspectionNotes: 'Verified accessories. Physical condition matches description.',
        status: 'QUOTE_PROVIDED',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`Quoted Price: $${inspectedRequest.quotedPrice}`);
    console.log(`New Status: ${inspectedRequest.status}`);

    // 6. User accepts quotation
    console.log("\n--- Step 4: User accepts quotation ---");
    const [quoteAcceptedRequest] = await db.update(ewasteRequests)
      .set({
        status: 'QUOTE_ACCEPTED',
        adminApprovalStatus: 'PENDING',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`User accepted quote. Admin Approval Status: ${quoteAcceptedRequest.adminApprovalStatus}`);
    console.log(`New Status: ${quoteAcceptedRequest.status}`);

    // 7. Admin approves transaction
    console.log("\n--- Step 5: Admin approves transaction ---");
    const [adminApprovedRequest] = await db.update(ewasteRequests)
      .set({
        adminApprovalStatus: 'APPROVED',
        status: 'QUOTE_ACCEPTED',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`Admin decision: ${adminApprovedRequest.adminApprovalStatus}`);
    console.log(`New Status: ${adminApprovedRequest.status}`);

    // 8. Vendor completes payment & collection
    console.log("\n--- Step 6: Vendor completes payment & collection ---");
    const [completedRequest] = await db.update(ewasteRequests)
      .set({
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'COD',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`Payment Status: ${completedRequest.paymentStatus} via ${completedRequest.paymentMethod}`);
    console.log(`New Status: ${completedRequest.status}`);

    // 9. User rates vendor performance
    console.log("\n--- Step 7: User rates vendor ---");
    const [ratedRequest] = await db.update(ewasteRequests)
      .set({
        rating: 5,
        review: 'Excellent service! Quick inspection and cash hand-over.',
        updatedAt: new Date()
      })
      .where(eq(ewasteRequests.id, request.id))
      .returning();
    console.log(`Rating: ${ratedRequest.rating} stars`);
    console.log(`User Review: "${ratedRequest.review}"`);

    // Clean up test request
    console.log("\nCleaning up test record...");
    await db.delete(ewasteRequests).where(eq(ewasteRequests.id, request.id));
    console.log("Cleaned up successfully!");

    console.log("\nALL VERIFICATION STEPS COMPLETED SUCCESSFULLY! Database layer is verified.");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed with error: ", err);
    process.exit(1);
  }
};

testEwasteFlow();
