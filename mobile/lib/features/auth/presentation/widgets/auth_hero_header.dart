import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';

/// Top hero image with the app name, tagline, and city list overlaid.
/// Shared by register_page.dart and login_page.dart so the two screens
/// stay visually identical above the fold.
class AuthHeroHeader extends StatelessWidget {
  const AuthHeroHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 320,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/hero_stay.png',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) =>
                Container(color: AppColors.textPrimary),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: AppColors.heroImageOverlay,
              ),
            ),
          ),
          Positioned(
            left: 24,
            right: 24,
            bottom: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    style: AppTextStyles.heroTitle,
                    children: const [
                      TextSpan(text: 'Sheba'),
                      TextSpan(
                        text: 'Stays',
                        style: TextStyle(color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Stays hosted by people who live there.',
                  style: AppTextStyles.heroSubtitle,
                ),
                const SizedBox(height: 4),
                Text(
                  'Addis Ababa · Hawassa · Bahir Dar · Lalibela · Dire Dawa',
                  style: AppTextStyles.heroCaption,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}