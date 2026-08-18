enum PaymentConfirmationStatus { pending, confirmed, rejected, expired }

class PendingPayment {
  final String id;
  final String bookingId;
  final String userId;
  final String userName;
  final String hostId;
  final String hostName;
  final String propertyTitle;
  final double amount;
  final String receiptImageUrl; // screenshot/photo of the bank transfer receipt
  final DateTime submittedAt; // SLA clock starts here — 1 hour to confirm
  final PaymentConfirmationStatus status;
  final DateTime? confirmedAt;
  final String? transactionCode;

  const PendingPayment({
    required this.id,
    required this.bookingId,
    required this.userId,
    required this.userName,
    required this.hostId,
    required this.hostName,
    required this.propertyTitle,
    required this.amount,
    required this.receiptImageUrl,
    required this.submittedAt,
    this.status = PaymentConfirmationStatus.pending,
    this.confirmedAt,
    this.transactionCode,
  });

  /// Derived, not stored — always computed fresh from submittedAt so the
  /// SLA never goes stale. Widgets should call this, not cache a countdown.
  Duration get timeRemaining {
    final deadline = submittedAt.add(const Duration(hours: 1));
    final remaining = deadline.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get isOverdue =>
      timeRemaining == Duration.zero &&
      status == PaymentConfirmationStatus.pending;

  PendingPayment copyWith({
    String? id,
    String? bookingId,
    String? userId,
    String? userName,
    String? propertyTitle,
    String? hostId,
    String? hostName,
    double? amount,
    String? receiptImageUrl,
    DateTime? submittedAt,
    PaymentConfirmationStatus? status,
    DateTime? confirmedAt,
    String? transactionCode,
  }) {
    return PendingPayment(
      id: id ?? this.id,
      bookingId: bookingId ?? this.bookingId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      hostId: hostId ?? this.hostId,
      hostName: hostName ?? this.hostName,
      propertyTitle: propertyTitle ?? this.propertyTitle,
      amount: amount ?? this.amount,
      receiptImageUrl: receiptImageUrl ?? this.receiptImageUrl,
      submittedAt: submittedAt ?? this.submittedAt,
      status: status ?? this.status,
      confirmedAt: confirmedAt ?? this.confirmedAt,
      transactionCode: transactionCode ?? this.transactionCode,
    );
  }
}
