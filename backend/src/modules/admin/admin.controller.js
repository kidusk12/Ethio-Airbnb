import { success } from '../../utils/apiResponse.js';
import { toAdminListingDto } from './admin.dto.js';
import * as adminService from './admin.service.js';

export async function getPendingListings(req, res, next) {
  try {
    const listings = await adminService.getPendingListings();

    return success(res, {
      data: {
        listings: listings.map(toAdminListingDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAllListings(req, res, next) {
  try {
    const listings = await adminService.getAllListings();

    return success(res, {
      data: {
        listings: listings.map(toAdminListingDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function approveListing(req, res, next) {
  try {
    const listing = await adminService.approvePendingListing(
      req.params.id,
      req.user.id,
    );

    return success(res, {
      message: 'Listing approved successfully.',
      data: listing,
    });
  } catch (error) {
    return next(error);
  }
}

export async function rejectListing(req, res, next) {
  try {
    const listing = await adminService.rejectPendingListing(
      req.params.id,
      req.user.id,
      req.body.reason,
    );

    return success(res, {
      message: 'Listing rejected successfully.',
      data: listing,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteListing(req, res, next) {
  try {
    const listing = await adminService.removeListing(req.params.id);

    return success(res, {
      message: 'Listing removed successfully.',
      data: listing,
    });
  } catch (error) {
    return next(error);
  }
}