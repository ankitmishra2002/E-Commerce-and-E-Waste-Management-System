Here is the step-by-step guide to test the **E-Waste Vendor Inspection & Purchase** feature manually via the application's UI.

Make sure your backend and frontend servers are running (`npm run dev` in both folders). 

### Prerequisites: Seeded Accounts
You will need to log in with different roles to test the full lifecycle. The following accounts are available from your database seed script:
- **User (Customer)**: `user1@sparkit.com` (Password: `User@123`)
- **Vendor**: `vendor1@sparkit.com` (Password: `Vendor@123`)
- **Admin**: `admin@sparkit.com` (Password: `Admin@123`)

---

### Step 1: User Raises a Pickup Request
1. Log in as the Customer (`user1@sparkit.com`).
2. On the top navigation bar, click on **E-Waste Recycle**.
3. Click the **New Pickup Request** button.
4. Fill in the form details:
   - **Category**: Select a category (e.g., Laptop, Mobile).
   - **Brand**: Enter the brand name (e.g., Apple, Dell).
   - **Age**: Enter the age of the item in months.
   - **Condition**: Describe the condition (e.g., "Working fine, minor scratches").
   - **Accessories**: Note any included items (e.g., "Original charger").
5. Upload a photo of the item (you can upload up to 5 photos).
6. Select an existing pickup address or add a new one.
7. Click **Submit Request**.
8. You will be redirected to the E-Waste dashboard, and your request will show a status of **PENDING**.

---

### Step 2: Vendor Accepts the Pickup Request
1. Open a new incognito window (or log out) and log in as the Vendor (`vendor1@sparkit.com`).
2. Look at the left sidebar and click on **E-Waste Pickups**.
3. Under the **Available Pickups** tab, you will see the request created by the user in Step 1.
4. Click the **Accept Pickup** button on that request.
5. The request will disappear from the "Available" tab and move to your **My Pickups** tab. The status is now **ACCEPTED**.

---

### Step 3: Vendor Inspects the Item and Provides a Quote
1. Still logged in as the Vendor, go to the **My Pickups** tab.
2. Find the accepted request and click the **Action** (or View) button.
3. This opens the inspection page. Fill in the inspection report:
   - **Verified Condition**: Write down what you observed (e.g., "Verified, screen has a small scratch, battery is at 80%").
   - **Quoted Price**: Enter the amount you are willing to pay (e.g., `300`).
   - **Inspection Notes**: Add any internal notes if necessary.
4. Click **Submit Inspection Report**.
5. The request status updates to **QUOTE_PROVIDED**.

---

### Step 4: User Reviews and Accepts the Quote
1. Switch back to the Customer (`user1@sparkit.com`) browser window.
2. Go to the **E-Waste Recycle** page.
3. You will see your request status is now "Quote Provided". Click **View Details**.
4. Review the vendor's inspection notes and the **Quoted Price**.
5. You have the option to Accept or Reject. Click **Accept Quote**.
6. The status will update to **QUOTE_ACCEPTED**, indicating it is now pending admin verification.

---

### Step 5: Admin Approves the Transaction
1. Open another browser window and log in as the Admin (`admin@sparkit.com`).
2. Look at the left sidebar and click on **E-Waste Monitor**.
3. Go to the **Pending Approvals** section or tab.
4. Find the transaction that was just accepted by the user.
5. Click **Approve** (this ensures the platform verifies the trade before final cash handover).
6. The admin approval status changes to "APPROVED".

---

### Step 6: Vendor Completes the Collection and Payment
1. Switch back to the Vendor (`vendor1@sparkit.com`) browser window.
2. Go to **E-Waste Pickups** -> **My Pickups**.
3. Click **Action** on the request.
4. Since the admin has approved it, you will now see the finalization options.
5. Ensure the payment method is set to **Cash on Collection (COD)**.
6. Click **Confirm Collection & Pay**.
7. The status officially becomes **COMPLETED**, and the payment status becomes **PAID**.

---

### Step 7: User Leaves a Rating for the Vendor
1. Switch back to the Customer (`user1@sparkit.com`) browser window.
2. Go to **E-Waste Recycle** and click **View Details** on the completed request.
3. You will see a rating form available at the bottom of the details page.
4. Select a star rating (1 to 5) and write a short review (e.g., "Vendor arrived on time and the transaction was smooth").
5. Click **Submit Rating**.
6. *(Optional)* Log back in as the Admin and check the **E-Waste Monitor -> Vendor Performance** tab to see the vendor's updated average rating!