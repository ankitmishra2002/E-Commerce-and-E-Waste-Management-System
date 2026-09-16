import * as cartService from '../services/cart.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return sendSuccess(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addItem(req.user.id, productId, parseInt(quantity) || 1);
    return sendSuccess(res, item, 'Item added to cart successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await cartService.updateItem(req.user.id, req.params.itemId, parseInt(quantity));
    return sendSuccess(res, item, 'Cart item updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const removeItem = async (req, res) => {
  try {
    await cartService.removeItem(req.user.id, req.params.itemId);
    return sendSuccess(res, null, 'Item removed from cart successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);
    return sendSuccess(res, null, 'Cart cleared successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
