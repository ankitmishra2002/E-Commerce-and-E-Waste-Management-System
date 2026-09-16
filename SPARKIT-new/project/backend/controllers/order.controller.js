import * as orderService from '../services/order.service.js';
import * as trackingService from '../services/tracking.service.js';
import * as notificationService from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getOrders(req.user.id, page, limit);
    return sendSuccess(res, result, 'Orders retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, order, 'Order details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    await orderService.cancelOrder(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Order cancelled successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const requestReturn = async (req, res) => {
  try {
    const returnReq = await orderService.requestReturn(req.user.id, req.params.id, req.body);
    return sendSuccess(res, returnReq, 'Return requested successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const list = await orderService.getVendorOrders(req.user.id);
    return sendSuccess(res, list, 'Vendor orders retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const order = await orderService.updateVendorOrderStatus(req.user.id, req.params.id, status);

    // Add tracking event
    await trackingService.addEvent(req.params.id, status, note || `Order status updated by vendor`, req.user.id, location);

    // Send notification to customer (order owner)
    await notificationService.create(
      order.userId,
      'ORDER_STATUS_CHANGED',
      'Order update',
      `Your order #${order.id.substring(0, 8)} is now ${status}`,
      { orderId: order.id, status }
    );

    return sendSuccess(res, order, 'Order status updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const list = await orderService.getAdminOrders();
    return sendSuccess(res, list, 'All orders retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const order = await orderService.updateAdminOrderStatus(req.params.id, status);

    // Add tracking event
    await trackingService.addEvent(req.params.id, status, note || `Order status updated by admin`, req.user.id, location);

    // Send notification to customer (order owner)
    await notificationService.create(
      order.userId,
      'ORDER_STATUS_CHANGED',
      'Order update',
      `Your order #${order.id.substring(0, 8)} is now ${status}`,
      { orderId: order.id, status }
    );

    return sendSuccess(res, order, 'Order status updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
