import * as reviewService from '../services/review.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.params.productId, req.body);
    return sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.user.id, req.body);
    return sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getVendorProductReviews = async (req, res) => {
  try {
    const list = await reviewService.getVendorProductReviews(req.user.id, req.params.productId);
    return sendSuccess(res, list, 'Product reviews retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
