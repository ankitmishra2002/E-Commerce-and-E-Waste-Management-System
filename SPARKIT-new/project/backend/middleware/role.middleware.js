import { sendError } from '../utils/apiResponse.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Unauthorized role.', 403);
    }
    
    next();
  };
};

export default requireRole;
