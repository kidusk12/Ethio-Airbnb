import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/pending_listing.dart';
import '../providers/admin_dashboard_provider.dart';

class AdminListingApprovalCard extends ConsumerWidget {
  const AdminListingApprovalCard({super.key, required this.listing});
  final PendingListing listing;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isActioned = listing.status != ListingApprovalStatus.pending;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(listing.propertyTitle, style: AppTextStyles.titleMedium),
                    const SizedBox(height: 2),
                    Text('Host: ${listing.hostName}', style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
              _StatusChip(status: listing.status),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 72,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: listing.fileUrls.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) => ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  listing.fileUrls[i],
                  width: 72,
                  height: 72,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stack) => Container(
                    width: 72,
                    height: 72,
                    color: AppColors.chipBackground,
                    child: const Icon(Icons.insert_drive_file_outlined, color: AppColors.textMuted),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${listing.fileUrls.length} file${listing.fileUrls.length == 1 ? '' : 's'} submitted · ${_timeAgo(listing.submittedAt)}',
            style: AppTextStyles.caption,
          ),
          if (!isActioned) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _confirmReject(context, ref),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                    child: const Text('Reject'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () =>
                        ref.read(pendingListingsProvider.notifier).approve(listing.id),
                    child: const Text('Approve'),
                  ),
                ),
              ],
            ),
          ] else if (listing.status == ListingApprovalStatus.rejected &&
              listing.rejectionReason != null) ...[
            const SizedBox(height: 8),
            Text('Reason: ${listing.rejectionReason}', style: AppTextStyles.bodySmall),
          ],
        ],
      ),
    );
  }

  void _confirmReject(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject listing'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Reason (optional)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              ref.read(pendingListingsProvider.notifier).reject(
                    listing.id,
                    reason: controller.text.trim().isEmpty ? null : controller.text.trim(),
                  );
              Navigator.pop(context);
            },
            child: const Text('Reject'),
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    return '${diff.inMinutes}m ago';
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final ListingApprovalStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      ListingApprovalStatus.pending => ('Pending', AppColors.statusPending),
      ListingApprovalStatus.approved => ('Approved', AppColors.statusConfirmed),
      ListingApprovalStatus.rejected => ('Rejected', AppColors.statusCancelled),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: AppTextStyles.caption.copyWith(color: color)),
    );
  }
}