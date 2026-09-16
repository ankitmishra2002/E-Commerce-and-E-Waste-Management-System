import * as productService from '../services/product.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProducts = async (req, res) => {
  try {
    const { page, limit, category, vendorId, minPrice, maxPrice, sortBy, search, inStock } = req.query;
    const result = await productService.getProducts({
      page,
      limit,
      category,
      vendorId,
      minPrice,
      maxPrice,
      sortBy,
      search,
      inStock
    });
    return sendSuccess(res, result, 'Products retrieved successfully');
  } catch (error) {
    console.error("getProducts Error:", error);
    return sendError(res, error.message, 400);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product, 'Product details retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await productService.getProductReviews(req.params.id, page, limit);
    return sendSuccess(res, result, 'Product reviews retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, null, 'Product soft-deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const uploadProductMedia = async (req, res) => {
  try {
    const images = req.files?.images || [];
    const video = req.files?.video?.[0] || null;
    
    const media = await productService.addProductMedia(
      req.params.id,
      req.user.id,
      req.user.role,
      images,
      video
    );
    
    return sendSuccess(res, media, 'Media uploaded successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteProductMedia = async (req, res) => {
  try {
    await productService.deleteProductMedia(
      req.params.id,
      req.params.mediaId,
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, null, 'Media deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await productService.getCategories();
    return sendSuccess(res, result, 'Categories retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
