const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9]{9,15}$/;

function fieldError(field, message) {
  return { field, message };
}

export function validateRegister(body) {
  const errors = [];

  if (!body.firstName?.trim()) {
    errors.push(fieldError('firstName', 'First name is required.'));
  }

  if (!body.middleName?.trim()) {
    errors.push(fieldError('middleName', 'Middle name is required.'));
  }

  if (!body.lastName?.trim()) {
    errors.push(fieldError('lastName', 'Last name is required.'));
  }

  if (!phonePattern.test(body.phoneNumber ?? '')) {
    errors.push(fieldError('phoneNumber', 'Enter a valid phone number.'));
  }

  if (!emailPattern.test(body.email ?? '')) {
    errors.push(fieldError('email', 'Enter a valid email address.'));
  }

  if (typeof body.password !== 'string' || body.password.length < 8) {
    errors.push(fieldError('password', 'Password must be at least 8 characters.'));
  }

  if (!['guest', 'host'].includes(body.role)) {
    errors.push(fieldError('role', 'Role must be guest or host.'));
  }

  return errors;
}

export function validateLogin(body) {
  const errors = [];

  if (!emailPattern.test(body.email ?? '')) {
    errors.push(fieldError('email', 'Enter a valid email address.'));
  }

  if (!body.password) {
    errors.push(fieldError('password', 'Password is required.'));
  }

  return errors;
}

export function validateUpdateProfile(body) {
  const errors = [];

  if (body.middleName !== undefined && !body.middleName?.trim()) {
    errors.push(fieldError('middleName', 'Middle name cannot be empty.'));
  }

  if (body.email !== undefined && !emailPattern.test(body.email)) {
    errors.push(fieldError('email', 'Enter a valid email address.'));
  }

  if (
    body.phoneNumber !== undefined &&
    !phonePattern.test(body.phoneNumber)
  ) {
    errors.push(fieldError('phoneNumber', 'Enter a valid phone number.'));
  }

  if (body.newPassword !== undefined && body.newPassword.length < 8) {
    errors.push(
      fieldError('newPassword', 'New password must be at least 8 characters.'),
    );
  }

  if (body.newPassword && !body.currentPassword) {
    errors.push(
      fieldError(
        'currentPassword',
        'Current password is required to set a new password.',
      ),
    );
  }

  return errors;
}

export function validateHostVerification(body) {
  if (typeof body.idDocumentUrl !== 'string' || !body.idDocumentUrl.trim()) {
    return [
      fieldError(
        'idDocumentUrl',
        'A valid identity document URL is required.',
      ),
    ];
  }

  return [];
}