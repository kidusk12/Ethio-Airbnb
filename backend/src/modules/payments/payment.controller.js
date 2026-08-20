import { success } from '../../utils/apiResponse.js';
import { toAdminPendingPaymentDto, toPaymentStatusDto } from './payment.dto.js';
import * as paymentService from './payment.service.js';

export async function submitReceipt(req, res, next) {
  try {
    const payment = await paymentService.submitPaymentReceipt(
      req.user.id,
      req.params.id,
      req.body.receiptImageUrl,
    );

    return success(res, {
      status: 201,
      data: {
        paymentId: payment.id,
        bookingId: payment.booking_id,
        status: payment.status,
        submittedAt: payment.submitted_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function paymentStatus(req, res, next) {
  try {
    const status = await paymentService.getPaymentStatus(
      req.user.id,
      req.params.id,
    );

    return success(res, { data: toPaymentStatusDto(status) });
  } catch (error) {
    return next(error);
  }
}

export async function pendingPayments(req, res, next) {
  try {
    const payments = await paymentService.getPendingPaymentsQueue();

    return success(res, {
      data: { payments: payments.map(toAdminPendingPaymentDto) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function confirm(req, res, next) {
  try {
    const result = await paymentService.confirmPayment(
      req.user.id,
      req.params.id,
      req.body.transactionCode,
    );

    return success(res, {
      message: 'Payment confirmed.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reject(req, res, next) {
  try {
    const result = await paymentService.rejectPayment(
      req.user.id,
      req.params.id,
      req.body.reason,
    );

    return success(res, {
      message:
        'Payment rejected. The guest can submit a new receipt before the deadline.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}