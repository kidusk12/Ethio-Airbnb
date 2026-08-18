import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_text_styles.dart';

class HostStatCard extends StatelessWidget {
  final String label;
  final String value;
  final String helper;
  final IconData icon;
  final bool compact;

  const HostStatCard({
    super.key,
    required this.label,
    required this.value,
    required this.helper,
    required this.icon,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(compact ? 16 : 20),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: compact
                      ? AppTextStyles.bodySmall
                      : AppTextStyles.bodyMedium,
                ),
              ),
              Icon(
                icon,
                size: compact ? 19 : 22,
                color: AppColors.primary,
              ),
            ],
          ),
          SizedBox(height: compact ? 14 : 18),
          Text(
            value,
            style: compact
                ? AppTextStyles.displayMedium
                : AppTextStyles.displayLarge,
          ),
          const SizedBox(height: 6),
          Text(
            helper,
            style: AppTextStyles.bodySmall,
            maxLines: compact ? 2 : null,
            overflow: compact ? TextOverflow.ellipsis : null,
          ),
        ],
      ),
    );
  }
}