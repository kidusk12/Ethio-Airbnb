function fieldError(field, message) {
  return { field, message };
}

export function validateCreateReview(body) {
  const errors = [];

  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    errors.push(
      fieldError('rating', 'Rating must be a whole number from 1 to 5.'),
    );
  }

  if (
    body.text !== undefined &&
    (typeof body.text !== 'string' || body.text.trim().length > 1000)
  ) {
    errors.push(
      fieldError('text', 'Review text must be 1,000 characters or fewer.'),
    );
  }

  return errors;
}