import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../auth/presentation/providers/auth_providers.dart';
import '../data/fixtures/sample_host_data.dart';
import '../domain/entities/host_listing.dart';
import 'host_dashboard_providers.dart';
import 'host_dashboard_tabs.dart';
import 'host_stat_card.dart';

class HostDashboardPage extends ConsumerWidget {
  const HostDashboardPage({super.key});

  void _openPropertyWizard(BuildContext context) {
    context.push('/host/list');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final firstName =
        authState is AuthSuccess ? authState.user.firstName : 'there';

    final listings = SampleHostData.listings;
    final activeTab = ref.watch(hostDashboardTabProvider);
    final tabController = ref.read(hostDashboardTabProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'hostAddPropertyButton',
        onPressed: () => _openPropertyWizard(context),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        icon: const Icon(Icons.add_home_outlined),
        label: const Text('Add property'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          children: [
            Text(
              'HOSTING',
              style: AppTextStyles.overline.copyWith(
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Welcome back, $firstName',
              style: AppTextStyles.displayLarge,
            ),
            const SizedBox(height: 6),
            Text(
              'Manage your places and bookings.',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: 24),

            HostStatCard(
              label: 'Total earnings',
              value: 'ETB ${SampleHostData.totalEarnings.toStringAsFixed(0)}',
              helper: 'Your earnings from listed properties',
              icon: Icons.account_balance_wallet_outlined,
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: HostStatCard(
                    label: 'Active listings',
                    value: '${listings.length}',
                    helper:
                        '${listings.length} ${listings.length == 1 ? 'property' : 'properties'}',
                    icon: Icons.apartment_outlined,
                    compact: true,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: HostStatCard(
                    label: 'Review score',
                    value: SampleHostData.reviewScore.toStringAsFixed(2),
                    helper: 'Guest rating',
                    icon: Icons.star_outline,
                    compact: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            const HostDashboardTabs(),
            const SizedBox(height: 20),

            switch (activeTab) {
              HostDashboardTab.overview => _OverviewSection(
                  listings: listings,
                  onViewAllListings: () {
                    tabController.state = HostDashboardTab.listings;
                  },
                  onViewReviews: () {
                    tabController.state = HostDashboardTab.reviews;
                  },
                ),
              HostDashboardTab.listings => _ListingsSection(
                  listings: listings,
                  onAddProperty: () => _openPropertyWizard(context),
                ),
              HostDashboardTab.earnings => const _EarningsSection(),
              HostDashboardTab.reviews => const _ReviewsSection(),
            },

            if (activeTab == HostDashboardTab.overview &&
                SampleHostData.recentBookings.isNotEmpty) ...[
              const SizedBox(height: 16),
              const _RecentBookingsSection(),
            ],
          ],
        ),
      ),
    );
  }
}

class _OverviewSection extends StatelessWidget {
  final List<HostListing> listings;
  final VoidCallback onViewAllListings;
  final VoidCallback onViewReviews;

  const _OverviewSection({
    required this.listings,
    required this.onViewAllListings,
    required this.onViewReviews,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _DashboardCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Your listings',
                      style: AppTextStyles.titleLarge,
                    ),
                  ),
                  TextButton(
                    onPressed: onViewAllListings,
                    child: const Text('View all'),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              ...listings.take(3).map(
                    (listing) => _ListingRow(listing: listing),
                  ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _DashboardCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.star_outline,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Reviews',
                      style: AppTextStyles.titleLarge,
                    ),
                  ),
                  TextButton(
                    onPressed: onViewReviews,
                    child: const Text('View reviews'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                SampleHostData.reviewScore.toStringAsFixed(2),
                style: AppTextStyles.displayLarge,
              ),
              const SizedBox(height: 4),
              Text(
                'Overall review score',
                style: AppTextStyles.bodySmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ListingsSection extends StatelessWidget {
  final List<HostListing> listings;
  final VoidCallback onAddProperty;

  const _ListingsSection({
    required this.listings,
    required this.onAddProperty,
  });

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Your listings', style: AppTextStyles.titleLarge),
          const SizedBox(height: 4),
          Text(
            'Manage the properties you are currently hosting.',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 12),
          ...listings.map((listing) => _ListingRow(listing: listing)),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onAddProperty,
            icon: const Icon(Icons.add),
            label: const Text('Add property'),
          ),
        ],
      ),
    );
  }
}

class _EarningsSection extends StatelessWidget {
  const _EarningsSection();

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.account_balance_wallet_outlined,
            color: AppColors.primary,
          ),
          const SizedBox(height: 14),
          Text('Earnings', style: AppTextStyles.titleLarge),
          const SizedBox(height: 4),
          Text(
            'Your hosting earnings at a glance.',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 18),
          Text(
            'ETB ${SampleHostData.totalEarnings.toStringAsFixed(0)}',
            style: AppTextStyles.displayLarge,
          ),
          const SizedBox(height: 4),
          Text(
            'Total earnings from your listed properties',
            style: AppTextStyles.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _ReviewsSection extends StatelessWidget {
  const _ReviewsSection();

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.star_outline, color: AppColors.primary),
          const SizedBox(height: 14),
          Text('Reviews', style: AppTextStyles.titleLarge),
          const SizedBox(height: 4),
          Text(
            'See what guests think about your stays.',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 18),
          Text(
            SampleHostData.reviewScore.toStringAsFixed(2),
            style: AppTextStyles.displayLarge,
          ),
          const SizedBox(height: 4),
          Text(
            'Overall review score',
            style: AppTextStyles.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _RecentBookingsSection extends StatelessWidget {
  const _RecentBookingsSection();

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Recent bookings', style: AppTextStyles.titleLarge),
          const SizedBox(height: 8),
          ...SampleHostData.recentBookings.map(
            (booking) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.guestName,
                          style: AppTextStyles.titleMedium,
                        ),
                        Text(
                          booking.propertyName,
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'ETB ${booking.amount.toStringAsFixed(0)}',
                    style: AppTextStyles.price,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ListingRow extends StatelessWidget {
  final HostListing listing;

  const _ListingRow({required this.listing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.network(
              listing.coverPhotoUrl,
              width: 48,
              height: 48,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) {
                return Container(
                  width: 48,
                  height: 48,
                  color: AppColors.chipBackground,
                  child: const Icon(
                    Icons.apartment_outlined,
                    color: AppColors.primary,
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  listing.title,
                  style: AppTextStyles.titleMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  listing.location,
                  style: AppTextStyles.bodySmall,
                ),
              ],
            ),
          ),
          Text(
            'ETB ${listing.pricePerNight.toStringAsFixed(0)}',
            style: AppTextStyles.price,
          ),
        ],
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final Widget child;

  const _DashboardCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}