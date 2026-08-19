import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../providers/admin_dashboard_provider.dart';
import '../widgets/admin_sidebar_drawer.dart';
import '../widgets/admin_listing_approval_card.dart';
import '../widgets/admin_payment_confirmation_card.dart';
import '../widgets/admin_payout_due_card.dart';
import '../widgets/admin_transaction_log_entry_card.dart';

class AdminDashboardPage extends ConsumerWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final section = ref.watch(adminDashboardSectionProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(title: Text(section.title)),
      drawer: const AdminSidebarDrawer(),
      body: _AdminSectionContent(section: section),
    );
  }
}

class _AdminSectionContent extends ConsumerWidget {
  const _AdminSectionContent({required this.section});
  final AdminDashboardSection section;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    switch (section) {
      case AdminDashboardSection.listings:
        final listings = ref.watch(pendingListingsProvider);
        if (listings.isEmpty) {
          return const _EmptyState(message: 'No pending listings.');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: listings.length,
          itemBuilder: (context, i) =>
              AdminListingApprovalCard(listing: listings[i]),
        );

      case AdminDashboardSection.payments:
        final payments = ref.watch(pendingPaymentsProvider);
        if (payments.isEmpty) {
          return const _EmptyState(message: 'No pending payments.');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: payments.length,
          itemBuilder: (context, i) =>
              AdminPaymentConfirmationCard(payment: payments[i]),
        );

      case AdminDashboardSection.payoutsDue:
        final payouts = ref.watch(payoutsDueProvider);
        if (payouts.isEmpty) {
          return const _EmptyState(message: 'No payouts due.');
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: payouts.length,
          itemBuilder: (context, i) => AdminPayoutDueCard(payout: payouts[i]),
        );

      case AdminDashboardSection.transactionLog:
        final log = ref.watch(transactionLogProvider);
        if (log.isEmpty) {
          return const _EmptyState(message: 'No transactions logged yet.');
        }
        final sorted = [...log]
          ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: sorted.length,
          itemBuilder: (context, i) =>
              AdminTransactionLogEntryCard(entry: sorted[i]),
        );
    }
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(message, style: TextStyle(color: AppColors.textMuted)),
    );
  }
}
