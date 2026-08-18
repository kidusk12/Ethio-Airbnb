import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_text_styles.dart';
import 'host_dashboard_providers.dart';

class HostDashboardTabs extends ConsumerWidget {
  const HostDashboardTabs({super.key});

  static const _tabs = [
    (HostDashboardTab.overview, 'Overview', Icons.home_outlined),
    (HostDashboardTab.listings, 'Listings', Icons.list_alt_outlined),
    (HostDashboardTab.earnings, 'Earnings', Icons.account_balance_wallet_outlined),
    (HostDashboardTab.reviews, 'Reviews', Icons.star_outline),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeTab = ref.watch(hostDashboardTabProvider);

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _tabs.map((tabData) {
        final (tab, label, icon) = tabData;
        final selected = tab == activeTab;

        return ChoiceChip(
          label: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: selected
                    ? AppColors.textOnPrimary
                    : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTextStyles.bodySmall.copyWith(
                  color: selected
                      ? AppColors.textOnPrimary
                      : AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          selected: selected,
          selectedColor: AppColors.primary,
          backgroundColor: AppColors.chipBackground,
          onSelected: (_) {
            ref.read(hostDashboardTabProvider.notifier).state = tab;
          },
        );
      }).toList(),
    );
  }
}