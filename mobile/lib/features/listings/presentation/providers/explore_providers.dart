import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/fixtures/sample_home_data.dart';
import '../../domain/entities/listing.dart';

enum SortOption { recommended, topRated, priceLowToHigh, priceHighToLow }

extension SortOptionLabel on SortOption {
  String get label {
    switch (this) {
      case SortOption.recommended:
        return 'Recommended';
      case SortOption.topRated:
        return 'Top rated';
      case SortOption.priceLowToHigh:
        return 'Price: low to high';
      case SortOption.priceHighToLow:
        return 'Price: high to low';
    }
  }
}

class ExploreState {
  final String location;
  final DateTimeRange? dateRange;
  final int guests;
  final String selectedType; // '' = any
  final String selectedBathroom; // '' = any, or '1'/'2'/'3'/'4+'
  final Set<String> selectedAmenities;
  final double? selectedRating;
  final RangeValues priceRange;
  final SortOption sortBy;
  final Set<String> favoriteIds;

  const ExploreState({
    this.location = '',
    this.dateRange,
    this.guests = 2,
    this.selectedType = '',
    this.selectedBathroom = '',
    this.selectedAmenities = const {},
    this.selectedRating,
    required this.priceRange,
    this.sortBy = SortOption.recommended,
    this.favoriteIds = const {},
  });

  int get activeFilterCount {
    var count = 0;
    if (selectedType.isNotEmpty) count++;
    if (selectedBathroom.isNotEmpty) count++;
    if (selectedAmenities.isNotEmpty) count++;
    if (selectedRating != null) count++;
    if (priceRange.start > SampleHomeData.minPrice || priceRange.end < SampleHomeData.maxPrice) count++;
    return count;
  }

  ExploreState copyWith({
    String? location,
    DateTimeRange? dateRange,
    bool clearDateRange = false,
    int? guests,
    String? selectedType,
    String? selectedBathroom,
    Set<String>? selectedAmenities,
    double? selectedRating,
    bool clearRating = false,
    RangeValues? priceRange,
    SortOption? sortBy,
    Set<String>? favoriteIds,
  }) {
    return ExploreState(
      location: location ?? this.location,
      dateRange: clearDateRange ? null : (dateRange ?? this.dateRange),
      guests: guests ?? this.guests,
      selectedType: selectedType ?? this.selectedType,
      selectedBathroom: selectedBathroom ?? this.selectedBathroom,
      selectedAmenities: selectedAmenities ?? this.selectedAmenities,
      selectedRating: clearRating ? null : (selectedRating ?? this.selectedRating),
      priceRange: priceRange ?? this.priceRange,
      sortBy: sortBy ?? this.sortBy,
      favoriteIds: favoriteIds ?? this.favoriteIds,
    );
  }
}

class ExploreController extends StateNotifier<ExploreState> {
  ExploreController()
      : super(ExploreState(
          priceRange: RangeValues(SampleHomeData.minPrice, SampleHomeData.maxPrice),
        ));

  void setLocation(String value) => state = state.copyWith(location: value);

  void setDateRange(DateTimeRange? range) {
    state = range == null ? state.copyWith(clearDateRange: true) : state.copyWith(dateRange: range);
  }

  void incrementGuests() => state = state.copyWith(guests: (state.guests + 1).clamp(1, 16));

  void decrementGuests() => state = state.copyWith(guests: (state.guests - 1).clamp(1, 16));

  void setType(String type) {
    state = state.copyWith(selectedType: state.selectedType == type ? '' : type);
  }

  void setBathroom(String bathroom) {
    state = state.copyWith(selectedBathroom: state.selectedBathroom == bathroom ? '' : bathroom);
  }

  void toggleAmenity(String amenity) {
    final updated = Set<String>.from(state.selectedAmenities);
    updated.contains(amenity) ? updated.remove(amenity) : updated.add(amenity);
    state = state.copyWith(selectedAmenities: updated);
  }

  void setRating(double rating) {
    state = state.selectedRating == rating
        ? state.copyWith(clearRating: true)
        : state.copyWith(selectedRating: rating);
  }

  void setPriceRange(RangeValues range) => state = state.copyWith(priceRange: range);

  void setSortBy(SortOption option) => state = state.copyWith(sortBy: option);

  void toggleFavorite(String listingId) {
    final updated = Set<String>.from(state.favoriteIds);
    updated.contains(listingId) ? updated.remove(listingId) : updated.add(listingId);
    state = state.copyWith(favoriteIds: updated);
  }

  void resetFilters() {
    state = ExploreState(
      priceRange: RangeValues(SampleHomeData.minPrice, SampleHomeData.maxPrice),
      guests: state.guests,
      favoriteIds: state.favoriteIds,
    );
  }
}

final exploreControllerProvider = StateNotifierProvider<ExploreController, ExploreState>((ref) {
  return ExploreController();
});

/// Derived, filtered + sorted listing results. Currently filters the
/// local fixture list — swap the `SampleHomeData.allListings` line for a
/// real `GetListings` usecase call once the listings API/data layer exists.
final filteredListingsProvider = Provider<List<Listing>>((ref) {
  final filters = ref.watch(exploreControllerProvider);
  var results = SampleHomeData.allListings.where((listing) {
    final matchesLocation = filters.location.trim().isEmpty ||
        '${listing.title} ${listing.location}'.toLowerCase().contains(filters.location.trim().toLowerCase());

    final matchesType = filters.selectedType.isEmpty || listing.category == filters.selectedType;

    final matchesBathroom = filters.selectedBathroom.isEmpty ||
        (filters.selectedBathroom == '4+'
            ? listing.bathrooms >= 4
            : listing.bathrooms == int.parse(filters.selectedBathroom));

    final matchesAmenities =
        filters.selectedAmenities.every((amenity) => listing.amenities.contains(amenity));

    final matchesRating = filters.selectedRating == null || listing.rating >= filters.selectedRating!;

    final matchesPrice =
        listing.pricePerNight >= filters.priceRange.start && listing.pricePerNight <= filters.priceRange.end;

    return matchesLocation && matchesType && matchesBathroom && matchesAmenities && matchesRating && matchesPrice;
  }).toList();

  switch (filters.sortBy) {
    case SortOption.priceLowToHigh:
      results.sort((a, b) => a.pricePerNight.compareTo(b.pricePerNight));
      break;
    case SortOption.priceHighToLow:
      results.sort((a, b) => b.pricePerNight.compareTo(a.pricePerNight));
      break;
    case SortOption.topRated:
      results.sort((a, b) => b.rating.compareTo(a.rating));
      break;
    case SortOption.recommended:
      break;
  }

  return results;
});