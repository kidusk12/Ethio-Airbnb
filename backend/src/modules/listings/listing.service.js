import ApiError from '../../utils/ApiError.js';
import { findActiveUserById } from '../auth/auth.repository.js';
import {
  createListing,
  findListingById,
  findMyListings,
  findPublicListingById,
  findPublicListings,
  softDeleteListing,
  updateListing,
} from './listing.repository.js';

export async function submitListing(hostId, data) {
  const host = await findActiveUserById(hostId);

  if (!host || host.role !== 'host') {
    throw new ApiError(403, 'Only hosts can create listings.');
  }

  if (!host.id_document_url) {
    throw new ApiError(
      400,
      'ID verification is required before submitting a listing.',
    );
  }

  return createListing({
    hostId,
    ...data,
  });
}

export async function getMyListings(hostId) {
  return findMyListings(hostId);
}

export async function getPublicListings(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 10, 1),
    50,
  );

  const result = await findPublicListings({
    location: query.location?.trim(),
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    category: query.category,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    page,
    limit,
  });

  return {
    ...result,
    page,
    totalPages: Math.max(Math.ceil(result.totalResults / limit), 1),
  };
}

export async function getPublicListingDetail(listingId) {
  const listing = await findPublicListingById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  return listing;
}

export async function editListing(hostId, listingId, data) {
  const listing = await findListingById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  if (listing.host_id !== hostId) {
    throw new ApiError(403, 'You do not own this listing.');
  }

  if (!listing.active) {
    throw new ApiError(400, 'Deleted listings cannot be edited.');
  }

  const columnMap = {
    category: 'category',
    city: 'city',
    subCity: 'sub_city',
    streetAddress: 'street_address',
    houseDeedPhotoUrl: 'house_deed_photo_url',
    photos: 'photos',
    title: 'title',
    description: 'description',
    amenities: 'amenities',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    maxGuests: 'max_guests',
    pricePerNight: 'price_per_night',
    houseRules: 'house_rules',
  };

  const fields = {};

  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      fields[column] = data[key];
    }
  }

  // Editing an approved listing always requires a fresh review.
  if (listing.status === 'approved') {
    fields.status = 'pending';
    fields.approved_by_admin_id = null;
    fields.rejection_reason = null;
  }

  return updateListing(listingId, fields);
}

export async function removeListing(hostId, listingId) {
  const listing = await findListingById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  if (listing.host_id !== hostId) {
    throw new ApiError(403, 'You do not own this listing.');
  }

  if (!listing.active) {
    throw new ApiError(400, 'This listing is already deleted.');
  }

  return softDeleteListing(listingId);
}