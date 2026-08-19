import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { findActiveUserById } from '../modules/auth/auth.repository.js';

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication is required.');
    }

    const token = authorization.substring('Bearer '.length);
    const payload = verifyToken(token);

    // Re-checking the database ensures a deleted account's old JWT
    // immediately stops working.
    const user = await findActiveUserById(payload.id);

    if (!user) {
      throw new ApiError(401, 'Your account is no longer available.');
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);

    return next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}