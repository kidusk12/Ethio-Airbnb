import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/fixtures/sample_admin_data.dart';
import '../../domain/entities/pending_listing.dart';
import '../../domain/entities/pending_payment.dart';
import '../../domain/entities/payout_record.dart';
import '../../domain/entities/transaction_log_entry.dart';

// --- Section state (replaces the old tab enum; drives the drawer + body) ---

enum AdminDashboardSection { listings, payments, payoutsDue, transactionLog }

extension AdminDashboardSectionX on AdminDashboardSection {
  String get title => switch (this) {
        AdminDashboardSection.listings => 'Listings approval',
        AdminDashboardSection.payments => 'Payments verification',
        AdminDashboardSection.payoutsDue => 'Payouts due',
        AdminDashboardSection.transactionLog => 'Transaction log',
      };
}

final adminDashboardSectionProvider = StateProvider<AdminDashboardSection>(
  (ref) => AdminDashboardSection.listings,
);

// --- Pending listings: needs mutation (approve/reject), so StateNotifier ---

class PendingListingsNotifier extends StateNotifier<List<PendingListing>> {
  PendingListingsNotifier() : super(samplePendingListings);

  void approve(String id) {
    state = [
      for (final listing in state)
        if (listing.id == id)
          listing.copyWith(status: ListingApprovalStatus.approved)
        else
          listing,
    ];
  }

  void reject(String id, {String? reason}) {
    state = [
      for (final listing in state)
        if (listing.id == id)
          listing.copyWith(
            status: ListingApprovalStatus.rejected,
            rejectionReason: reason,
          )
        else
          listing,
    ];
  }
}

final pendingListingsProvider =
    StateNotifierProvider<PendingListingsNotifier, List<PendingListing>>(
  (ref) => PendingListingsNotifier(),
);

// --- Pending payments: confirm/reject action, 1hr SLA is display-only ---

class PendingPaymentsNotifier extends StateNotifier<List<PendingPayment>> {
  PendingPaymentsNotifier() : super(samplePendingPayments);

  void confirm(String id, {required String transactionCode}) {
    state = [
      for (final payment in state)
        if (payment.id == id)
          payment.copyWith(
            status: PaymentConfirmationStatus.confirmed,
            confirmedAt: DateTime.now(),
            transactionCode: transactionCode,
          )
        else
          payment,
    ];
  }

  void reject(String id) {
    state = [
      for (final payment in state)
        if (payment.id == id)
          payment.copyWith(status: PaymentConfirmationStatus.rejected)
        else
          payment,
    ];
  }
}

final pendingPaymentsProvider =
    StateNotifierProvider<PendingPaymentsNotifier, List<PendingPayment>>(
  (ref) => PendingPaymentsNotifier(),
);

// --- Payouts due: mark-paid action, 24hr SLA is display-only ---

class PayoutsDueNotifier extends StateNotifier<List<PayoutRecord>> {
  PayoutsDueNotifier() : super(samplePayoutsDue);

  void addPayout(PayoutRecord payout) {
    state = [...state, payout];
  }

  void markPaid(String id, {required String transactionCode}) {
    state = [
      for (final payout in state)
        if (payout.id == id)
          payout.copyWith(
            status: PayoutStatus.paid,
            paidAt: DateTime.now(),
            transactionCode: transactionCode,
          )
        else
          payout,
    ];
  }
}

final payoutsDueProvider =
    StateNotifierProvider<PayoutsDueNotifier, List<PayoutRecord>>(
  (ref) => PayoutsDueNotifier(),
);

// --- Transaction log: read-only for v1, plain StateProvider is enough ---

final transactionLogProvider = StateProvider<List<TransactionLogEntry>>(
  (ref) => sampleTransactionLog,
);