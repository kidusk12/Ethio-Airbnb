import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../providers/explore_providers.dart';
import 'guests_stepper_sheet.dart';

const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

String _formatDate(DateTime date) => '${date.day} ${_months[date.month - 1]}';

/// Mobile-friendly stand-in for the website's 4-field search row
/// (Location / Check-in / Check-out / Guests). The desktop row doesn't
/// fit a phone width, so this collapses to: a location text field, plus
/// two compact buttons for dates and guests.
class ExploreSearchBar extends ConsumerWidget {
  const ExploreSearchBar({super.key});

  Future<void> _pickDates(BuildContext context, WidgetRef ref) async {
    final now = DateTime.now();
    final range = await showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (range != null) {
      ref.read(exploreControllerProvider.notifier).setDateRange(range);
    }
  }

  void _openGuestsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const GuestsStepperSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(exploreControllerProvider);
    final controller = ref.read(exploreControllerProvider.notifier);

    final dateLabel = filters.dateRange == null
        ? 'Add dates'
        : '${_formatDate(filters.dateRange!.start)} – ${_formatDate(filters.dateRange!.end)}';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            onChanged: controller.setLocation,
            decoration: const InputDecoration(
              hintText: 'Addis Ababa, Hawassa...',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _SearchChipButton(
                  icon: Icons.calendar_today_outlined,
                  label: dateLabel,
                  onTap: () => _pickDates(context, ref),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _SearchChipButton(
                  icon: Icons.people_outline,
                  label: '${filters.guests} ${filters.guests == 1 ? 'guest' : 'guests'}',
                  onTap: () => _openGuestsSheet(context),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SearchChipButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SearchChipButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18, color: AppColors.primary),
      label: Text(
        label,
        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
        overflow: TextOverflow.ellipsis,
      ),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(42),
        padding: const EdgeInsets.symmetric(horizontal: 10),
      ),
    );
  }
}