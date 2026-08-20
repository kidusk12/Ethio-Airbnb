function fieldError(field, message) {
  return { field, message };
}

export function validateRejectListing(body) {
  const errors = [];

  if (
    body.reason !== undefined &&
    (typeof body.reason !== 'string' || body.reason.trim().length > 500)
  ) {
    errors.push(
      fieldError(
        'reason',
        'Rejection reason must be text of 500 characters or fewer.',
      ),
    );
  }

  return errors;
}