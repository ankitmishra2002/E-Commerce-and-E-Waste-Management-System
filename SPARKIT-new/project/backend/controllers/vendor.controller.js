import * as vendorService from '../services/vendor.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getVendorDashboard = async (req, res) => {
  try {
    const data = await vendorService.getVendorDashboard(req.user.id);
    return sendSuccess(res, data, 'Vendor dashboard details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const list = await vendorService.getVendorProducts(req.user.id);
    return sendSuccess(res, list, 'Vendor products retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await vendorService.getVendorSalesAnalytics(req.user.id, { startDate, endDate });
    return sendSuccess(res, data, 'Vendor sales analytics retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorRevenueAnalytics = async (req, res) => {
  try {
    const data = await vendorService.getVendorRevenueAnalytics(req.user.id);
    return sendSuccess(res, data, 'Vendor revenue analytics retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorProductAnalytics = async (req, res) => {
  try {
    const data = await vendorService.getVendorProductAnalytics(req.user.id, req.params.id);
    return sendSuccess(res, data, 'Vendor per-product analytics retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
