import * as adminService from '../services/admin.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await adminService.getAdminDashboard();
    return sendSuccess(res, data, 'Admin dashboard details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const list = await adminService.getUsers();
    return sendSuccess(res, list, 'All users retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const data = await adminService.getUserById(req.params.id);
    return sendSuccess(res, data, 'User details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deactivateAdminUser = async (req, res) => {
  try {
    await adminService.deactivateUser(req.params.id);
    return sendSuccess(res, null, 'User deactivated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminVendors = async (req, res) => {
  try {
    const list = await adminService.getVendors();
    return sendSuccess(res, list, 'All vendors retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const createAdminVendor = async (req, res) => {
  try {
    const vendor = await adminService.createVendor(req.body);
    return sendSuccess(res, vendor, 'Vendor created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const profile = await adminService.verifyVendor(req.params.id);
    return sendSuccess(res, profile, 'Vendor verified successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const suspendVendor = async (req, res) => {
  try {
    await adminService.suspendVendor(req.params.id);
    return sendSuccess(res, null, 'Vendor suspended successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const list = await adminService.getProducts();
    return sendSuccess(res, list, 'All products retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const forceDeleteProduct = async (req, res) => {
  try {
    await adminService.forceDeleteProduct(req.params.id);
    return sendSuccess(res, null, 'Product permanently deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const data = await adminService.getAdminAnalytics();
    return sendSuccess(res, data, 'Platform analytical details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
