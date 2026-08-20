import { success } from '../../utils/apiResponse.js';
import { toAdminDuePayoutDto } from './payout.dto.js';
import * as payoutService from './payout.service.js';

export async function duePayouts(req, res, next) {
  try {
    const payouts = await payoutService.getDuePayouts();

    return success(res, {
      data: { payouts: payouts.map(toAdminDuePayoutDto) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function markPaid(req, res, next) {
  try {
    const result = await payoutService.markPayoutPaid(
      req.user.id,
      req.params.id,
      req.body.transactionCode,
    );

    return success(res, {
      message: 'Payout marked as paid.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}