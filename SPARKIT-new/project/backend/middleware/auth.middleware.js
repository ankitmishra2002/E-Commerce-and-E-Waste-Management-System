import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.warn("WARNING: JWT_SECRET is either undefined or less than 32 characters long! High risk of insecurity.");
}

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return sendError(res, 'Token expired', 401, { code: 'TOKEN_EXPIRED' });
        }
        return sendError(res, 'Invalid token', 401);
      }
      
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };
      
      next();
    });
  } catch (error) {
    return sendError(res, 'Authentication failed', 401);
  }
};

export default verifyToken;
