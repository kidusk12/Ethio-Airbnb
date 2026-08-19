import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../providers/explore_providers.dart';

class SortBottomSheet extends ConsumerWidget {
  const SortBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentSort = ref.watch(exploreControllerProvider).sortBy;
    final controller = ref.read(exploreControllerProvider.notifier);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text('Sort by', style: AppTextStyles.titleLarge),
            ),
            const SizedBox(height: 8),
            ...SortOption.values.map((option) {
              final selected = option == currentSort;
              return ListTile(
                title: Text(option.label, style: AppTextStyles.bodyLarge),
                trailing: selected ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  controller.setSortBy(option);
                  Navigator.of(context).pop();
                },
              );
            }),
          ],
        ),
      ),
    );
  }
}