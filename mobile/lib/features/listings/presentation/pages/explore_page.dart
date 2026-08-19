import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../providers/explore_providers.dart';
import '../widgets/empty_results.dart';
import '../widgets/explore_listing_card.dart';
import '../widgets/explore_search_bar.dart';
import '../widgets/filters_bottom_sheet.dart';
import '../widgets/sort_bottom_sheet.dart';

/// Explore tab — FR-3 (search & browse). Mobile equivalent of the
/// website's Explore page: same search/sort/filter/favorite/grid
/// functionality, restructured for a phone-width screen (filters in a
/// bottom sheet instead of a sidebar, a 2-column grid instead of 3).
class ExplorePage extends ConsumerWidget {
  const ExplorePage({super.key});

  void _openSortSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const SortBottomSheet(),
    );
  }

  void _openFiltersSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceElevated,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const FiltersBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(exploreControllerProvider);
    final controller = ref.read(exploreControllerProvider.notifier);
    final results = ref.watch(filteredListingsProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(title: const Text('Stays in Ethiopia')),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: const ExploreSearchBar(),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${results.length} ${results.length == 1 ? 'place' : 'places'} · ${filters.guests} '
                        '${filters.guests == 1 ? 'guest' : 'guests'}',
                        style: AppTextStyles.bodyMedium,
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => _openSortSheet(context),
                      icon: const Icon(Icons.swap_vert, size: 16),
                      label: const Text('Sort'),
                      style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: () => _openFiltersSheet(context),
                      icon: const Icon(Icons.tune, size: 16),
                      label: Text(filters.activeFilterCount > 0 ? 'Filters (${filters.activeFilterCount})' : 'Filters'),
                      style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                    ),
                  ],
                ),
              ),
            ),
            if (results.isEmpty)
              SliverToBoxAdapter(
                child: EmptyResults(onClearFilters: controller.resetFilters),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 20,
                    crossAxisSpacing: 14,
                    childAspectRatio: 0.68,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final listing = results[index];
                      return ExploreListingCard(
                        listing: listing,
                        isFavorite: filters.favoriteIds.contains(listing.id),
                        onFavoriteTap: () => controller.toggleFavorite(listing.id),
                        // "all the houses should take to listing detail page"
                        onTap: () => context.push('/listings/${listing.id}'),
                      );
                    },
                    childCount: results.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}