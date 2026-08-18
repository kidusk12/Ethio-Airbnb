class HostListing {
  final String id;
  final String title;
  final String category;
  final String location;
  final double pricePerNight;
  final String coverPhotoUrl;
  final bool active;

  const HostListing({
    required this.id,
    required this.title,
    required this.category,
    required this.location,
    required this.pricePerNight,
    required this.coverPhotoUrl,
    this.active = true,
  });
}