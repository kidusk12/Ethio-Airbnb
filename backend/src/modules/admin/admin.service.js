import ApiError from '../../utils/ApiError.js';
import {
  approveListing,
  findAllListings,
  findListingForAdmin,
  findPendingListings,
  rejectListing,
  softDeleteListingAsAdmin,
} from './admin.repository.js';

import { getDashboardStats } from './admin.repository.js';

export async function getStats() {
  return getDashboardStats();
}

export async function getPendingListings() {
  return findPendingListings();
}

export async function getAllListings() {
  return findAllListings();
}

export async function approvePendingListing(listingId, adminId) {
  const listing = await findListingForAdmin(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  if (!listing.active) {
    throw new ApiError(400, 'Deleted listings cannot be approved.');
  }

  if (listing.status !== 'pending') {
    throw new ApiError(
      400,
      `Only pending listings can be approved. This listing is ${listing.status}.`,
    );
  }

  return approveListing(listingId, adminId);
}

export async function rejectPendingListing(listingId, adminId, reason) {
  const listing = await findListingForAdmin(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  if (!listing.active) {
    throw new ApiError(400, 'Deleted listings cannot be rejected.');
  }

  if (listing.status !== 'pending') {
    throw new ApiError(
      400,
      `Only pending listings can be rejected. This listing is ${listing.status}.`,
    );
  }

  return rejectListing(listingId, adminId, reason?.trim());
}

export async function removeListing(listingId) {
  const listing = await findListingForAdmin(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found.');
  }

  if (!listing.active) {
    throw new ApiError(400, 'This listing is already removed.');
  }

  return softDeleteListingAsAdmin(listingId);
}