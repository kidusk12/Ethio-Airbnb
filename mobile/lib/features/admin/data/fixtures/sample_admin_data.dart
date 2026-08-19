import '../../domain/entities/pending_listing.dart';
import '../../domain/entities/pending_payment.dart';
import '../../domain/entities/payout_record.dart';
import '../../domain/entities/transaction_log_entry.dart';

/// Fixture data for the admin feature, standing in until the backend
/// is reachable (see api_endpoints.dart placeholder baseUrl).
///
/// IMPORTANT: These are just timestamps. No SLA "remaining time" or
/// "overdue" flag is precomputed or stored here — that's derived live
/// by PendingPayment.timeRemaining / PayoutRecord.timeRemaining getters
/// at display time. Real deadline enforcement (auto-expiring a payment,
/// escalating an overdue payout, etc.) is a backend responsibility and
/// is NOT implemented on the frontend — the UI only ever displays a
/// countdown computed from submittedAt / paymentConfirmedAt, it never
/// decides what should happen when time runs out.

/// Placeholder commission rate for the v1 prototype.
/// TODO: This must come from the backend / business-rules config once
/// it exists — the rate may vary by host tier, property type, or change
/// over time. The frontend should never own this business rule long-term.
const double sampleCommissionRate = 0.15;

final _now = DateTime.now();

final List<PendingListing> samplePendingListings = [
  PendingListing(
    id: 'lst_001',
    hostId: 'host_014',
    hostName: 'Selam Tesfaye',
    propertyTitle: 'Modern 2BR Apartment, Bole',
    fileUrls: const [
      'https://example.com/fixtures/listing1_photo1.jpg',
      'https://example.com/fixtures/listing1_photo2.jpg',
      'https://example.com/fixtures/listing1_title_doc.pdf',
    ],
    submittedAt: _now.subtract(const Duration(hours: 3)),
  ),
  PendingListing(
    id: 'lst_002',
    hostId: 'host_022',
    hostName: 'Dawit Bekele',
    propertyTitle: 'Cozy Studio near Piazza',
    fileUrls: const ['https://example.com/fixtures/listing2_photo1.jpg'],
    submittedAt: _now.subtract(const Duration(days: 1, hours: 5)),
  ),
  PendingListing(
    id: 'lst_003',
    hostId: 'host_014',
    hostName: 'Selam Tesfaye',
    propertyTitle: 'Traditional Compound House, CMC',
    fileUrls: const [
      'https://example.com/fixtures/listing3_photo1.jpg',
      'https://example.com/fixtures/listing3_photo2.jpg',
      'https://example.com/fixtures/listing3_photo3.jpg',
      'https://example.com/fixtures/listing3_id_doc.pdf',
    ],
    submittedAt: _now.subtract(const Duration(minutes: 40)),
  ),
  // Already actioned, for testing the "history" state of the tab/list
  PendingListing(
    id: 'lst_004',
    hostId: 'host_009',
    hostName: 'Meron Alemu',
    propertyTitle: 'Lakeview Villa, Bishoftu',
    fileUrls: const ['https://example.com/fixtures/listing4_photo1.jpg'],
    submittedAt: _now.subtract(const Duration(days: 3)),
    status: ListingApprovalStatus.approved,
  ),
];

final List<PendingPayment> samplePendingPayments = [
  PendingPayment(
    id: 'pay_101',
    bookingId: 'bkg_5001',
    userId: 'usr_301',
    userName: 'Nahom Girma',
    hostId: 'host_014',
    hostName: 'Selam Tesfaye',
    propertyTitle: 'Modern 2BR Apartment, Bole',
    amount: 4200.00,
    receiptImageUrl: 'https://example.com/fixtures/receipt_101.jpg',
    submittedAt: _now.subtract(const Duration(minutes: 12)),
  ),
  PendingPayment(
    id: 'pay_102',
    bookingId: 'bkg_5002',
    userId: 'usr_305',
    userName: 'Rediet Solomon',
    hostId: 'host_022',
    hostName: 'Dawit Bekele',
    propertyTitle: 'Cozy Studio near Piazza',
    amount: 1800.00,
    receiptImageUrl: 'https://example.com/fixtures/receipt_102.jpg',
    submittedAt: _now.subtract(const Duration(minutes: 55)),
  ),
  PendingPayment(
    id: 'pay_103',
    bookingId: 'bkg_5003',
    userId: 'usr_310',
    userName: 'Fasika Yohannes',
    hostId: 'host_009',
    hostName: 'Meron Alemu',
    propertyTitle: 'Lakeview Villa, Bishoftu',
    amount: 6100.00,
    receiptImageUrl: 'https://example.com/fixtures/receipt_103.jpg',
    submittedAt: _now.subtract(const Duration(hours: 2)),
  ),
  PendingPayment(
    id: 'pay_104',
    bookingId: 'bkg_4998',
    userId: 'usr_290',
    userName: 'Betelhem Aklilu',
    hostId: 'host_014',
    hostName: 'Selam Tesfaye',
    propertyTitle: 'Traditional Compound House, CMC',
    amount: 3500.00,
    receiptImageUrl: 'https://example.com/fixtures/receipt_104.jpg',
    submittedAt: _now.subtract(const Duration(days: 2, hours: 1)),
    status: PaymentConfirmationStatus.confirmed,
    confirmedAt: _now.subtract(const Duration(days: 2)),
  ),
];

final List<PayoutRecord> samplePayoutsDue = [
  PayoutRecord(
    id: 'pyt_201',
    hostId: 'host_009',
    hostName: 'Meron Alemu',
    bookingId: 'bkg_4998',
    bookingAmount: 3500.00,
    commissionRate: 0.15,
    paymentConfirmedAt: _now.subtract(
      const Duration(hours: 4),
    ), // within 24hr window
  ),
  PayoutRecord(
    id: 'pyt_202',
    hostId: 'host_022',
    hostName: 'Dawit Bekele',
    bookingId: 'bkg_4990',
    bookingAmount: 2200.00,
    commissionRate: 0.15,
    paymentConfirmedAt: _now.subtract(
      const Duration(hours: 23, minutes: 10),
    ), // near deadline
  ),
  PayoutRecord(
    id: 'pyt_203',
    hostId: 'host_014',
    hostName: 'Selam Tesfaye',
    bookingId: 'bkg_4985',
    bookingAmount: 5000.00,
    commissionRate: 0.12,
    paymentConfirmedAt: _now.subtract(
      const Duration(hours: 30),
    ), // past 24hr — isOverdue reads true
  ),
];

final List<TransactionLogEntry> sampleTransactionLog = [
  TransactionLogEntry(
    id: 'txn_9001',
    type: TransactionType.userPayment,
    transactionCode: 'ETB-PAY-20260810-9001',
    counterpartyName: 'Betelhem Aklilu',
    amount: 3500.00,
    timestamp: _now.subtract(const Duration(days: 2)),
    bookingId: 'bkg_4998',
    relatedReceiptOrProofUrl: 'https://example.com/fixtures/receipt_104.jpg',
  ),
  TransactionLogEntry(
    id: 'txn_9002',
    type: TransactionType.hostPayout,
    transactionCode: 'ETB-OUT-20260812-9002',
    counterpartyName: 'Meron Alemu',
    amount: 2975.00, // 3500 - 15% commission
    timestamp: _now.subtract(const Duration(days: 1)),
    bookingId: 'bkg_4998',
  ),
];
