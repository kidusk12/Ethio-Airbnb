export function toPublicReviewDto(review) {
  return {
    id: review.id,
    guestName: review.guest_name,
    rating: review.rating,
    text: review.text,
    createdAt: review.created_at,
  };
}

export function toAdminReviewDto(review) {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text,
    createdAt: review.created_at,
    guest: {
      id: review.guest_id,
      name: review.guest_name,
      email: review.guest_email,
    },
    listing: {
      id: review.listing_id,
      title: review.listing_title,
    },
    bookingId: review.booking_id,
  };
}