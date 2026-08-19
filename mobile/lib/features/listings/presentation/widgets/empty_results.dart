import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';

class EmptyResults extends StatelessWidget {
  final VoidCallback onClearFilters;

  const EmptyResults({super.key, required this.onClearFilters});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.search, color: AppColors.primary, size: 24),
          ),
          const SizedBox(height: 16),
          Text('No stays found', style: AppTextStyles.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'Try changing your filters or searching for another location.',
            style: AppTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 180,
            child: PrimaryButton(label: 'Clear filters', onPressed: onClearFilters),
          ),
        ],
      ),
    );
  }
}