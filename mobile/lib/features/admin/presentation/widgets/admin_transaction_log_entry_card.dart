import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../domain/entities/transaction_log_entry.dart';

class AdminTransactionLogEntryCard extends StatelessWidget {
  const AdminTransactionLogEntryCard({super.key, required this.entry});
  final TransactionLogEntry entry;

  @override
  Widget build(BuildContext context) {
    final isPayment = entry.type == TransactionType.userPayment;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: (isPayment ? AppColors.statusConfirmed : AppColors.primary).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(
              isPayment ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
              size: 16,
              color: isPayment ? AppColors.statusConfirmed : AppColors.primary,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isPayment ? 'Payment from ${entry.counterpartyName}' : 'Payout to ${entry.counterpartyName}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text('Code: ${entry.transactionCode}', style: AppTextStyles.caption),
                Text('${entry.timestamp.toLocal()}'.split('.').first, style: AppTextStyles.caption),
              ],
            ),
          ),
          Text('ETB ${entry.amount.toStringAsFixed(2)}', style: AppTextStyles.price),
        ],
      ),
    );
  }
}