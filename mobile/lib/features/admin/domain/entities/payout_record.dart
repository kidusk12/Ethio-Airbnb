// lib/features/admin/domain/entities/payout_record.dart

enum PayoutStatus { due, paid, overdue }

class PayoutRecord {
  final String id;
  final String hostId;
  final String hostName;
  final String bookingId;
  final double bookingAmount;
  final double commissionRate; // e.g. 0.15 for 15% platform cut
  final DateTime
  paymentConfirmedAt; // SLA clock starts here — 24 hours to pay host
  final PayoutStatus status;
  final DateTime? paidAt;
  final String?
  transactionCode; // set when marked paid; also written to TransactionLogEntry

  const PayoutRecord({
    required this.id,
    required this.hostId,
    required this.hostName,
    required this.bookingId,
    required this.bookingAmount,
    required this.commissionRate,
    required this.paymentConfirmedAt,
    this.status = PayoutStatus.due,
    this.paidAt,
    this.transactionCode,
  });

  double get hostShare => bookingAmount * (1 - commissionRate);
  double get platformCommission => bookingAmount * commissionRate;

  /// Derived from paymentConfirmedAt, never stored pre-calculated.
  Duration get timeRemaining {
    final deadline = paymentConfirmedAt.add(const Duration(hours: 24));
    final remaining = deadline.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get isOverdue =>
      timeRemaining == Duration.zero && status == PayoutStatus.due;

  PayoutRecord copyWith({
    String? id,
    String? hostId,
    String? hostName,
    String? bookingId,
    double? bookingAmount,
    double? commissionRate,
    DateTime? paymentConfirmedAt,
    PayoutStatus? status,
    DateTime? paidAt,
    String? transactionCode,
  }) {
    return PayoutRecord(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      hostName: hostName ?? this.hostName,
      bookingId: bookingId ?? this.bookingId,
      bookingAmount: bookingAmount ?? this.bookingAmount,
      commissionRate: commissionRate ?? this.commissionRate,
      paymentConfirmedAt: paymentConfirmedAt ?? this.paymentConfirmedAt,
      status: status ?? this.status,
      paidAt: paidAt ?? this.paidAt,
      transactionCode: transactionCode ?? this.transactionCode,
    );
  }
}
