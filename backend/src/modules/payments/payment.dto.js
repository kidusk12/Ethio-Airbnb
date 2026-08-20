export function toPaymentStatusDto(status) {
  return {
    status: status.status,
    submittedAt: status.submittedAt,
    confirmedAt: status.confirmedAt,
  };
}

export function toAdminPendingPaymentDto(payment) {
  return {
    paymentId: payment.payment_id,
    bookingId: payment.booking_id,
    listingTitle: payment.listing_title,
    guestName: [
      payment.guest_first_name,
      payment.guest_middle_name,
      payment.guest_last_name,
    ]
      .filter(Boolean)
      .join(' '),
    hostName: [
      payment.host_first_name,
      payment.host_middle_name,
      payment.host_last_name,
    ]
      .filter(Boolean)
      .join(' '),
    amount: Number(payment.total_price),
    receiptImageUrl: payment.receipt_image_url,
    submittedAt: payment.submitted_at,
    paymentDeadline: payment.payment_deadline,
  };
}