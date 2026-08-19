import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';

/// Renders "Xh Ym left" / "Xm left" / an overdue label, colored by how
/// much of the SLA window remains. Purely a display helper — it reads
/// timeRemaining off the entity, it does not decide or enforce anything.
class SlaCountdownText extends StatelessWidget {
  const SlaCountdownText({
    super.key,
    required this.remaining,
    required this.totalWindow,
    required this.isOverdue,
    required this.overdueLabel,
  });

  final Duration remaining;
  final Duration totalWindow;
  final bool isOverdue;
  final String overdueLabel;

  @override
  Widget build(BuildContext context) {
    if (isOverdue) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.warning_amber_rounded, size: 16, color: AppColors.error),
          const SizedBox(width: 4),
          Text(
            overdueLabel,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.error,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }

    final fractionLeft = remaining.inSeconds / totalWindow.inSeconds;
    final color = fractionLeft < 0.25 ? AppColors.warning : AppColors.textSecondary;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.schedule, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          '${_format(remaining)} left',
          style: AppTextStyles.bodySmall.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  String _format(Duration d) {
    if (d.inHours > 0) return '${d.inHours}h ${d.inMinutes.remainder(60)}m';
    return '${d.inMinutes}m';
  }
}