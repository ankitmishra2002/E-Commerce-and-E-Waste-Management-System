import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { db } from '../config/db.js';
import { orders, orderItems, products, reviews, returns, users } from '../models/schema.js';

export const getVendorDashboard = async (vendorId) => {
  // 1. Total Revenue: SUM(priceAtPurchase * quantity) for non-pending/non-cancelled orders belonging to this vendor
  const [revenueResult] = await db.select({
    revenue: sql`COALESCE(SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity}), 0)::float`
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.vendorId, vendorId),
    sql`${orders.status} NOT IN ('PENDING', 'CANCELLED')`
  ));
  
  const totalRevenue = revenueResult?.revenue || 0;

  // 2. Total Orders: COUNT of distinct orders containing this vendor's products
  const [ordersResult] = await db.select({
    ordersCount: sql`COUNT(DISTINCT ${orderItems.orderId})::int`
  })
  .from(orderItems)
  .where(eq(orderItems.vendorId, vendorId));
  
  const totalOrders = ordersResult?.ordersCount || 0;

  // 3. Total Products Sold: SUM of quantities of active items
  const [soldResult] = await db.select({
    soldCount: sql`COALESCE(SUM(${orderItems.quantity}), 0)::int`
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.vendorId, vendorId),
    sql`${orders.status} NOT IN ('PENDING', 'CANCELLED')`
  ));
  
  const totalProductsSold = soldResult?.soldCount || 0;

  // 4. Profit Margin: Assuming cost price is 70% of the price (margin = 30%)
  // profitMargin = (revenue - cost) / revenue = 0.30
  const cost = totalRevenue * 0.70;
  const profit = totalRevenue - cost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // 5. Avg Rating of Vendor's products
  const [ratingResult] = await db.select({
    avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)::float`
  })
  .from(reviews)
  .leftJoin(products, eq(reviews.productId, products.id))
  .where(eq(products.vendorId, vendorId));
  
  const avgRating = ratingResult?.avgRating || 0;

  // 6. Top 5 Products by Revenue
  const topProducts = await db.select({
    id: products.id,
    name: products.name,
    revenue: sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})::float`,
    soldCount: sql`SUM(${orderItems.quantity})::int`
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.vendorId, vendorId),
    sql`${orders.status} NOT IN ('PENDING', 'CANCELLED')`
  ))
  .groupBy(products.id, products.name)
  .orderBy(desc(sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`))
  .limit(5);

  // 7. Recent Orders with complete item details for the dashboard table
  const recentOrders = await db.select({
    id: orders.id,
    status: orders.status,
    createdAt: orders.createdAt,
    quantity: orderItems.quantity,
    price: orderItems.priceAtPurchase,
    product: {
      name: products.name
    }
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.vendorId, vendorId))
  .orderBy(desc(orders.createdAt))
  .limit(5);

  // 8. Monthly Revenue for Recharts chart
  const revenueByMonth = await db.select({
    month: sql`TO_CHAR(${orders.createdAt}, 'Mon YYYY')`,
    revenue: sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})::float`
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.vendorId, vendorId),
    sql`${orders.status} NOT IN ('PENDING', 'CANCELLED')`
  ))
  .groupBy(sql`TO_CHAR(${orders.createdAt}, 'Mon YYYY')`, sql`DATE_TRUNC('month', ${orders.createdAt})`)
  .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`)
  .limit(12);

  // 9. Returns Rate (Returned items / Total items)
  const [returnsResult] = await db.select({
    returnsCount: sql`COUNT(DISTINCT ${returns.id})::int`
  })
  .from(returns)
  .leftJoin(orderItems, eq(returns.orderItemId, orderItems.id))
  .where(eq(orderItems.vendorId, vendorId));

  const returnsCount = returnsResult?.returnsCount || 0;
  const returnsRate = totalOrders > 0 ? (returnsCount / totalOrders) * 100 : 0;

  // 10. Fetch Vendor Verification Status
  const [vendorUser] = await db.select({
    isActive: users.isActive
  })
  .from(users)
  .where(eq(users.id, vendorId))
  .limit(1);
  const isVerified = vendorUser?.isActive || false;

  // 11. Fetch Active Products Count
  const [productsCountResult] = await db.select({
    count: sql`COUNT(*)::int`
  })
  .from(products)
  .where(and(
    eq(products.vendorId, vendorId),
    eq(products.isDeleted, false)
  ));
  const productsCount = productsCountResult?.count || 0;

  // 12. Fetch Low Stock Products
  const lowStockProducts = await db.select({
    id: products.id,
    name: products.name,
    sku: products.sku,
    stock: products.stock
  })
  .from(products)
  .where(and(
    eq(products.vendorId, vendorId),
    eq(products.isDeleted, false),
    sql`${products.stock} < 10`
  ));

  return {
    isVerified,
    stats: {
      earnings: totalRevenue,
      ordersCount: totalOrders,
      productsCount,
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      totalProductsSold,
      profitMargin: profitMargin.toFixed(1) + '%',
      avgRating: avgRating.toFixed(1),
      returnsRate: returnsRate.toFixed(1) + '%'
    },
    topProducts,
    recentOrders,
    revenueByMonth,
    lowStockProducts
  };
};

export const getVendorProducts = async (vendorId) => {
  return db.query.products.findMany({
    where: and(eq(products.vendorId, vendorId), eq(products.isDeleted, false)),
    with: {
      media: true,
      category: true,
    },
    orderBy: [desc(products.createdAt)],
  });
};

export const getVendorSalesAnalytics = async (vendorId, { startDate, endDate }) => {
  const conditions = [
    eq(orderItems.vendorId, vendorId),
    eq(orders.status, 'DELIVERED')
  ];

  if (startDate) {
    conditions.push(gte(orders.createdAt, new Date(startDate)));
  }
  if (endDate) {
    conditions.push(lte(orders.createdAt, new Date(endDate)));
  }

  return db.select({
    productId: products.id,
    productName: products.name,
    sku: products.sku,
    unitsSold: sql`SUM(${orderItems.quantity})::int`,
    revenue: sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})::float`
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(...conditions))
  .groupBy(products.id, products.name, products.sku)
  .orderBy(desc(sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`));
};

export const getVendorRevenueAnalytics = async (vendorId) => {
  const [revenueResult] = await db.select({
    revenue: sql`COALESCE(SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity}), 0)::float`
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.vendorId, vendorId),
    eq(orders.status, 'DELIVERED')
  ));
  
  const revenue = revenueResult?.revenue || 0;
  const cost = revenue * 0.70;
  const netProfit = revenue - cost;

  return {
    revenue: revenue.toFixed(2),
    costOfGoods: cost.toFixed(2),
    netProfit: netProfit.toFixed(2),
    profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) + '%' : '0%'
  };
};

export const getVendorProductAnalytics = async (vendorId, productId) => {
  const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.vendorId, vendorId))).limit(1);
  if (!product) throw new Error('Product not found or unauthorized');

  const [salesResult] = await db.select({
    unitsSold: sql`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
    revenue: sql`COALESCE(SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity}), 0)::float`
  })
  .from(orderItems)
  .leftJoin(orders, eq(orderItems.orderId, orders.id))
  .where(and(
    eq(orderItems.productId, productId),
    eq(orders.status, 'DELIVERED')
  ));

  const [ratingResult] = await db.select({
    avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)::float`,
    count: sql`COUNT(${reviews.id})::int`
  })
  .from(reviews)
  .where(eq(reviews.productId, productId));

  return {
    productName: product.name,
    sku: product.sku,
    stock: product.stock,
    unitsSold: salesResult?.unitsSold || 0,
    totalRevenue: (salesResult?.revenue || 0).toFixed(2),
    avgRating: (ratingResult?.avgRating || 0).toFixed(1),
    reviewsCount: ratingResult?.count || 0
  };
};
