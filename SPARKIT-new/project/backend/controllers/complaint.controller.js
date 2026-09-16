import * as complaintService from '../services/complaint.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createComplaint = async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path || `/uploads/${file.filename}`);
    }
    
    const complaintData = {
      ...req.body,
      images: images.length > 0 ? images : null
    };

    const complaint = await complaintService.createComplaint(req.user.id, complaintData);
    return sendSuccess(res, complaint, 'Complaint submitted successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getUserComplaints = async (req, res) => {
  try {
    const list = await complaintService.getUserComplaints(req.user.id);
    return sendSuccess(res, list, 'Complaints retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, complaint, 'Complaint details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const respondToComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    const complaint = await complaintService.respondToComplaint(req.params.id, req.user.id, req.user.role, resolution);
    return sendSuccess(res, complaint, 'Resolution submitted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await complaintService.updateComplaintStatus(req.params.id, status);
    return sendSuccess(res, complaint, 'Complaint status updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getAdminComplaints = async (req, res) => {
  try {
    const list = await complaintService.getAdminComplaints();
    return sendSuccess(res, list, 'All complaints retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorComplaints = async (req, res) => {
  try {
    const list = await complaintService.getVendorComplaints(req.user.id);
    return sendSuccess(res, list, 'Vendor complaints retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
