import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    setRefreshTokenCookie(res, result.refreshToken);
    return sendSuccess(res, { user: result.user, token: result.accessToken }, 'Registration successful', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setRefreshTokenCookie(res, result.refreshToken);
    return sendSuccess(res, { user: result.user, token: result.accessToken }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 401);
  }
};

export const vendorRegister = async (req, res) => {
  try {
    const { name, email, password, businessName, businessDescription, gstNumber, bankAccountInfo } = req.body;
    const result = await authService.vendorRegister({
      name,
      email,
      password,
      businessName,
      businessDescription,
      gstNumber,
      bankAccountInfo
    });
    setRefreshTokenCookie(res, result.refreshToken);
    return sendSuccess(res, { user: result.user, token: result.accessToken }, 'Vendor registration successful. Pending admin verification.', 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.vendorLogin(email, password);
    setRefreshTokenCookie(res, result.refreshToken);
    return sendSuccess(res, { user: result.user, token: result.accessToken }, 'Vendor login successful');
  } catch (error) {
    return sendError(res, error.message, 401);
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token not found', 401);
    }
    const result = await authService.handleRefreshToken(refreshToken);
    setRefreshTokenCookie(res, result.refreshToken);
    return sendSuccess(res, { user: result.user, token: result.accessToken }, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid refresh token', 401);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, user, 'User details fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await authService.updateMe(req.user.id, req.body);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.id, oldPassword, newPassword);
    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateAvatar = async (req, res) => {
  try {
    // Multer upload middleware attaches file details
    // If Cloudinary is configured, file.path is the Cloudinary secure_url.
    // If fallback is used, we store relative path /uploads/...
    let avatarUrl;
    if (req.file) {
      avatarUrl = req.file.path || `/uploads/${req.file.filename}`;
    } else {
      return sendError(res, 'Avatar file is required', 400);
    }
    
    const user = await authService.updateAvatar(req.user.id, avatarUrl);
    return sendSuccess(res, user, 'Avatar updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};
