import '../../domain/entities/host_listing.dart';
import '../../domain/entities/host_recent_booking.dart';

/// MOCK data for the host dashboard.
///
/// - `listings` / `recentBookings`: temporary — swap for real
///   `GET /listings/my-listings` and `GET /bookings/host-bookings` calls
///   once the listings/bookings data layers exist (same pattern as
///   `SampleHomeData` on the guest side).
/// - `totalEarnings` / `reviewScore`: PERMANENTLY mock for this project
///   cycle — there is no earnings or aggregate-review-score endpoint by
///   design (financial analytics is explicitly out of scope per the
///   proposal). These numbers exist to make the dashboard UI feel real,
///   not because a backend produces them.
class SampleHostData {
  SampleHostData._();

  static const double totalEarnings = 58400;
  static const double reviewScore = 4.86;

  static const List<HostListing> listings = [
    HostListing(
      id: 'bole-skyline-suite',
      title: 'Bole Skyline Suite',
      category: 'Apartment',
      location: 'Bole, Addis Ababa',
      pricePerNight: 4800,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
    ),
    HostListing(
      id: 'kazanchis-loft',
      title: 'Kazanchis Design Loft',
      category: 'Private room',
      location: 'Kazanchis, Addis Ababa',
      pricePerNight: 2200,
      coverPhotoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    ),
  ];

  static const List<HostRecentBooking> recentBookings = [
    HostRecentBooking(
      id: 'b1',
      guestName: 'Selam T.',
      propertyName: 'Bole Skyline Suite',
      amount: 9600,
    ),
    HostRecentBooking(
      id: 'b2',
      guestName: 'Daniel A.',
      propertyName: 'Kazanchis Design Loft',
      amount: 6600,
    ),
  ];
}