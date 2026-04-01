# 🌟 Valore Parfums - Premium E-Commerce Platform

Valore Parfums is an ultra-premium, full-stack Next.js e-commerce platform specifically engineered for the luxury fragrance market. It breaks the mold of generic e-commerce templates by offering a deeply customized shopping experience tailored exactly for selling **decants (ML-based)** and **full bottles**, supported by a heavy-duty administrative dashboard for end-to-end operational control.

## 🚀 State-of-the-Art Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS v4, PostCSS, Lucide React icons
- **State Management**: Zustand (Persisted Cart, Auth & Theme tracking)
- **Authentication**: Firebase Admin alongside a robust custom session management system
- **Database/Backend**: Firebase Firestore configured with complex data structures
- **Data Visualization**: Recharts (for deep admin analytics)
- **Date Handling**: date-fns
- **Image Processing**: Sharp (Dynamic image optimization)

---

## 💎 Elite Storefront Features (Customer Experience)

### 🛒 Hyper-Specialized Product Catalog
* **Decant Mastery**: Customers can purchase exact decant sizes (e.g., 2ml, 5ml, 10ml). The system dynamically calculates price based on ML and selected sizes.
* **Full Bottle System**: Dedicated purchasing flow for full bottles, with specific variation tracking.
* **Fragrance Notes Parsing**: Detailed presentation of Top, Heart, and Base notes, giving buyers an exact breakdown of the scent profile.
* **Dynamic Cart (Zustand)**: Resolves complex conflicts by treating the same perfume at different MLs or as a Full Bottle as completely separate line items.

### 💳 Comprehensive & Localized Checkout Pipeline
* **Multi-Tier Delivery Zones**: Automatically applies different shipping rates for "Inside Dhaka" vs "Outside Dhaka" directly fetched from admin configurations.
* **Configurable Pickup Points**: Customers can choose to pick up from dynamic locations configured by the admin (complete with addresses, active status, and phone numbers).
* **Advanced Manual Payment Integrations**:
  * **bKash (Mobile Money)**: Admin-provided QR codes, manual TXN ID capture, and automated verification holds.
  * **Direct Bank Transfer (NPSB)**: Full form capturing Bank Name, District, Branch, Routing, Account structure, and Reference IDs.
  * **Cash on Delivery (COD)**: Standard deferred payment option.
* **Voucher System Engine**: Real-time discount validations against total order value and bottle types before final purchase.

### 👤 Customer Portals
* **User Accounts**: Custom signup/login flow locking in customer details to speed up checkout. Guest mode is securely allowed but prompts users to save their tracking ID.
* **Wishlist Capability**: Bookmark and save favorite fragrances for future hauls.
* **Live Order Tracking**: A dedicated `track` page where users (even without accounts, via Guest Order IDs) can keep an eye on unfulfilled, processing, and shipped statuses.
* **Direct Stock Requests**: If an item is out of stock, customers can instantly file a formal request directly from the UI to notify the owners what to restock next.

---

## 🛡️ Enterprise-Grade Admin Dashboard

The `src/app/admin` directory houses a massive backend ecosystem capable of running a large-scale business operation.

### 📦 Deep Inventory & Product Controls
* **Perfume Registry**: Master list of all fragrances, brands, and base data.
* **Bottle Inventory**: Track exactly how many physical bottles exist, separating presentation bottles from decanting stock.
* **Decant Sizes & Pricing Engine**: Define the exact ML increments sold (e.g., 5ml) and configure global or per-perfume markup rules.
* **Bulk Pricing Logic**: Setup wholesale or large-order discount tiers automatically dynamically applied.
* **Notes Library Manager**: Granularly manage individual ingredients (e.g., Bergamot, Oud) to quickly assign to multiple perfumes.

### 🧾 Financial & Order Operations (ERP Level)
* **Real-time Reporting**: Deep data visualization rendering sales figures, most popular ML sizes, and highest revenue fragrances (powered by Recharts).
* **Order Fulfillment Pipeline**: Manage the lifecycle of an order from "Pending Verification" to "Shipped". Cross-reference manual TXN IDs (bKash/Bank) here before authorizing.
* **Owner Accounts & Withdrawals**: A standalone financial module! Track exactly how much revenue has been generated, manage owner profiles, and log actual money withdrawals from the business accounts.
* **Voucher & Discount Management**: Set active/inactive promotional codes with strict rules (e.g., "Exclude Full Bottles").
* **Custom Perfume Requests**: Review user-submitted requests for perfumes not yet in the catalog. 

### ⚙️ System & Site Configuration
* **Dynamic Checkout Settings (`checkout-config`)**: Admins can change bKash numbers, banking details, and shipping fees instantly—no code deployment required!
* **Pickup Location Manager**: Add/remove physical locations customers can select at checkout.
* **Notification Station**: Push active alerts or warnings globally across the storefront.
* **Data Export**: Single click exports (`export`) to extract crucial tables into CSV/JSON for accounting software.

---

## 🛠️ Quick Start Guide

1. **Install Dependencies**:
```bash
npm install
```

2. **Boot up Development Server**:
```bash
npm run dev
```

3. **Explore**:
Navigate to [http://localhost:3000](http://localhost:3000) for the storefront, or `/admin` to see the backend powerhouse in action.
