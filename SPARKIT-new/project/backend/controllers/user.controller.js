import * as addressService from '../services/address.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAddresses = async (req, res) => {
  try {
    const list = await addressService.getAddresses(req.user.id);
    return sendSuccess(res, list, 'Addresses retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const createAddress = async (req, res) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    return sendSuccess(res, address, 'Address added successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await addressService.updateAddress(req.params.id, req.user.id, req.body);
    return sendSuccess(res, address, 'Address updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    await addressService.deleteAddress(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Address deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    await addressService.setDefaultAddress(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Address set as default successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
