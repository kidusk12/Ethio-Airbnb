import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';

/// About page — static company info matching the web footer link.
class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('About EthioStays'),
        backgroundColor: AppColors.surfaceElevated,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.home_outlined,
                      color: AppColors.primary,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 12),
                  RichText(
                    text: TextSpan(
                      style: AppTextStyles.displayMedium,
                      children: const [
                        TextSpan(text: 'Ethio'),
                        TextSpan(
                          text: 'Stays',
                          style: TextStyle(color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'Stays across Ethiopia, hosted by people who live there. Book with clear prices in ETB.',
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 20),
              Text('Our Mission', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Text(
                'EthioStays connects travellers with authentic Ethiopian stays and hospitality while empowering local hosts across Addis Ababa, Hawassa, Bahir Dar, Gondar, and beyond to share their unique spaces.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: 20),
              Text('Why EthioStays?', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Text(
                '• Transparent pricing in Ethiopian Birr (ETB) with no hidden conversion rates.\n'
                '• Verified local hosts and secure booking verification.\n'
                '• Diverse accommodation options from modern city apartments to scenic villas.',
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
