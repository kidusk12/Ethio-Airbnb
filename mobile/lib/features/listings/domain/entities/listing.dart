class Listing {
  final String id;
  final String title;
  final String category;
  final String neighborhood;
  final String city;
  final double pricePerNight;
  final String photoUrl;
  final double rating;
  final int reviewCount;
  final int bathrooms;
  final List<String> amenities;

  // Detail screen and display properties
  final String hostName;
  final String hostDetails;
  final String description;
  final int maxGuests;
  final List<String> images;

  const Listing({
    required this.id,
    required this.title,
    required this.category,
    required this.neighborhood,
    required this.city,
    required this.pricePerNight,
    required this.photoUrl,
    required this.rating,
    required this.reviewCount,
    this.bathrooms = 1,
    this.amenities = const [],
    this.hostName = 'Host',
    this.hostDetails = 'Verified Host',
    this.description = '',
    this.maxGuests = 2,
    this.images = const [],
  });

  String get location => '$neighborhood, $city';
}