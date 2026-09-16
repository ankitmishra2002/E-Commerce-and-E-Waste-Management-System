import * as wishlistService from '../services/wishlist.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getWishlist = async (req, res) => {
  try {
    const list = await wishlistService.getWishlist(req.user.id);
    return sendSuccess(res, list, 'Wishlist retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const addItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return sendError(res, 'Product ID is required', 400);
    }
    const item = await wishlistService.addItem(req.user.id, productId);
    return sendSuccess(res, item, 'Item added to wishlist successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const removeItem = async (req, res) => {
  try {
    await wishlistService.removeItem(req.user.id, req.params.productId);
    return sendSuccess(res, null, 'Item removed from wishlist successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const moveToCart = async (req, res) => {
  try {
    const item = await wishlistService.moveToCart(req.user.id, req.params.productId);
    return sendSuccess(res, item, 'Item moved to cart successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
