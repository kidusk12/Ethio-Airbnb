import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../widgets/contact_form_dialog.dart';

/// Single-page Help Center with FAQs and support contacts.
class HelpSupportPage extends StatelessWidget {
  const HelpSupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('Help Center'),
        backgroundColor: AppColors.surfaceElevated,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('How can we help?', style: AppTextStyles.displayMedium),
            const SizedBox(height: 8),
            Text(
              'Find answers to common questions or reach out to our team.',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: 24),

            // Contact Banner Card
            InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => showDialog(
                context: context,
                builder: (context) => const ContactFormDialog(),
              ),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.headset_mic_outlined,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '24/7 Support Team',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.primaryDark,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Tap to send us a message',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right, color: AppColors.primaryDark),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),

            Text('Frequently Asked Questions', style: AppTextStyles.titleLarge),
            const SizedBox(height: 12),

            const _FaqTile(
              question: 'How do I book a stay?',
              answer:
                  'Browse listings on the Home or Explore tab, choose your check-in and check-out dates on the listing details page, and tap Reserve.',
            ),
            const _FaqTile(
              question: 'How do I become a host?',
              answer:
                  'Tap "Become a Host" from the Home page or register as a host. Follow the simple 10-step wizard to list your property.',
            ),
            const _FaqTile(
              question: 'What currency is used for payments?',
              answer:
                  'All pricing and payments on EthioStays are in Ethiopian Birr (ETB).',
            ),
            const _FaqTile(
              question: 'Can I cancel my reservation?',
              answer:
                  'Yes, you can view and cancel upcoming bookings directly in your Bookings tab subject to the host cancellation policy.',
            ),
          ],
        ),
      ),
    );
  }
}

class _FaqTile extends StatelessWidget {
  final String question;
  final String answer;

  const _FaqTile({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: Text(
          question,
          style: AppTextStyles.titleMedium.copyWith(fontSize: 15),
        ),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: [Text(answer, style: AppTextStyles.bodyMedium)],
      ),
    );
  }
}
