import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/payout_record.dart';
import '../providers/admin_actions_coordinator.dart';
import 'sla_countdown_text.dart';

class AdminPayoutDueCard extends ConsumerStatefulWidget {
  const AdminPayoutDueCard({super.key, required this.payout});
  final PayoutRecord payout;

  @override
  ConsumerState<AdminPayoutDueCard> createState() => _AdminPayoutDueCardState();
}

class _AdminPayoutDueCardState extends ConsumerState<AdminPayoutDueCard> {
  final _codeController = TextEditingController();
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(
      const Duration(seconds: 60),
      (_) => setState(() {}),
    );
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final payout = widget.payout;
    final isDue = payout.status == PayoutStatus.due;

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
                child: Text(
                  'Host: ${payout.hostName}',
                  style: AppTextStyles.titleMedium,
                ),
              ),
              Text(
                'ETB ${payout.hostShare.toStringAsFixed(2)}',
                style: AppTextStyles.price,
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Booking total ETB ${payout.bookingAmount.toStringAsFixed(2)} · '
            'Commission ${(payout.commissionRate * 100).toStringAsFixed(0)}% '
            '(ETB ${payout.platformCommission.toStringAsFixed(2)})',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 10),
          if (isDue)
            SlaCountdownText(
              remaining: payout.timeRemaining,
              totalWindow: const Duration(hours: 24),
              isOverdue: payout.isOverdue,
              overdueLabel: 'Past 24hr SLA — pay host now',
            )
          else
            Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(
                  Icons.check_circle,
                  size: 16,
                  color: AppColors.statusConfirmed,
                ),
                SizedBox(width: 4),
                Text(
                  'Paid',
                  style: TextStyle(
                    color: AppColors.statusConfirmed,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          if (isDue) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _codeController,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                labelText: 'Transaction / reference code',
                hintText: 'e.g. the bank transfer reference sent to the host',
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _codeController.text.trim().isEmpty
                    ? null
                    : () {
                        ref
                            .read(adminActionsCoordinatorProvider)
                            .markPayoutPaid(
                              payoutId: payout.id,
                              transactionCode: _codeController.text,
                            );
                      },
                child: const Text('Mark paid'),
              ),
            ),
          ] else if (payout.transactionCode != null) ...[
            const SizedBox(height: 8),
            Text(
              'Paid with code: ${payout.transactionCode}',
              style: AppTextStyles.bodySmall,
            ),
          ],
        ],
      ),
    );
  }
}
