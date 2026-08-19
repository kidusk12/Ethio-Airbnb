import 'package:flutter/material.dart';

import '../../data/fixtures/sample_home_data.dart';
import '../../domain/entities/listing.dart';
import '../widgets/booking_calculator_card.dart';
import '../widgets/listing_amenities_section.dart';
import '../widgets/listing_host_info_row.dart';
import '../widgets/listing_image_gallery.dart';
import '../widgets/listing_specs_row.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/require_auth.dart';
import '../../../bookings/presentation/pages/booking_checkout_page.dart';

class ListingDetailPage extends ConsumerStatefulWidget {
  final String? listingId;

  const ListingDetailPage({super.key, this.listingId});

  @override
  ConsumerState<ListingDetailPage> createState() => _ListingDetailPageState();
}

class _ListingDetailPageState extends ConsumerState<ListingDetailPage> {
  DateTimeRange _selectedDateRange = DateTimeRange(
    start: DateTime(2026, 9, 12),
    end: DateTime(2026, 9, 16),
  );

  late final Listing _listing;

  @override
  void initState() {
    super.initState();
    _listing = SampleHomeData.featuredListings.firstWhere(
      (item) => item.id == widget.listingId,
      orElse: () => SampleHomeData.featuredListings.first,
    );
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: _selectedDateRange,
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFE51D53),
              onPrimary: Colors.white,
              surface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDateRange) {
      setState(() {
        _selectedDateRange = picked;
      });
    }
  }

  void _handleReservation(double totalAmount, int nights) {
    requireAuth(
      context,
      ref,
      returnTo: '/listings/${_listing.id}',
      message: 'Sign in to book this stay',
      onAuthenticated: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => BookingCheckoutPage(
              listing: _listing,
              initialDateRange: _selectedDateRange,
              initialTotalAmount: totalAmount,
              initialNights: nights,
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final imagesList = _listing.images.isNotEmpty
        ? _listing.images
        : [_listing.photoUrl];

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListingImageGallery(images: imagesList),
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _listing.title,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 18, color: Colors.black),
                        const SizedBox(width: 4),
                        Text(
                          '${_listing.rating} · ${_listing.reviewCount} reviews',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const Text(' · '),
                        Text(
                          _listing.location,
                          style: const TextStyle(
                            decoration: TextDecoration.underline,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    ListingHostInfoRow(
                      hostName: _listing.hostName,
                      hostDetails: _listing.hostDetails,
                    ),
                    const Divider(height: 1),
                    const SizedBox(height: 16),
                    const ListingSpecsRow(),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 20),
                    const Text(
                      'About this place',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _listing.description.isNotEmpty
                          ? _listing.description
                          : 'A comfortable stay located in ${_listing.location}.',
                      style: const TextStyle(
                        fontSize: 15,
                        height: 1.4,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Divider(height: 1),
                    const SizedBox(height: 20),
                    const ListingAmenitiesSection(),
                    const SizedBox(height: 24),
                    const Divider(height: 1),
                    const SizedBox(height: 20),
                    const Text(
                      'House rules',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _RuleTile(
                                icon: Icons.access_time,
                                text:
                                    'Check-in after 2:00 PM · Check-out by 11:00 AM',
                              ),
                              SizedBox(height: 12),
                              _RuleTile(
                                icon: Icons.shield_outlined,
                                text: 'No parties or events',
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _RuleTile(
                                icon: Icons.people_outline,
                                text: 'Maximum ${_listing.maxGuests} guests',
                              ),
                              const SizedBox(height: 12),
                              const _RuleTile(
                                icon: Icons.pets_outlined,
                                text: 'Pets on request',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Divider(height: 1),
                    const SizedBox(height: 20),
                    BookingCalculatorCard(
                      listing: _listing,
                      dateRange: _selectedDateRange,
                      onSelectDates: _selectDateRange,
                      onReserve: _handleReservation,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RuleTile extends StatelessWidget {
  final IconData icon;
  final String text;

  const _RuleTile({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFFE51D53)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }
}
