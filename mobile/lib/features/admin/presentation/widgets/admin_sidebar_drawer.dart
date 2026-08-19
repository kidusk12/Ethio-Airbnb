import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/pending_listing.dart';
import '../../domain/entities/pending_payment.dart';
import '../../domain/entities/payout_record.dart';
import '../providers/admin_dashboard_provider.dart';

class AdminSidebarDrawer extends ConsumerWidget {
  const AdminSidebarDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeSection = ref.watch(adminDashboardSectionProvider);
    final listings = ref.watch(pendingListingsProvider);
    final payments = ref.watch(pendingPaymentsProvider);
    final payouts = ref.watch(payoutsDueProvider);

    final pendingListingsCount =
        listings.where((l) => l.status == ListingApprovalStatus.pending).length;
    final pendingPayments =
        payments.where((p) => p.status == PaymentConfirmationStatus.pending);
    final duePayouts = payouts.where((p) => p.status == PayoutStatus.due);

    final paymentsOverdue = pendingPayments.any((p) => p.isOverdue);
    final payoutsOverdue = duePayouts.any((p) => p.isOverdue);

    return Drawer(
      backgroundColor: AppColors.surfaceElevated,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'A',
                      style: TextStyle(
                        color: AppColors.textOnPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Admin', style: AppTextStyles.titleMedium),
                        const SizedBox(height: 2),
                        Text(
                          'Administrator',
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                children: [
                  _NavItem(
                    icon: Icons.home_work_outlined,
                    label: 'Listings approval',
                    selected: activeSection == AdminDashboardSection.listings,
                    badgeCount: pendingListingsCount,
                    onTap: () => _select(context, ref, AdminDashboardSection.listings),
                  ),
                  _NavItem(
                    icon: Icons.receipt_long_outlined,
                    label: 'Payments verification',
                    selected: activeSection == AdminDashboardSection.payments,
                    badgeCount: pendingPayments.length,
                    badgeColor: paymentsOverdue
                        ? AppColors.error
                        : (pendingPayments.isNotEmpty ? AppColors.warning : null),
                    onTap: () => _select(context, ref, AdminDashboardSection.payments),
                  ),
                  _NavItem(
                    icon: Icons.payments_outlined,
                    label: 'Payouts due',
                    selected: activeSection == AdminDashboardSection.payoutsDue,
                    badgeCount: duePayouts.length,
                    badgeColor: payoutsOverdue
                        ? AppColors.error
                        : (duePayouts.isNotEmpty ? AppColors.warning : null),
                    onTap: () => _select(context, ref, AdminDashboardSection.payoutsDue),
                  ),
                  _NavItem(
                    icon: Icons.history_outlined,
                    label: 'Transaction log',
                    selected: activeSection == AdminDashboardSection.transactionLog,
                    onTap: () =>
                        _select(context, ref, AdminDashboardSection.transactionLog),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: _NavItem(
                icon: Icons.logout,
                label: 'Log out',
                selected: false,
                iconColor: AppColors.error,
                labelColor: AppColors.error,
                onTap: () {
                  Navigator.of(context).pop();
                  context.go('/login');
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _select(BuildContext context, WidgetRef ref, AdminDashboardSection section) {
    ref.read(adminDashboardSectionProvider.notifier).state = section;
    Navigator.of(context).pop();
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badgeCount,
    this.badgeColor,
    this.iconColor,
    this.labelColor,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final int? badgeCount;
  final Color? badgeColor;
  final Color? iconColor;
  final Color? labelColor;

  @override
  Widget build(BuildContext context) {
    final fg = selected
        ? AppColors.textOnPrimary
        : (iconColor ?? labelColor ?? AppColors.textPrimary);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Material(
        color: selected ? AppColors.primary : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(icon, size: 20, color: selected ? fg : (iconColor ?? AppColors.textSecondary)),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: selected ? fg : (labelColor ?? AppColors.textPrimary),
                      fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
                if (badgeCount != null && badgeCount! > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.textOnPrimary.withOpacity(0.2)
                          : (badgeColor ?? AppColors.primary).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$badgeCount',
                      style: AppTextStyles.caption.copyWith(
                        color: selected ? fg : (badgeColor ?? AppColors.primary),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}