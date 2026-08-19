import { success } from '../../utils/apiResponse.js';
import { toUserDto } from './auth.dto.js';
import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);

    return success(res, {
      status: 201,
      message: 'Account created successfully. Please log in.',
      data: { user: toUserDto(user) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);

    return success(res, {
      data: {
        user: toUserDto(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return success(res, {
      data: toUserDto(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await authService.updateCurrentUser(req.user.id, req.body);

    return success(res, {
      message: 'Profile updated successfully.',
      data: toUserDto(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await authService.deleteCurrentUser(req.user.id);

    return success(res, {
      message: 'Your account has been deleted.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyHostIdentity(req, res, next) {
  try {
    await authService.verifyHostIdentity(
      req.user.id,
      req.body.idDocumentUrl,
    );

    return success(res, {
      message: 'Identity verification photo saved.',
    });
  } catch (error) {
    return next(error);
  }
}