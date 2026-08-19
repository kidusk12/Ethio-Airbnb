import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'admin_dashboard_provider.dart';
import '../../domain/entities/payout_record.dart';
import '../../domain/entities/transaction_log_entry.dart';

/// Coordinates actions that span multiple admin providers.
///
/// TEMPORARY: this orchestration exists only because there's no backend
/// yet. Confirming a payment or marking a payout paid should eventually
/// be a single server-side transactional operation. Right now it's three
/// separate client-side state mutations in sequence — do not treat this
/// class as a pattern to extend, it's scaffolding to delete once the
/// backend exists.
class AdminActionsCoordinator {
  AdminActionsCoordinator(this._ref);
  final Ref _ref;

  /// [transactionCode] must be the real bank/mobile-banking reference the
  /// admin manually entered — never generated here.
  void confirmPayment({
    required String paymentId,
    required String transactionCode,
    required double commissionRate,
  }) {
    final code = transactionCode.trim();
    if (code.isEmpty) {
      throw ArgumentError('Transaction code is required to confirm a payment.');
    }

    final payments = _ref.read(pendingPaymentsProvider);
    final payment = payments.firstWhere((p) => p.id == paymentId);

    _ref
        .read(pendingPaymentsProvider.notifier)
        .confirm(paymentId, transactionCode: code);

    final payoutId = 'pyt_${DateTime.now().microsecondsSinceEpoch}';
    _ref.read(payoutsDueProvider.notifier).addPayout(
          PayoutRecord(
            id: payoutId,
            hostId: payment.hostId,
            hostName: payment.hostName,
            bookingId: payment.bookingId,
            bookingAmount: payment.amount,
            commissionRate: commissionRate,
            paymentConfirmedAt: DateTime.now(),
          ),
        );

    final logId = 'txn_${DateTime.now().microsecondsSinceEpoch}';
    _ref.read(transactionLogProvider.notifier).state = [
      ..._ref.read(transactionLogProvider),
      TransactionLogEntry(
        id: logId,
        type: TransactionType.userPayment,
        transactionCode: code,
        counterpartyName: payment.userName,
        amount: payment.amount,
        timestamp: DateTime.now(),
        bookingId: payment.bookingId,
        relatedReceiptOrProofUrl: payment.receiptImageUrl,
      ),
    ];
  }

  /// [transactionCode] must be the real bank/mobile-banking reference the
  /// admin manually entered when paying the host — never generated.
  void markPayoutPaid({
    required String payoutId,
    required String transactionCode,
  }) {
    final code = transactionCode.trim();
    if (code.isEmpty) {
      throw ArgumentError(
        'Transaction code is required to mark a payout as paid.',
      );
    }

    final payouts = _ref.read(payoutsDueProvider);
    final payout = payouts.firstWhere((p) => p.id == payoutId);

    _ref
        .read(payoutsDueProvider.notifier)
        .markPaid(payoutId, transactionCode: code);

    final logId = 'txn_${DateTime.now().microsecondsSinceEpoch}';
    _ref.read(transactionLogProvider.notifier).state = [
      ..._ref.read(transactionLogProvider),
      TransactionLogEntry(
        id: logId,
        type: TransactionType.hostPayout,
        transactionCode: code,
        counterpartyName: payout.hostName,
        amount: payout.hostShare,
        timestamp: DateTime.now(),
        bookingId: payout.bookingId,
      ),
    ];
  }
}

final adminActionsCoordinatorProvider = Provider<AdminActionsCoordinator>(
  (ref) => AdminActionsCoordinator(ref),
);