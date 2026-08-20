function fullName({
  first_name: firstName,
  middle_name: middleName,
  last_name: lastName,
}) {
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
}

export function toAdminListingDto(listing) {
  return {
    id: listing.id,
    status: listing.status,
    active: listing.active,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,

    host: {
      id: listing.host_id,
      name: fullName(listing),
      email: listing.host_email,
      phoneNumber: listing.host_phone_number,
      idDocumentUrl: listing.host_id_document_url,
    },

    listing: {
      category: listing.category,
      title: listing.title,
      description: listing.description,
      city: listing.city,
      subCity: listing.sub_city,
      streetAddress: listing.street_address,
      photos: listing.photos ?? [],
      houseDeedPhotoUrl: listing.house_deed_photo_url,
      amenities: listing.amenities ?? [],
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      maxGuests: listing.max_guests,
      pricePerNight: Number(listing.price_per_night),
      houseRules: listing.house_rules ?? [],
    },

    rejectionReason: listing.rejection_reason ?? null,
  };
}