import * as ewasteService from '../services/ewaste.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createRequest = async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path || `/uploads/${file.filename}`);
    }

    const requestData = {
      ...req.body,
      images: images.length > 0 ? images : []
    };

    const request = await ewasteService.createRequest(req.user.id, requestData);
    return sendSuccess(res, request, 'E-waste pickup request submitted successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getUserRequests = async (req, res) => {
  try {
    const list = await ewasteService.getUserRequests(req.user.id);
    return sendSuccess(res, list, 'E-waste pickup requests retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await ewasteService.getRequestById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, request, 'E-waste request details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const getVendorAvailableRequests = async (req, res) => {
  try {
    const list = await ewasteService.getVendorAvailableRequests();
    return sendSuccess(res, list, 'Available e-waste pickup requests retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorAssignedRequests = async (req, res) => {
  try {
    const list = await ewasteService.getVendorAssignedRequests(req.user.id);
    return sendSuccess(res, list, 'Assigned e-waste pickup requests retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const request = await ewasteService.acceptRequest(req.params.id, req.user.id);
    return sendSuccess(res, request, 'E-waste request accepted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const inspectRequest = async (req, res) => {
  try {
    const request = await ewasteService.inspectRequest(req.params.id, req.user.id, req.body);
    return sendSuccess(res, request, 'Inspection report and quote submitted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const respondToQuote = async (req, res) => {
  try {
    const { action } = req.body;
    const request = await ewasteService.respondToQuote(req.params.id, req.user.id, action);
    return sendSuccess(res, request, `Quote ${action.toLowerCase()}ed successfully`);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const completePaymentAndPickup = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const request = await ewasteService.completePaymentAndPickup(req.params.id, req.user.id, paymentMethod);
    return sendSuccess(res, request, 'Payment and pickup transaction completed successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const submitRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const request = await ewasteService.submitRating(req.params.id, req.user.id, rating, review);
    return sendSuccess(res, request, 'Vendor rating and review submitted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminRequests = async (req, res) => {
  try {
    const list = await ewasteService.getAdminRequests();
    return sendSuccess(res, list, 'All e-waste requests retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const adminApproveTransaction = async (req, res) => {
  try {
    const { approvalStatus } = req.body; // 'APPROVED' or 'REJECTED'
    const request = await ewasteService.adminApproveTransaction(req.params.id, approvalStatus);
    return sendSuccess(res, request, `Transaction ${approvalStatus.toLowerCase()} successfully by Admin`);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminVendorRatings = async (req, res) => {
  try {
    const list = await ewasteService.getAdminVendorRatings();
    return sendSuccess(res, list, 'Vendor e-waste ratings retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
