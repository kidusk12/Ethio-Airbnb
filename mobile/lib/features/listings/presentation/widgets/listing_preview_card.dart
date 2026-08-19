import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/listing.dart';

class ListingPreviewCard extends StatelessWidget {
  final Listing listing;
  final VoidCallback onTap;

  const ListingPreviewCard({
    super.key,
    required this.listing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 220,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    listing.photoUrl,
                    height: 150,
                    width: 220,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 150,
                      width: 220,
                      color: AppColors.chipBackground,
                    ),
                  ),
                ),
                Positioned(
                  left: 10,
                  top: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceElevated,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(listing.category, style: AppTextStyles.caption),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              listing.title,
              style: AppTextStyles.titleMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              listing.location,
              style: AppTextStyles.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Expanded(
                  child: RichText(
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: 'ETB ${listing.pricePerNight.toStringAsFixed(0)}',
                          style: AppTextStyles.price,
                        ),
                        TextSpan(
                          text: ' / night',
                          style: AppTextStyles.priceUnit,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.star, size: 14, color: AppColors.ratingStar),
                const SizedBox(width: 2),
                Text(
                  listing.rating.toStringAsFixed(1),
                  style: AppTextStyles.rating,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}