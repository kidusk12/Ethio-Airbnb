export function toGuestBookingDto(booking) {
  return {
    id: booking.id,
    listingId: booking.listing_id,
    listingTitle: booking.listing_title,
    coverPhoto: booking.cover_photo ?? null,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guestCount: booking.guest_count,
    status: booking.status,
    totalPrice: Number(booking.total_price),
    paymentDeadline: booking.payment_deadline,
    hasReviewed: booking.has_reviewed,
  };
}

export function toHostBookingDto(booking) {
  return {
    id: booking.id,
    listingId: booking.listing_id,
    listingTitle: booking.listing_title,
    coverPhoto: booking.cover_photo ?? null,
    guestName: [
      booking.guest_first_name,
      booking.guest_middle_name,
      booking.guest_last_name,
    ]
      .filter(Boolean)
      .join(' '),
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guestCount: booking.guest_count,
    status: booking.status,
    totalPrice: Number(booking.total_price),
    paymentDeadline: booking.payment_deadline,
  };
}