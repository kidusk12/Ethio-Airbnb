import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/listing_draft.dart';

class ListingFormState {
  final int step;
  final ListingDraft draft;

  const ListingFormState({
    this.step = 0,
    this.draft = const ListingDraft(),
  });

  ListingFormState copyWith({
    int? step,
    ListingDraft? draft,
  }) {
    return ListingFormState(
      step: step ?? this.step,
      draft: draft ?? this.draft,
    );
  }
}

class ListingFormController extends StateNotifier<ListingFormState> {
  ListingFormController() : super(const ListingFormState());

  void setStep(int step) {
    state = state.copyWith(step: step);
  }

  void updateDraft(ListingDraft draft) {
    state = state.copyWith(draft: draft);
  }

  void reset() {
    state = const ListingFormState();
  }
}

final listingFormProvider =
    StateNotifierProvider<ListingFormController, ListingFormState>((ref) {
  return ListingFormController();
});