import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:image_picker/image_picker.dart';

import '../../../listings/domain/entities/listing.dart';

class PaymentInstructionPage extends StatefulWidget {
  final Listing listing;
  final DateTimeRange dateRange;
  final int guests;
  final String paymentMethod;
  final double totalAmount;

  const PaymentInstructionPage({
    super.key,
    required this.listing,
    required this.dateRange,
    required this.guests,
    required this.paymentMethod,
    required this.totalAmount,
  });

  @override
  State<PaymentInstructionPage> createState() => _PaymentInstructionPageState();
}

class _PaymentInstructionPageState extends State<PaymentInstructionPage> {
  XFile? _receiptImage;
  bool _isSubmitting = false;

  final ImagePicker _picker = ImagePicker();

  String get _accountName {
    if (widget.paymentMethod == 'Telebirr') {
      return 'Kidus';
    }

    return 'Kidus Kidnaewold';
  }

  String get _accountNumber {
    if (widget.paymentMethod == 'Telebirr') {
      return '0955662755';
    }

    return '1000568901332';
  }

  String get _accountLabel {
    if (widget.paymentMethod == 'Telebirr') {
      return 'Phone Number';
    }

    return 'Account Number';
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

  Future<void> _pickReceipt() async {
    final picked = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );

    if (picked != null) {
      setState(() {
        _receiptImage = picked;
      });
    }
  }

  Future<void> _submitPayment() async {
    if (_receiptImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload your payment receipt first'),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    // Temporary simulation until the backend/payment API is connected.
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Expanded(child: Text('Payment submitted')),
            ],
          ),
          content: const Text(
            'Your payment receipt has been submitted for review.\n\n'
            'Status: Pending',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Done'),
            ),
          ],
        );
      },
    );

    if (!mounted) return;

    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final bool isCbe = widget.paymentMethod == 'Commercial Bank of Ethiopia';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
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
            const Text(
              'Complete your payment',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 8),

            const Text(
              'Transfer the exact amount using the selected payment method, then upload your receipt.',
              style: TextStyle(fontSize: 14, color: Colors.grey, height: 1.4),
            ),

            const SizedBox(height: 24),

            // Payment method card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: isCbe
                              ? const Color(0xFF006633)
                              : const Color(0xFF00A651),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            isCbe ? 'CBE' : 'T',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          widget.paymentMethod,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  _InfoRow(label: 'Account Name', value: _accountName),

                  const SizedBox(height: 16),

                  _InfoRow(
                    label: _accountLabel,
                    value: _accountNumber,
                    showCopyButton: true,
                    onCopy: () {
                      // Clipboard integration can be added here.
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Account information copied'),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 16),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDF1F4),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Amount to pay',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'ETB ${widget.totalAmount.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFE51D53),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Booking summary
            const Text(
              'Booking summary',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  _SummaryRow(label: 'Property', value: widget.listing.title),
                  const SizedBox(height: 12),
                  _SummaryRow(
                    label: 'Dates',
                    value:
                        '${_formatDate(widget.dateRange.start)} → ${_formatDate(widget.dateRange.end)}',
                  ),
                  const SizedBox(height: 12),
                  _SummaryRow(label: 'Guests', value: '${widget.guests}'),
                  const SizedBox(height: 12),
                  _SummaryRow(label: 'Payment', value: widget.paymentMethod),
                  const SizedBox(height: 12),
                  Divider(color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  _SummaryRow(
                    label: 'Total',
                    value: 'ETB ${widget.totalAmount.toStringAsFixed(0)}',
                    bold: true,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Receipt upload
            const Text(
              'Payment receipt',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 8),

            const Text(
              'Upload a screenshot of your successful payment.',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),

            const SizedBox(height: 12),

            GestureDetector(
              onTap: _pickReceipt,
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(minHeight: 180),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _receiptImage == null
                        ? Colors.grey.shade300
                        : const Color(0xFFE51D53),
                  ),
                ),
                child: _receiptImage == null
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.cloud_upload_outlined,
                            size: 42,
                            color: Color(0xFFE51D53),
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Upload receipt screenshot',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 5),
                          Text(
                            'Tap to choose an image',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(15),
                        child: kIsWeb
                            ? Image.network(
                                _receiptImage!.path,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              )
                            : Image.file(
                                File(_receiptImage!.path),
                                width: double.infinity,
                                fit: BoxFit.cover,
                              ),
                      ),
              ),
            ),

            if (_receiptImage != null) ...[
              const SizedBox(height: 8),
              Center(
                child: TextButton.icon(
                  onPressed: _pickReceipt,
                  icon: const Icon(Icons.edit_outlined),
                  label: const Text('Choose a different image'),
                ),
              ),
            ],

            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitPayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE51D53),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey.shade400,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Submit Payment',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 16),

            const Center(
              child: Text(
                'Your payment will remain pending until an admin verifies the receipt.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool showCopyButton;
  final VoidCallback? onCopy;

  const _InfoRow({
    required this.label,
    required this.value,
    this.showCopyButton = false,
    this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 5),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        if (showCopyButton)
          IconButton(
            onPressed: onCopy,
            icon: const Icon(Icons.copy_outlined),
            tooltip: 'Copy',
          ),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.bold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: bold ? Colors.black : Colors.grey.shade700,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              fontSize: 14,
              fontWeight: bold ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
