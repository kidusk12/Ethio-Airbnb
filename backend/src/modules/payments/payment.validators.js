function fieldError(field, message) {
  return { field, message };
}

export function validateSubmitReceipt(body) {
  const errors = [];

  if (typeof body.receiptImageUrl !== 'string' || !body.receiptImageUrl.trim()) {
    errors.push(
      fieldError('receiptImageUrl', 'A receipt image URL is required.'),
    );
  }

  return errors;
}

export function validateConfirmPayment(body) {
  const errors = [];

  if (typeof body.transactionCode !== 'string' || !body.transactionCode.trim()) {
    errors.push(
      fieldError('transactionCode', 'A transaction code is required.'),
    );
  }

  return errors;
}

export function validateRejectPayment(body) {
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