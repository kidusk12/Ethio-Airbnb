import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';

/// The actual Terms & Conditions body — shared between the standalone
/// `/legal/terms` page and anywhere else it needs to be shown in full
/// (e.g. the guest registration agree-flow). Keeping the content in one
/// place means both spots stay in sync automatically.
class TermsContent extends StatelessWidget {
  const TermsContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Ethio-Airbnb — Terms & Conditions',
          style: AppTextStyles.displayMedium,
        ),
        const SizedBox(height: 6),
        Text(
          'Last updated: August 2026 · Version 1.1',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        Text(
          'This document applies to everyone using Ethio-Airbnb — whether '
          'you\'re listing a property as a Host or booking a stay as a '
          'Guest. Both parties read and agree to the same terms, so each '
          'side knows exactly what the other has committed to.',
          style: AppTextStyles.bodyMedium,
        ),
        const SizedBox(height: 24),

        _Section(
          number: '1',
          title: 'Overview',
          body:
              'Ethio-Airbnb is a platform that connects Hosts who want to '
              'rent out properties with Guests looking for short-term '
              'accommodation. Ethio-Airbnb does not own, manage, or inspect '
              'any listed property — we provide the platform that connects '
              'both parties and facilitates payment verification between '
              'them.\n\nBy creating an account, listing a property, or '
              'making a booking, you agree to the terms below.',
        ),

        _Section(
          number: '2',
          title: 'Host Responsibilities & Rights',
          body: null,
          children: [
            Text('As a Host, you agree to:', style: AppTextStyles.titleMedium),
            const SizedBox(height: 8),
            const _BulletList([
              'Provide accurate, honest information about your property (location, price, description, photos)',
              'Honor confirmed bookings — cancelling a confirmed booking without a valid reason may result in account restrictions',
              'Respond to booking requests and guest communication in a timely manner',
              'Keep your listing up to date, including marking it inactive if it\'s no longer available',
            ]),
            const SizedBox(height: 16),
            Text(
              'As a Host, you have the right to:',
              style: AppTextStyles.titleMedium,
            ),
            const SizedBox(height: 8),
            const _BulletList([
              'Set your own price per night',
              'Edit or remove your listing at any time',
              'Receive payout for completed, verified bookings (see Section 4)',
              'Report a Guest for violating these terms',
            ]),
          ],
        ),

        _Section(
          number: '3',
          title: 'Guest Responsibilities & Rights',
          body: null,
          children: [
            Text('As a Guest, you agree to:', style: AppTextStyles.titleMedium),
            const SizedBox(height: 8),
            const _BulletList([
              'Provide accurate payment proof for any booking you make',
              'Respect the property and any rules set by the Host during your stay',
              'Complete payment within the required timeframe for a booking to remain valid',
              'Not attempt to submit fraudulent or falsified payment proof',
            ]),
            const SizedBox(height: 16),
            Text(
              'As a Guest, you have the right to:',
              style: AppTextStyles.titleMedium,
            ),
            const SizedBox(height: 8),
            const _BulletList([
              'Cancel a booking within the 24-hour hold window for a full refund (see Section 4)',
              'Expect the property to reasonably match its listing description',
              'Leave a review after a completed stay',
              'Report a Host for violating these terms',
            ]),
          ],
        ),

        _Section(
          number: '4',
          title: 'Payments & Cancellations',
          body: 'Ethio-Airbnb uses a manual, verified payment process:',
          children: [
            const SizedBox(height: 8),
            const _NumberedList([
              'When you confirm a booking, you\'ll be shown the platform\'s payment account details, the exact amount due, and a unique reference code for that booking.',
              'After transferring payment externally, you upload proof (a screenshot or transaction reference).',
              'Your booking status becomes Awaiting Confirmation while an admin reviews your payment proof — this review typically happens within about an hour.',
              'Once approved, your booking becomes Confirmed, and a 24-hour cancellation window begins. This is the only point at which cancellation is possible:',
            ]),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.only(left: 12),
              child: _BulletList([
                'If you cancel within this 24-hour window, this is a normal, legal option — the platform is still holding your payment and has not yet paid the Host, so you receive a full refund.',
                'Once the 24-hour window closes, the booking can no longer be cancelled. At that point the booking becomes eligible for Host payout, and the platform transfers the Host\'s share (rental price minus platform commission) directly, logging proof of that transfer the same way your payment was logged.',
              ]),
            ),
            const SizedBox(height: 12),
            Text(
              'Every payment and payout is logged with a reference number, '
              'timestamp, amount, and the admin who verified it — creating '
              'a full record for both parties in case of a dispute.',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),

        _Section(
          number: '5',
          title: 'Prohibited Conduct',
          body:
              'The following are not allowed on Ethio-Airbnb, by either Hosts or Guests:',
          children: [
            const SizedBox(height: 8),
            const _BulletList([
              'Creating fake listings or fake bookings',
              'Submitting falsified or altered payment proof',
              'Harassment, discrimination, or abusive communication toward another user',
              'Attempting to bypass the platform\'s payment and verification process',
              'Misrepresenting your identity or the property being listed',
            ]),
            const SizedBox(height: 12),
            Text(
              'Violations may result in booking cancellation, listing '
              'removal, or account suspension.',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),

        _Section(
          number: '6',
          title: 'Platform\'s Role & Liability',
          body:
              'Ethio-Airbnb facilitates connections and payment verification between Hosts and Guests but is not responsible for:',
          children: [
            const SizedBox(height: 8),
            const _BulletList([
              'The condition, safety, or legality of any listed property',
              'Disputes about a Guest\'s conduct during a stay, beyond what is covered by this agreement',
              'Delays caused by incorrect payment details or unclear payment proof submitted by a user',
            ]),
            const SizedBox(height: 12),
            Text(
              'Ethio-Airbnb will act in good faith to review disputes and '
              'payment issues fairly, using the transaction records '
              'described in Section 4.',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),

        _Section(
          number: '7',
          title: 'Agreement Acknowledgment',
          body:
              'By clicking "I Agree," you confirm that you have read and '
              'understood this document, and agree to the responsibilities '
              'and rights described above for your role (Host or Guest) on '
              'Ethio-Airbnb.',
          isLast: true,
        ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  final String number;
  final String title;
  final String? body;
  final List<Widget>? children;
  final bool isLast;

  const _Section({
    required this.number,
    required this.title,
    this.body,
    this.children,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$number. $title', style: AppTextStyles.titleLarge),
          const SizedBox(height: 8),
          if (body != null) Text(body!, style: AppTextStyles.bodyMedium),
          if (children != null) ...children!,
        ],
      ),
    );
  }
}

class _BulletList extends StatelessWidget {
  final List<String> items;

  const _BulletList(this.items);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items
          .map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('•  ', style: AppTextStyles.bodyMedium),
                  Expanded(child: Text(item, style: AppTextStyles.bodyMedium)),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _NumberedList extends StatelessWidget {
  final List<String> items;

  const _NumberedList(this.items);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items
          .asMap()
          .entries
          .map(
            (entry) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${entry.key + 1}.  ', style: AppTextStyles.bodyMedium),
                  Expanded(
                    child: Text(entry.value, style: AppTextStyles.bodyMedium),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
