import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../data/fixtures/sample_home_data.dart';
import '../providers/explore_providers.dart';

/// Filters bottom sheet — mobile equivalent of the website's sticky
/// filter sidebar. Everything scrolls in one column since a sidebar
/// doesn't fit a phone width; "Clear all" and "Show results" replace the
/// sidebar's inline "Clear all" link.
class FiltersBottomSheet extends ConsumerWidget {
  const FiltersBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(exploreControllerProvider);
    final controller = ref.read(exploreControllerProvider.notifier);
    final resultCount = ref.watch(filteredListingsProvider).length;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                children: [
                  Text('Filters', style: AppTextStyles.titleLarge),
                  const Spacer(),
                  TextButton(
                    onPressed: controller.resetFilters,
                    child: const Text('Clear all'),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 16),
                  Text('Price range (per night)', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  RangeSlider(
                    min: SampleHomeData.minPrice,
                    max: SampleHomeData.maxPrice,
                    divisions: 20,
                    values: filters.priceRange,
                    labels: RangeLabels(
                      'ETB ${filters.priceRange.start.round()}',
                      'ETB ${filters.priceRange.end.round()}',
                    ),
                    onChanged: controller.setPriceRange,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('ETB ${filters.priceRange.start.round()}', style: AppTextStyles.bodySmall),
                      Text('ETB ${filters.priceRange.end.round()}', style: AppTextStyles.bodySmall),
                    ],
                  ),
                  const Divider(height: 32),

                  Text('Property type', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  ...SampleHomeData.propertyTypes.map(
                    (type) => _RadioRow(
                      label: type,
                      selected: filters.selectedType == type,
                      onTap: () => controller.setType(type),
                    ),
                  ),
                  const Divider(height: 32),

                  Text('Bathrooms', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: SampleHomeData.bathroomOptions.map((bathroom) {
                      final selected = filters.selectedBathroom == bathroom;
                      return ChoiceChip(
                        label: Text(bathroom),
                        selected: selected,
                        onSelected: (_) => controller.setBathroom(bathroom),
                      );
                    }).toList(),
                  ),
                  const Divider(height: 32),

                  Text('Amenities', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  ...SampleHomeData.amenityOptions.map(
                    (amenity) => _CheckRow(
                      label: amenity,
                      checked: filters.selectedAmenities.contains(amenity),
                      onTap: () => controller.toggleAmenity(amenity),
                    ),
                  ),
                  const Divider(height: 32),

                  Text('Rating', style: AppTextStyles.titleMedium),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: SampleHomeData.ratingOptions.map((rating) {
                      final selected = filters.selectedRating == rating;
                      return ChoiceChip(
                        label: Text('${rating.toStringAsFixed(rating == rating.roundToDouble() ? 0 : 1)}+'),
                        selected: selected,
                        onSelected: (_) => controller.setRating(rating),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                child: PrimaryButton(
                  label: 'Show $resultCount ${resultCount == 1 ? 'place' : 'places'}',
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _RadioRow extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RadioRow({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              size: 20,
              color: selected ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(width: 12),
            Text(label, style: AppTextStyles.bodyLarge),
          ],
        ),
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  final String label;
  final bool checked;
  final VoidCallback onTap;

  const _CheckRow({required this.label, required this.checked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(
              checked ? Icons.check_box : Icons.check_box_outline_blank,
              size: 20,
              color: checked ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(width: 12),
            Text(label, style: AppTextStyles.bodyLarge),
          ],
        ),
      ),
    );
  }
}