import * as notificationService from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getNotifications = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getForUser(req.user.id, page, limit);
    return sendSuccess(res, result, 'Notifications retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const markRead = async (req, res) => {
  try {
    const notif = await notificationService.markRead(req.params.id, req.user.id);
    return sendSuccess(res, notif, 'Notification marked as read successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export default {
  getNotifications,
  markRead,
  markAllRead
};
