function fieldError(field, message) {
  return { field, message };
}

export function validateMarkPaid(body) {
  const errors = [];

  if (typeof body.transactionCode !== 'string' || !body.transactionCode.trim()) {
    errors.push(
      fieldError('transactionCode', 'A transaction code is required.'),
    );
  }

  return errors;
}