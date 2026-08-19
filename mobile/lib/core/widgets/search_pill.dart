import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// The "Where to? / Anywhere · Any week · 2 guests" tappable search bar.
/// Purely presentational — pass onTap to decide what it does (navigate to
/// Explore, open a search sheet, etc.).
class SearchPill extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const SearchPill({
    super.key,
    this.title = 'Where to?',
    this.subtitle = 'Anywhere · Any week · 2 guests',
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(28),
      elevation: 4,
      shadowColor: Colors.black26,
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppColors.textPrimary),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTextStyles.titleMedium),
                    Text(subtitle, style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}