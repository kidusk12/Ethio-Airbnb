class ListingDraft {
  final String propertyType;
  final String streetAddress;
  final String city;
  final String region;
  final String subCity;
  final String title;
  final String description;
  final Set<String> amenities;
  final int guests;
  final int bedrooms;
  final int bathrooms;
  final double? pricePerNight;
  final List<DateTime> blockedDates;
  final List<String> houseRules;

  const ListingDraft({
    this.propertyType = '',
    this.streetAddress = '',
    this.city = '',
    this.region = '',
    this.subCity = '',
    this.title = '',
    this.description = '',
    this.amenities = const {},
    this.guests = 2,
    this.bedrooms = 1,
    this.bathrooms = 1,
    this.pricePerNight,
    this.blockedDates = const [],
    this.houseRules = const [],
  });

  ListingDraft copyWith({
    String? propertyType,
    String? streetAddress,
    String? city,
    String? region,
    String? subCity,
    String? title,
    String? description,
    Set<String>? amenities,
    int? guests,
    int? bedrooms,
    int? bathrooms,
    double? pricePerNight,
    List<DateTime>? blockedDates,
    List<String>? houseRules,
  }) {
    return ListingDraft(
      propertyType: propertyType ?? this.propertyType,
      streetAddress: streetAddress ?? this.streetAddress,
      city: city ?? this.city,
      region: region ?? this.region,
      subCity: subCity ?? this.subCity,
      title: title ?? this.title,
      description: description ?? this.description,
      amenities: amenities ?? this.amenities,
      guests: guests ?? this.guests,
      bedrooms: bedrooms ?? this.bedrooms,
      bathrooms: bathrooms ?? this.bathrooms,
      pricePerNight: pricePerNight ?? this.pricePerNight,
      blockedDates: blockedDates ?? this.blockedDates,
      houseRules: houseRules ?? this.houseRules,
    );
  }
}