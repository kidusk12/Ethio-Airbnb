import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../data/fixtures/sample_admin_data.dart';
import '../../domain/entities/pending_payment.dart';
import '../providers/admin_actions_coordinator.dart';
import 'sla_countdown_text.dart';

class AdminPaymentConfirmationCard extends ConsumerStatefulWidget {
  const AdminPaymentConfirmationCard({super.key, required this.payment});
  final PendingPayment payment;

  @override
  ConsumerState<AdminPaymentConfirmationCard> createState() =>
      _AdminPaymentConfirmationCardState();
}

class _AdminPaymentConfirmationCardState
    extends ConsumerState<AdminPaymentConfirmationCard> {
  final _codeController = TextEditingController();
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    // Forces a rebuild every 60s so the SLA countdown stays live. Purely a
    // display refresh — see PendingPayment.timeRemaining for the source of truth.
    _ticker = Timer.periodic(const Duration(seconds: 60), (_) => setState(() {}));
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _codeController.dispose();
    super.dispose();
  }

  void _openReceiptZoom(BuildContext context, String url) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            InteractiveViewer(
              child: Image.network(
                url,
                errorBuilder: (context, error, stack) => const Icon(
                  Icons.receipt_long_outlined,
                  color: Colors.white,
                  size: 48,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final payment = widget.payment;
    final isPending = payment.status == PaymentConfirmationStatus.pending;

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(payment.propertyTitle, style: AppTextStyles.titleMedium),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            payment.userName,
                            style: AppTextStyles.bodySmall,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          child: Icon(Icons.arrow_forward, size: 12, color: AppColors.textMuted),
                        ),
                        Flexible(
                          child: Text(
                            payment.hostName,
                            style: AppTextStyles.bodySmall,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Text('ETB ${payment.amount.toStringAsFixed(2)}', style: AppTextStyles.price),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _openReceiptZoom(context, payment.receiptImageUrl),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    payment.receiptImageUrl,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stack) => Container(
                      height: 150,
                      color: AppColors.chipBackground,
                      alignment: Alignment.center,
                      child: const Icon(Icons.receipt_long_outlined,
                          color: AppColors.textMuted, size: 32),
                    ),
                  ),
                ),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.55),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.zoom_in, size: 14, color: Colors.white),
                        SizedBox(width: 4),
                        Text('Tap to zoom', style: TextStyle(fontSize: 11, color: Colors.white)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          if (isPending)
            SlaCountdownText(
              remaining: payment.timeRemaining,
              totalWindow: const Duration(hours: 1),
              isOverdue: payment.isOverdue,
              overdueLabel: 'Past 1hr SLA — needs attention',
            )
          else
            _StatusLabel(status: payment.status),
          if (isPending) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _codeController,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                labelText: 'Transaction / reference code',
                hintText: 'e.g. FT26224ABCDE',
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _codeController.text.trim().isEmpty
                    ? null
                    : () {
                        ref.read(adminActionsCoordinatorProvider).confirmPayment(
                              paymentId: payment.id,
                              transactionCode: _codeController.text,
                              commissionRate: sampleCommissionRate,
                            );
                      },
                child: const Text('Confirm payment'),
              ),
            ),
          ] else if (payment.transactionCode != null) ...[
            const SizedBox(height: 8),
            Text('Confirmed with code: ${payment.transactionCode}', style: AppTextStyles.bodySmall),
          ],
        ],
      ),
    );
  }
}

class _StatusLabel extends StatelessWidget {
  const _StatusLabel({required this.status});
  final PaymentConfirmationStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      PaymentConfirmationStatus.confirmed => ('Confirmed', AppColors.statusConfirmed),
      PaymentConfirmationStatus.rejected => ('Rejected', AppColors.statusCancelled),
      PaymentConfirmationStatus.expired => ('Expired', AppColors.statusCancelled),
      PaymentConfirmationStatus.pending => ('Pending', AppColors.statusPending),
    };
    return Text(label, style: AppTextStyles.bodySmall.copyWith(color: color, fontWeight: FontWeight.w600));
  }
}