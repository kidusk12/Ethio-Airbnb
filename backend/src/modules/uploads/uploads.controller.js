import ApiError from '../../utils/ApiError.js';
import { success } from '../../utils/apiResponse.js';

export function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'An image file is required.');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return success(res, {
      status: 201,
      data: {
        url: `${baseUrl}/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    return next(error);
  }
}