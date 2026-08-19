import { success } from '../../utils/apiResponse.js';
import {
  toListingDetailDto,
  toListingSummaryDto,
  toMyListingDto,
} from './listing.dto.js';
import * as listingService from './listing.service.js';

export async function create(req, res, next) {
  try {
    const listing = await listingService.submitListing(req.user.id, req.body);

    return success(res, {
      status: 201,
      message: 'Listing submitted for approval.',
      data: {
        id: listing.id,
        status: listing.status,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyListings(req, res, next) {
  try {
    const listings = await listingService.getMyListings(req.user.id);

    return success(res, {
      data: {
        listings: listings.map(toMyListingDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllPublic(req, res, next) {
  try {
    const result = await listingService.getPublicListings(req.query);

    return success(res, {
      data: {
        listings: result.listings.map(toListingSummaryDto),
        page: result.page,
        totalPages: result.totalPages,
        totalResults: result.totalResults,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOnePublic(req, res, next) {
  try {
    const listing = await listingService.getPublicListingDetail(req.params.id);

    return success(res, {
      data: toListingDetailDto(listing),
    });
  } catch (error) {
    return next(error);
  }
}

export async function update(req, res, next) {
  try {
    const listing = await listingService.editListing(
      req.user.id,
      req.params.id,
      req.body,
    );

    return success(res, {
      message: 'Listing updated successfully.',
      data: toMyListingDto(listing),
    });
  } catch (error) {
    return next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await listingService.removeListing(req.user.id, req.params.id);

    return success(res, {
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    return next(error);
  }
}