enum TransactionType { userPayment, hostPayout }

/// Read-only audit record. Written once, at the moment a user payment is
/// confirmed or a host payout is marked paid — never mutated afterward.
class TransactionLogEntry {
  final String id;
  final TransactionType type;
  final String transactionCode;
  final String
  counterpartyName; // user name for userPayment, host name for hostPayout
  final double amount;
  final DateTime timestamp;
  final String bookingId;
  final String?
  relatedReceiptOrProofUrl; // receipt screenshot, or payout confirmation proof

  const TransactionLogEntry({
    required this.id,
    required this.type,
    required this.transactionCode,
    required this.counterpartyName,
    required this.amount,
    required this.timestamp,
    required this.bookingId,
    this.relatedReceiptOrProofUrl,
  });
}
