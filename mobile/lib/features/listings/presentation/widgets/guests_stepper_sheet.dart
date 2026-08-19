import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/explore_providers.dart';

class GuestsStepperSheet extends ConsumerWidget {
  const GuestsStepperSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final guests = ref.watch(exploreControllerProvider).guests;
    final controller = ref.read(exploreControllerProvider.notifier);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Guests', style: AppTextStyles.titleLarge),
                    Text('Adults and children', style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
              _StepperButton(
                icon: Icons.remove,
                onTap: guests > 1 ? controller.decrementGuests : null,
              ),
              SizedBox(
                width: 32,
                child: Text('$guests', textAlign: TextAlign.center, style: AppTextStyles.titleMedium),
              ),
              _StepperButton(icon: Icons.add, onTap: controller.incrementGuests),
            ],
          ),
          const SizedBox(height: 20),
          PrimaryButton(label: 'Done', onPressed: () => Navigator.of(context).pop()),
        ],
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _StepperButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      style: IconButton.styleFrom(
        side: const BorderSide(color: AppColors.border),
        shape: const CircleBorder(),
        foregroundColor: AppColors.textPrimary,
        disabledForegroundColor: AppColors.textMuted,
      ),
    );
  }
}