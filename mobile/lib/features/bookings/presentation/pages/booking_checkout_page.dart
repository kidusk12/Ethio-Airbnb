import 'package:flutter/material.dart';
import '../../../listings/domain/entities/listing.dart';
import 'payment_instruction_page.dart';

class BookingCheckoutPage extends StatefulWidget {
  final Listing listing;
  final DateTimeRange initialDateRange;
  final double initialTotalAmount;
  final int initialNights;

  const BookingCheckoutPage({
    super.key,
    required this.listing,
    required this.initialDateRange,
    required this.initialTotalAmount,
    required this.initialNights,
  });

  @override
  State<BookingCheckoutPage> createState() => _BookingCheckoutPageState();
}

class _BookingCheckoutPageState extends State<BookingCheckoutPage> {
  late DateTimeRange _dateRange;
  int _guests = 1;
  String? _selectedPaymentMethod;

  final List<String> _paymentMethods = [
    'Commercial Bank of Ethiopia',
    'Telebirr',
  ];

  @override
  void initState() {
    super.initState();
    _dateRange = widget.initialDateRange;
  }

  int get _nights {
    final nights = _dateRange.duration.inDays;
    return nights > 0 ? nights : 1;
  }

  double get _totalPrice {
    return widget.listing.pricePerNight * _nights;
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  Future<void> _selectDates() async {
    final today = DateTime.now();

    // Step 1: Select check-in
    final checkIn = await showDatePicker(
      context: context,
      initialDate: _dateRange.start.isBefore(today) ? today : _dateRange.start,
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
      helpText: 'Select check-in date',
      cancelText: 'Cancel',
      confirmText: 'Next',
    );

    if (checkIn == null || !mounted) return;

    // Step 2: Select check-out
    final minimumCheckOut = checkIn.add(const Duration(days: 1));

    final checkOut = await showDatePicker(
      context: context,
      initialDate: _dateRange.end.isAfter(minimumCheckOut)
          ? _dateRange.end
          : minimumCheckOut,
      firstDate: minimumCheckOut,
      lastDate: today.add(const Duration(days: 365)),
      helpText: 'Select check-out date',
      cancelText: 'Back',
      confirmText: 'Done',
    );

    if (checkOut == null || !mounted) return;

    setState(() {
      _dateRange = DateTimeRange(start: checkIn, end: checkOut);
    });
  }

  void _confirmAndPay() {
    if (_selectedPaymentMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a payment method')),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PaymentInstructionPage(
          listing: widget.listing,
          dateRange: _dateRange,
          guests: _guests,
          paymentMethod: _selectedPaymentMethod!,
          totalAmount: _totalPrice,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm your booking'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      backgroundColor: const Color(0xFFF8F8F8),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.home_outlined,
                      size: 36,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.listing.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'ETB ${widget.listing.pricePerNight.toStringAsFixed(0)} / night',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Your stay',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            // Dates
            // Dates
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_month_outlined,
                        color: Color(0xFFE51D53),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Your dates',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: _selectDates,
                        child: const Text(
                          'Change',
                          style: TextStyle(
                            color: Color(0xFFE51D53),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: _DateCard(
                          label: 'CHECK-IN',
                          date: _formatDate(_dateRange.start),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _DateCard(
                          label: 'CHECK-OUT',
                          date: _formatDate(_dateRange.end),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDF1F4),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '$_nights night${_nights == 1 ? '' : 's'}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Color(0xFFE51D53),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Guests
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                children: [
                  const Icon(Icons.people_outline, color: Color(0xFFE51D53)),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'GUESTS',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                          ),
                        ),
                        SizedBox(height: 5),
                        Text(
                          'Number of guests',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _guests > 1
                        ? () {
                            setState(() {
                              _guests--;
                            });
                          }
                        : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text(
                    '$_guests',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: _guests < widget.listing.maxGuests
                        ? () {
                            setState(() {
                              _guests++;
                            });
                          }
                        : null,
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
            ),

            Text(
              'Maximum ${widget.listing.maxGuests} guests',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),

            const SizedBox(height: 24),

            const Text(
              'Payment method',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            // Payment method dropdown
            // Payment method dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedPaymentMethod,
                  isExpanded: true,
                  hint: const Text('Select payment method'),
                  items: _paymentMethods.map((method) {
                    final bool isCbe = method == 'Commercial Bank of Ethiopia';

                    return DropdownMenuItem<String>(
                      value: method,
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: isCbe
                                  ? const Color(0xFF006633)
                                  : const Color(0xFF00A651),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(
                              child: Text(
                                isCbe ? 'CBE' : 'T',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            method,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedPaymentMethod = value;
                    });
                  },
                ),
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Price details',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  _PriceRow(
                    label:
                        'ETB ${widget.listing.pricePerNight.toStringAsFixed(0)} × $_nights night${_nights > 1 ? 's' : ''}',
                    value: 'ETB ${_totalPrice.toStringAsFixed(0)}',
                  ),
                  const SizedBox(height: 12),
                  Divider(color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  _PriceRow(
                    label: 'Total',
                    value: 'ETB ${_totalPrice.toStringAsFixed(0)}',
                    bold: true,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _confirmAndPay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE51D53),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Confirm & Pay',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),

            const SizedBox(height: 12),

            const Center(
              child: Text(
                'You will upload your payment receipt in the next step.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;

  const _PriceRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: bold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

class _DateCard extends StatelessWidget {
  final String label;
  final String date;

  const _DateCard({required this.label, required this.date});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                size: 15,
                color: Color(0xFFE51D53),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  date,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
