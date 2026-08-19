import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/search_pill.dart';
import '../../../../core/widgets/section_header.dart';
import '../../data/fixtures/sample_home_data.dart';
import '../widgets/category_row.dart';
import '../widgets/destination_card.dart';
import '../widgets/host_cta_banner.dart';
import '../widgets/listing_preview_card.dart';

/// Home tab — the landing page.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _HeroSection(
                onSearchTap: () => context.go('/explore'),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                child: SectionHeader(
                  overline: 'Popular destinations',
                  title: 'Where travellers are going',
                  actionLabel: 'See all',
                  onActionTap: () => context.go('/explore'),
                ),
              ),
              SizedBox(
                height: 160,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: SampleHomeData.destinations.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 14),
                  itemBuilder: (context, index) {
                    final destination = SampleHomeData.destinations[index];
                    return DestinationCard(
                      destination: destination,
                      onTap: () => context.go('/explore'),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                color: AppColors.background,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: CategoryChipRow(
                  categories: SampleHomeData.categories,
                  onSelected: (category) => context.go('/explore'),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                child: SectionHeader(
                  overline: 'Explore stays',
                  title: 'Handpicked places this month',
                  actionLabel: 'View all',
                  onActionTap: () => context.go('/explore'),
                ),
              ),
              SizedBox(
                height: 260,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: SampleHomeData.featuredListings.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 14),
                  itemBuilder: (context, index) {
                    final listing = SampleHomeData.featuredListings[index];
                    return ListingPreviewCard(
                      listing: listing,
                      onTap: () => context.push('/listings/${listing.id}'),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
                child: HostCtaBanner(
                  onStartHosting: () => context.go('/register?role=host'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final VoidCallback onSearchTap;

  const _HeroSection({
    required this.onSearchTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 340,
      child: Stack(
        clipBehavior: Clip.none,
        fit: StackFit.expand,
        children: [
          Image.network(
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) =>
                Container(color: AppColors.textPrimary),
          ),
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: AppColors.heroImageOverlay,
              ),
            ),
          ),
          // Clean Top Brand Logo & Name
          Positioned(
            left: 20,
            right: 20,
            top: 14,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.home,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                RichText(
                  text: TextSpan(
                    style: AppTextStyles.titleLarge.copyWith(
                      color: AppColors.textOnImage,
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
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
          ),
          Positioned(
            left: 20,
            right: 20,
            top: 90,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Stays across Ethiopia', style: AppTextStyles.heroCaption),
                const SizedBox(height: 8),
                Text(
                  "Find a place you'll love to stay.",
                  style: AppTextStyles.heroTitle,
                ),
              ],
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: -28,
            child: SearchPill(onTap: onSearchTap),
          ),
        ],
      ),
    );
  }
}