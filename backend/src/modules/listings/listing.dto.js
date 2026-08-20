export function toListingSummaryDto(listing) {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    city: listing.city,
    subCity: listing.sub_city,
    location: `${listing.sub_city}, ${listing.city}`,
    pricePerNight: Number(listing.price_per_night),
    coverPhoto: listing.photos?.[0] ?? null,
    photos: listing.photos ?? [],
    amenities: listing.amenities ?? [],
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    maxGuests: listing.max_guests,
    averageRating: Number(listing.average_rating ?? 0),
    reviewCount: Number(listing.review_count ?? 0),
    hostId: listing.host_id,
  };
}

export function toMyListingDto(listing) {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    city: listing.city,
    subCity: listing.sub_city,
    pricePerNight: Number(listing.price_per_night),
    coverPhoto: listing.photos?.[0] ?? null,
    status: listing.status,
    active: listing.active,
    rejectionReason: listing.rejection_reason ?? null,
    createdAt: listing.created_at,
  };
}

export function toListingDetailDto(listing) {
  const hostName = [
    listing.host_first_name,
    listing.host_middle_name,
    listing.host_last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    id: listing.id,
    hostId: listing.host_id,
    hostName,
    category: listing.category,
    title: listing.title,
    description: listing.description,
    city: listing.city,
    subCity: listing.sub_city,
    streetAddress: listing.street_address,
    photos: listing.photos ?? [],
    amenities: listing.amenities ?? [],
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    maxGuests: listing.max_guests,
    pricePerNight: Number(listing.price_per_night),
    houseRules: listing.house_rules ?? [],
    averageRating: Number(listing.average_rating ?? 0),
    reviewCount: Number(listing.review_count ?? 0),
  };
}