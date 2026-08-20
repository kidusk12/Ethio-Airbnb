export function toAdminDuePayoutDto(payout) {
  return {
    payoutId: payout.payout_id,
    bookingId: payout.booking_id,
    listingTitle: payout.listing_title,
    guestName: [
      payout.guest_first_name,
      payout.guest_middle_name,
      payout.guest_last_name,
    ]
      .filter(Boolean)
      .join(' '),
    hostName: [
      payout.host_first_name,
      payout.host_middle_name,
      payout.host_last_name,
    ]
      .filter(Boolean)
      .join(' '),
    amount: Number(payout.amount),
    paymentConfirmedAt: payout.payment_confirmed_at,
  };
}