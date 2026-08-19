import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/listing.dart';

class ExploreListingCard extends StatelessWidget {
  final Listing listing;
  final bool isFavorite;
  final VoidCallback onTap;
  final VoidCallback onFavoriteTap;

  const ExploreListingCard({
    super.key,
    required this.listing,
    required this.isFavorite,
    required this.onTap,
    required this.onFavoriteTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: Stack(
              fit: StackFit.expand,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    listing.photoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        Container(color: AppColors.chipBackground),
                  ),
                ),
                Positioned(
                  left: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceElevated.withOpacity(0.95),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      listing.category,
                      style: AppTextStyles.caption.copyWith(fontSize: 10),
                    ),
                  ),
                ),
                Positioned(
                  right: 8,
                  top: 8,
                  child: GestureDetector(
                    onTap: onFavoriteTap,
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated.withOpacity(0.95),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        size: 16,
                        color: isFavorite ? AppColors.primary : AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            listing.title,
            style: AppTextStyles.titleMedium.copyWith(fontSize: 14),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            listing.location,
            style: AppTextStyles.bodySmall,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              const Icon(Icons.star, size: 12, color: AppColors.ratingStar),
              const SizedBox(width: 3),
              Text(listing.rating.toStringAsFixed(2), style: AppTextStyles.rating.copyWith(fontSize: 12)),
              Text(' (${listing.reviewCount})', style: AppTextStyles.bodySmall.copyWith(fontSize: 11)),
            ],
          ),
          Text(
            'ETB ${listing.pricePerNight.toStringAsFixed(0)} / night',
            style: AppTextStyles.price.copyWith(fontSize: 13),
          ),
        ],
      ),
    );
  }
}