function fieldError(field, message) {
  return { field, message };
}

function isValidDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

export function validateCreateBooking(body) {
  const errors = [];

  if (!body.listingId) {
    errors.push(fieldError('listingId', 'Listing ID is required.'));
  }

  if (!isValidDate(body.checkIn)) {
    errors.push(fieldError('checkIn', 'Check-in must be a valid YYYY-MM-DD date.'));
  }

  if (!isValidDate(body.checkOut)) {
    errors.push(fieldError('checkOut', 'Check-out must be a valid YYYY-MM-DD date.'));
  }

  if (
    isValidDate(body.checkIn) &&
    isValidDate(body.checkOut) &&
    new Date(`${body.checkOut}T00:00:00Z`) <=
      new Date(`${body.checkIn}T00:00:00Z`)
  ) {
    errors.push(
      fieldError('checkOut', 'Check-out must be after check-in.'),
    );
  }

  if (!Number.isInteger(body.guestCount) || body.guestCount < 1) {
    errors.push(
      fieldError('guestCount', 'Guest count must be at least 1.'),
    );
  }

  return errors;
}