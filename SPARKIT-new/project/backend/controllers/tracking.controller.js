import * as trackingService from '../services/tracking.service.js';
import * as orderService from '../services/order.service.js';
import * as notificationService from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getTimeline = async (req, res) => {
  try {
    const events = await trackingService.getTrackingTimeline(req.params.orderId, req.user.id, req.user.role);
    return sendSuccess(res, events, 'Tracking timeline retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const addEvent = async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const { orderId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    if (!['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'].includes(status)) {
      return sendError(res, 'Invalid order status', 400);
    }

    // 1. Fetch order details to verify existence, permission, and get customer id
    const order = await orderService.getOrderById(orderId, userId, role);

    // 2. Add tracking event
    const event = await trackingService.addEvent(orderId, status, note, userId, location);

    // 3. Update order status
    if (role === 'ADMIN') {
      await orderService.updateAdminOrderStatus(orderId, status);
    } else {
      await orderService.updateVendorOrderStatus(userId, orderId, status);
    }

    // 4. Send notification to the order owner
    await notificationService.create(
      order.userId,
      'ORDER_STATUS_CHANGED',
      'Order update',
      `Your order #${orderId.substring(0, 8)} is now ${status}`,
      { orderId, status }
    );

    return sendSuccess(res, event, 'Tracking event added successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export default {
  getTimeline,
  addEvent
};
