import 'package:flutter/material.dart';

import '../../app/theme/app_text_styles.dart';

/// "Section title ... See all" header pattern, reused across home,
/// explore, and any future browse-style page.
class SectionHeader extends StatelessWidget {
  final String overline;
  final String title;
  final String? actionLabel;
  final VoidCallback? onActionTap;

  const SectionHeader({
    super.key,
    required this.overline,
    required this.title,
    this.actionLabel,
    this.onActionTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(overline, style: AppTextStyles.overline),
              const SizedBox(height: 4),
              Text(title, style: AppTextStyles.headlineSmall),
            ],
          ),
        ),
        if (actionLabel != null)
          GestureDetector(
            onTap: onActionTap,
            child: Text(actionLabel!, style: AppTextStyles.link),
          ),
      ],
    );
  }
}