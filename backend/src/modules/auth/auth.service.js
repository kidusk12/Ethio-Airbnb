import ApiError from '../../utils/ApiError.js';
import { signToken } from '../../utils/jwt.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import {
  createUser,
  findActiveUserByEmail,
  findActiveUserById,
  findUserByEmail,
  hasGuestDeletionBlock,
  hasHostDeletionBlock,
  saveHostVerification,
  softDeleteUser,
  updateUser,
} from './auth.repository.js';

export async function register(data) {
  const existingUser = await findUserByEmail(data.email);

  // Soft-deleted emails remain reserved.
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered.', [
      { field: 'email', message: 'Email is already registered.' },
    ]);
  }

  return createUser({
    ...data,
    passwordHash: await hashPassword(data.password),
  });
}

export async function login({ email, password }) {
  const user = await findActiveUserByEmail(email);

  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  return {
    user,
    token: signToken(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await findActiveUserById(userId);

  if (!user) {
    throw new ApiError(401, 'Your account is no longer available.');
  }

  return user;
}

export async function updateCurrentUser(userId, data) {
  const currentUser = await getCurrentUser(userId);

  const profileFields = [
    'firstName',
    'middleName',
    'lastName',
    'phoneNumber',
    'email',
  ];

  const isTryingToEditProfile = profileFields.some(
    (field) => data[field] !== undefined,
  );

  if (currentUser.role === 'admin' && isTryingToEditProfile) {
    throw new ApiError(
      403,
      'Administrators may only change their password.',
    );
  }

  if (data.newPassword) {
    const isCurrentPasswordCorrect = await comparePassword(
      data.currentPassword,
      currentUser.password_hash,
    );

    if (!isCurrentPasswordCorrect) {
      throw new ApiError(400, 'Current password is incorrect.', [
        {
          field: 'currentPassword',
          message: 'Current password is incorrect.',
        },
      ]);
    }
  }

  if (
    data.email !== undefined &&
    data.email.toLowerCase() !== currentUser.email.toLowerCase()
  ) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(409, 'Email is already registered.', [
        { field: 'email', message: 'Email is already registered.' },
      ]);
    }
  }

  const fields = {};

  if (data.firstName !== undefined) fields.first_name = data.firstName.trim();
  if (data.middleName !== undefined) {
    fields.middle_name = data.middleName.trim();
  }
  if (data.lastName !== undefined) fields.last_name = data.lastName.trim();
  if (data.phoneNumber !== undefined) {
    fields.phone_number = data.phoneNumber.trim();
  }
  if (data.email !== undefined) fields.email = data.email.trim().toLowerCase();
  if (data.newPassword !== undefined) {
    fields.password_hash = await hashPassword(data.newPassword);
  }

  return updateUser(userId, fields);
}

export async function deleteCurrentUser(userId) {
  const user = await getCurrentUser(userId);

  if (user.role === 'admin') {
    throw new ApiError(403, 'Administrator accounts cannot be deleted.');
  }

  const isBlocked =
    user.role === 'guest'
      ? await hasGuestDeletionBlock(user.id)
      : await hasHostDeletionBlock(user.id);

  if (isBlocked) {
    throw new ApiError(
      409,
      'Your account cannot be deleted while it has unresolved listings or bookings.',
    );
  }

  await softDeleteUser(user.id);
}

export async function verifyHostIdentity(userId, idDocumentUrl) {
  const user = await getCurrentUser(userId);

  if (user.role !== 'host') {
    throw new ApiError(403, 'Only hosts can verify their identity.');
  }

  return saveHostVerification(userId, idDocumentUrl);
}