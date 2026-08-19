import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';

class HostCtaBanner extends StatelessWidget {
  final VoidCallback onStartHosting;

  const HostCtaBanner({super.key, required this.onStartHosting});

  static const _bullets = ['Free to list', 'Host protection tools', 'Payouts in ETB'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.chipBackground,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Become a host', style: AppTextStyles.overline),
          const SizedBox(height: 6),
          Text('Turn your space into income.', style: AppTextStyles.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'List an apartment, villa or a single room. Set your own price, '
            'control your calendar, and get paid after each stay.',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 12),
          ..._bullets.map(
            (b) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, size: 16, color: AppColors.success),
                  const SizedBox(width: 8),
                  Text(b, style: AppTextStyles.bodyMedium),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          PrimaryButton(label: 'Start hosting', onPressed: onStartHosting),
        ],
      ),
    );
  }
}