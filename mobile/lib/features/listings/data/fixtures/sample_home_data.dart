import '../../domain/entities/destination.dart';
import '../../domain/entities/listing.dart';

/// TEMPORARY fixture data so Home and Explore have something real to
/// render. Delete this file once the real listings API/data layer is
/// wired (`GetListings` usecase) and point both pages at that instead.
class SampleHomeData {
  SampleHomeData._();

  static const List<Destination> destinations = [
    Destination(
      city: 'Addis Ababa',
      stayCount: 312,
      photoUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53',
    ),
    Destination(
      city: 'Hawassa',
      stayCount: 128,
      photoUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    ),
    Destination(
      city: 'Bahir Dar',
      stayCount: 96,
      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    ),
    Destination(
      city: 'Lalibela',
      stayCount: 74,
      photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077',
    ),
    Destination(
      city: 'Dire Dawa',
      stayCount: 58,
      photoUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206',
    ),
  ];

  static const List<String> categories = [
    'Apartments',
    'Villas',
    'Hotels',
    'Guesthouses',
    'Private rooms',
    'Unique stays',
  ];

  /// Property types used by the Explore "Property type" filter — singular
  /// form, matching `Listing.category` exactly.
  static const List<String> propertyTypes = [
    'Apartment',
    'Villa',
    'Hotel',
    'Guesthouse',
    'Private room',
    'Unique stay',
  ];

  static const List<String> bathroomOptions = ['1', '2', '3', '4+'];

  static const List<String> amenityOptions = ['Wi-Fi', 'Kitchen', 'Free parking', 'Pool'];

  static const List<double> ratingOptions = [4.5, 4.0, 3.5];

  static const List<Listing> featuredListings = [
    Listing(
      id: 'bole-skyline-suite',
      title: 'Bole Skyline Suite',
      category: 'Apartment',
      neighborhood: 'Bole',
      city: 'Addis Ababa',
      pricePerNight: 4800,
      photoUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
      rating: 4.92,
      reviewCount: 168,
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Kitchen', 'Free parking'],
    ),
    Listing(
      id: 'hawassa-lake-villa',
      title: 'Hawassa Lake Villa',
      category: 'Villa',
      neighborhood: 'Lake Hawassa',
      city: 'Hawassa',
      pricePerNight: 9200,
      photoUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
      rating: 4.87,
      reviewCount: 94,
      bathrooms: 3,
      amenities: ['Wi-Fi', 'Kitchen', 'Pool'],
    ),
    Listing(
      id: 'lalibela-stone-guesthouse',
      title: 'Lalibela Stone Guesthouse',
      category: 'Guesthouse',
      neighborhood: 'Old Town',
      city: 'Lalibela',
      pricePerNight: 3400,
      photoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      rating: 4.95,
      reviewCount: 212,
      bathrooms: 1,
      amenities: ['Wi-Fi', 'Kitchen', 'Free parking'],
    ),
    Listing(
      id: 'bahir-dar-garden-house',
      title: 'Bahir Dar Garden House',
      category: 'Hotel',
      neighborhood: 'Tana Lakeside',
      city: 'Bahir Dar',
      pricePerNight: 5600,
      photoUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
      rating: 4.78,
      reviewCount: 141,
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Pool', 'Free parking'],
    ),
    Listing(
      id: 'kazanchis-loft',
      title: 'Kazanchis Design Loft',
      category: 'Private room',
      neighborhood: 'Kazanchis',
      city: 'Addis Ababa',
      pricePerNight: 2200,
      photoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      rating: 4.71,
      reviewCount: 63,
      bathrooms: 1,
      amenities: ['Wi-Fi', 'Kitchen'],
    ),
    Listing(
      id: 'dire-dawa-courtyard',
      title: 'Dire Dawa Courtyard Stay',
      category: 'Unique stay',
      neighborhood: 'Kezira',
      city: 'Dire Dawa',
      pricePerNight: 3900,
      photoUrl: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f',
      rating: 4.83,
      reviewCount: 77,
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Free parking'],
    ),
  ];

  /// Alias used by the Explore feature — same underlying data, clearer name.
  static List<Listing> get allListings => featuredListings;

  static double get minPrice =>
      featuredListings.map((l) => l.pricePerNight).reduce((a, b) => a < b ? a : b);

  static double get maxPrice =>
      featuredListings.map((l) => l.pricePerNight).reduce((a, b) => a > b ? a : b);
}