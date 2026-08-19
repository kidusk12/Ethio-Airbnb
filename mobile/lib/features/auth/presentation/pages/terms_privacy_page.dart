import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';

/// Terms of Service and Privacy Policy page.
class TermsPrivacyPage extends StatelessWidget {
  const TermsPrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('Terms & Privacy'),
        backgroundColor: AppColors.surfaceElevated,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Terms of Service', style: AppTextStyles.displayMedium),
              const SizedBox(height: 12),
              Text(
                'Welcome to EthioStays. By using our application, you agree to comply with our terms and guidelines for booking and hosting properties in Ethiopia.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: 24),

              Text('1. User Responsibilities', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Text(
                'Guests agree to treat properties with care and follow house rules specified by hosts. Hosts ensure listed properties are accurate and safe for guests.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: 20),

              Text('2. Privacy Policy', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Text(
                'We respect your privacy. Personal data including your name, email, and identification documents are securely stored and encrypted.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: 20),

              Text('3. Payments & Cancellations', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Text(
                'All transactions are processed in ETB. Cancellation terms vary by listing and are displayed prior to booking confirmation.',
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
