import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../auth/presentation/widgets/terms_content.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../domain/entities/listing_draft.dart';
import '../providers/listing_providers.dart';

class ListingFormPage extends ConsumerStatefulWidget {
  const ListingFormPage({super.key});

  @override
  ConsumerState<ListingFormPage> createState() => _ListingFormPageState();
}

class _PickedPhoto {
  final XFile file;
  final Uint8List bytes;

  const _PickedPhoto({required this.file, required this.bytes});
}

class _ListingFormPageState extends ConsumerState<ListingFormPage> {
  static const _steps = [
    'Property type',
    'Location',
    'Documents',
    'Photos',
    'Description',
    'Amenities',
    'Rooms',
    'Pricing',
    'Availability',
    'House rules',
  ];

  static const _locations = {
    'Addis Ababa': {
      'Addis Ababa': [
        'Bole',
        'Kirkos',
        'Yeka',
        'Lideta',
        'Arada',
        'Kolfe Keranio',
      ],
    },
    'Oromia': {
      'Adama': ['Bole', 'Kebele 01', 'Kebele 02'],
      'Bishoftu': ['Babogaya', 'Kebele 01'],
      'Jimma': ['Jiren', 'Mentina'],
    },
    'Amhara': {
      'Bahir Dar': ['Tana Lakeside', 'Kebele 03', 'Kebele 14'],
      'Gondar': ['Arada', 'Azezo'],
      'Lalibela': ['Old Town', 'Kebele 01'],
    },
    'Sidama': {
      'Hawassa': ['Lake Hawassa', 'Tabor', 'Hayk Dar'],
    },
    'Dire Dawa': {
      'Dire Dawa': ['Kezira', 'Megala', 'Sabian'],
    },
    'Tigray': {
      'Mekelle': ['Hawelti', 'Adi Haki'],
    },
  };

  static const _amenities = [
    ('Wi-Fi', Icons.wifi),
    ('Kitchen', Icons.kitchen_outlined),
    ('Free parking', Icons.local_parking_outlined),
    ('Washer', Icons.local_laundry_service_outlined),
  ];

  static const _commonRules = [
    'No parties or events',
    'No smoking indoors',
    'Pets allowed on request',
    'Quiet hours after 10 PM',
  ];

  final _pageController = PageController();
  final _imagePicker = ImagePicker();

  final _streetController = TextEditingController();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _otherRuleController = TextEditingController();

  String? _selectedRegion;
  String? _selectedCity;
  String? _selectedSubCity;

  PlatformFile? _identityDocument;
  PlatformFile? _houseDeed;
  final List<_PickedPhoto> _photos = [];

  @override
  void dispose() {
    _pageController.dispose();
    _streetController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _otherRuleController.dispose();
    super.dispose();
  }

  ListingDraft get _draft => ref.read(listingFormProvider).draft;

  void _updateDraft(ListingDraft draft) {
    ref.read(listingFormProvider.notifier).updateDraft(draft);
  }

  Future<void> _pickDocument({required bool identity}) async {
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result == null || result.files.isEmpty) return;

    setState(() {
      if (identity) {
        _identityDocument = result.files.single;
      } else {
        _houseDeed = result.files.single;
      }
    });
  }

  Future<void> _pickPhotos() async {
    final selected = await _imagePicker.pickMultiImage(imageQuality: 80);

    if (selected.isEmpty) return;

    final pickedPhotos = <_PickedPhoto>[];

    for (final image in selected) {
      pickedPhotos.add(
        _PickedPhoto(file: image, bytes: await image.readAsBytes()),
      );
    }

    if (!mounted) return;

    setState(() => _photos.addAll(pickedPhotos));
  }

  Future<void> _addBlockedDate() async {
    final selectedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );

    if (selectedDate == null) return;

    final exists = _draft.blockedDates.any(
      (date) =>
          date.year == selectedDate.year &&
          date.month == selectedDate.month &&
          date.day == selectedDate.day,
    );

    if (!exists) {
      _updateDraft(
        _draft.copyWith(blockedDates: [..._draft.blockedDates, selectedDate]),
      );
    }
  }

  void _saveTextFields() {
    _updateDraft(
      _draft.copyWith(
        streetAddress: _streetController.text.trim(),
        region: _selectedRegion ?? '',
        city: _selectedCity ?? '',
        subCity: _selectedSubCity ?? '',
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        pricePerNight: double.tryParse(_priceController.text.trim()),
      ),
    );
  }

  bool _isStepValid() {
    switch (ref.read(listingFormProvider).step) {
      case 0:
        return _draft.propertyType.isNotEmpty;
      case 1:
        return _streetController.text.trim().isNotEmpty &&
            _selectedRegion != null &&
            _selectedCity != null &&
            _selectedSubCity != null;
      case 2:
        return _identityDocument != null && _houseDeed != null;
      case 3:
        return _photos.isNotEmpty;
      case 4:
        return _titleController.text.trim().isNotEmpty &&
            _descriptionController.text.trim().isNotEmpty;
      case 7:
        final price = double.tryParse(_priceController.text.trim());
        return price != null && price > 0;
      default:
        return true;
    }
  }

  void _next() {
    if (!_isStepValid()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please complete this step before continuing.'),
        ),
      );
      return;
    }

    _saveTextFields();

    final currentStep = ref.read(listingFormProvider).step;

    if (currentStep == _steps.length - 1) {
      _showPublishSheet();
      return;
    }

    ref.read(listingFormProvider.notifier).setStep(currentStep + 1);

    _pageController.nextPage(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  void _back() {
    final currentStep = ref.read(listingFormProvider).step;

    if (currentStep == 0) {
      context.pop();
      return;
    }

    _saveTextFields();
    ref.read(listingFormProvider.notifier).setStep(currentStep - 1);

    _pageController.previousPage(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  void _showPublishSheet() {
    bool agreedToTerms = false;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (sheetContext, setSheetState) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.hourglass_top_rounded,
                      color: AppColors.warning,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Ready to publish?',
                      style: AppTextStyles.displayMedium,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '${_titleController.text.trim()} will be submitted for admin review.',
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyMedium,
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Checkbox(
                          value: agreedToTerms,
                          onChanged: (value) => setSheetState(
                            () => agreedToTerms = value ?? false,
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setSheetState(
                              () => agreedToTerms = !agreedToTerms,
                            ),
                            child: Text(
                              'I agree to the Terms & Conditions',
                              style: AppTextStyles.bodyMedium,
                            ),
                          ),
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (dialogContext) => Dialog(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: SizedBox(
                              width: double.maxFinite,
                              height: 500,
                              child: Column(
                                children: [
                                  AppBar(
                                    title: const Text('Terms & Conditions'),
                                    automaticallyImplyLeading: false,
                                    actions: [
                                      IconButton(
                                        icon: const Icon(Icons.close),
                                        onPressed: () =>
                                            Navigator.of(dialogContext).pop(),
                                      ),
                                    ],
                                  ),
                                  Expanded(
                                    child: SingleChildScrollView(
                                      padding: const EdgeInsets.all(20),
                                      child: const TermsContent(),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      child: const Text('Read Terms & Conditions'),
                    ),
                    const SizedBox(height: 8),
                    PrimaryButton(
                      label: 'Publish listing',
                      onPressed: agreedToTerms
                          ? () {
                              Navigator.pop(sheetContext);
                              _showSubmittedDialog();
                            }
                          : null,
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () => Navigator.pop(sheetContext),
                      child: const Text('Continue editing'),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showSubmittedDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          icon: const Icon(
            Icons.check_circle_outline,
            color: AppColors.success,
            size: 44,
          ),
          title: const Text('Submitted for review'),
          content: const Text(
            'Your listing is pending admin approval. '
            'It will become active after approval.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
                ref.read(listingFormProvider.notifier).reset();
                context.go('/host/home');
              },
              child: const Text('Go to dashboard'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(listingFormProvider);
    final progress = (state.step + 1) / _steps.length;

    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceElevated,
        leading: IconButton(
          onPressed: _back,
          icon: const Icon(Icons.arrow_back),
        ),
        title: const Text('Create listing'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Step ${state.step + 1} of ${_steps.length}',
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(_steps[state.step], style: AppTextStyles.displayMedium),
                const SizedBox(height: 14),
                LinearProgressIndicator(
                  value: progress,
                  minHeight: 7,
                  borderRadius: BorderRadius.circular(20),
                  color: AppColors.primary,
                  backgroundColor: AppColors.primaryLight,
                ),
              ],
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _propertyTypeStep(),
                _locationStep(),
                _documentsStep(),
                _photosStep(),
                _descriptionStep(),
                _amenitiesStep(),
                _roomsStep(),
                _pricingStep(),
                _availabilityStep(),
                _houseRulesStep(),
              ],
            ),
          ),
          SafeArea(
            top: false,
            child: Container(
              color: AppColors.surfaceElevated,
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
              child: Row(
                children: [
                  if (state.step > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _back,
                        child: const Text('Back'),
                      ),
                    ),
                  if (state.step > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: PrimaryButton(
                      label: state.step == _steps.length - 1
                          ? 'Preview & publish'
                          : 'Continue',
                      onPressed: _next,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepBody({
    required String title,
    required String subtitle,
    required Widget child,
    required String tip,
  }) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      children: [
        Text(title, style: AppTextStyles.titleLarge),
        const SizedBox(height: 6),
        Text(subtitle, style: AppTextStyles.bodyMedium),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.surfaceElevated,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
          ),
          child: child,
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.lightbulb_outline, color: AppColors.primary),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  tip,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _propertyTypeStep() {
    const types = [
      'Apartment',
      'Villa',
      'Hotel',
      'Guesthouse',
      'Private room',
      'Unique stay',
    ];

    return _stepBody(
      title: 'What type of place are you listing?',
      subtitle: 'Choose the option that best describes your property.',
      tip: 'Choose the closest option. You can edit listing details later.',
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: types.map((type) {
          return ChoiceChip(
            label: Text(type),
            selected: _draft.propertyType == type,
            onSelected: (_) {
              _updateDraft(_draft.copyWith(propertyType: type));
            },
          );
        }).toList(),
      ),
    );
  }

  Widget _locationStep() {
    final cities = _selectedRegion == null
        ? <String>[]
        : _locations[_selectedRegion]!.keys.toList();

    final subCities = _selectedCity == null
        ? <String>[]
        : _locations[_selectedRegion]![_selectedCity]!;

    return _stepBody(
      title: 'Where is your property?',
      subtitle: 'Select the area where guests will stay.',
      tip:
          'The street address is used for booking administration. Guests see the general area.',
      child: Column(
        children: [
          TextField(
            controller: _streetController,
            decoration: const InputDecoration(hintText: 'Street address'),
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            value: _selectedRegion,
            decoration: const InputDecoration(hintText: 'Select region'),
            items: _locations.keys
                .map(
                  (region) =>
                      DropdownMenuItem(value: region, child: Text(region)),
                )
                .toList(),
            onChanged: (value) {
              setState(() {
                _selectedRegion = value;
                _selectedCity = null;
                _selectedSubCity = null;
              });
            },
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            value: _selectedCity,
            decoration: const InputDecoration(hintText: 'Select city'),
            items: cities
                .map((city) => DropdownMenuItem(value: city, child: Text(city)))
                .toList(),
            onChanged: _selectedRegion == null
                ? null
                : (value) {
                    setState(() {
                      _selectedCity = value;
                      _selectedSubCity = null;
                    });
                  },
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            value: _selectedSubCity,
            decoration: const InputDecoration(
              hintText: 'Select sub-city / area',
            ),
            items: subCities
                .map(
                  (subCity) =>
                      DropdownMenuItem(value: subCity, child: Text(subCity)),
                )
                .toList(),
            onChanged: _selectedCity == null
                ? null
                : (value) {
                    setState(() => _selectedSubCity = value);
                  },
          ),
        ],
      ),
    );
  }

  Widget _documentsStep() {
    return _stepBody(
      title: 'Verify your property',
      subtitle: 'Upload documents for private admin verification.',
      tip: 'Your ID and ownership documents are never visible to guests.',
      child: Column(
        children: [
          _documentTile(
            label: 'ID or passport',
            file: _identityDocument,
            onTap: () => _pickDocument(identity: true),
          ),
          const SizedBox(height: 14),
          _documentTile(
            label: 'House deed or rental right',
            file: _houseDeed,
            onTap: () => _pickDocument(identity: false),
          ),
        ],
      ),
    );
  }

  Widget _documentTile({
    required String label,
    required PlatformFile? file,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: file == null ? AppColors.border : AppColors.primary,
        ),
      ),
      leading: Icon(
        file == null ? Icons.upload_file_outlined : Icons.check_circle_outline,
        color: file == null ? AppColors.textMuted : AppColors.success,
      ),
      title: Text(label, style: AppTextStyles.titleMedium),
      subtitle: Text(file?.name ?? 'Tap to select PDF or image'),
      trailing: const Icon(Icons.chevron_right),
    );
  }

  Widget _photosStep() {
    return _stepBody(
      title: 'Add property photos',
      subtitle: 'Add clear photos so guests understand your space.',
      tip:
          'Use bright photos of the bedrooms, bathroom, kitchen, and main living space.',
      child: Column(
        children: [
          if (_photos.isNotEmpty)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _photos.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemBuilder: (_, index) {
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.memory(
                        _photos[index].bytes,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: IconButton(
                        onPressed: () {
                          setState(() => _photos.removeAt(index));
                        },
                        icon: const CircleAvatar(
                          radius: 15,
                          backgroundColor: Colors.black54,
                          child: Icon(
                            Icons.close,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          if (_photos.isNotEmpty) const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: _pickPhotos,
            icon: const Icon(Icons.add_photo_alternate_outlined),
            label: Text(_photos.isEmpty ? 'Add photos' : 'Add more photos'),
          ),
        ],
      ),
    );
  }

  Widget _descriptionStep() {
    return _stepBody(
      title: 'Tell guests about your place',
      subtitle: 'A good description helps guests choose with confidence.',
      tip:
          'Mention nearby landmarks, comfort, and anything unique about the property.',
      child: Column(
        children: [
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(hintText: 'Listing title'),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _descriptionController,
            minLines: 6,
            maxLines: 8,
            decoration: const InputDecoration(
              hintText:
                  'Describe the space, neighbourhood, and what makes it special.',
            ),
          ),
        ],
      ),
    );
  }

  Widget _amenitiesStep() {
    return _stepBody(
      title: 'What does your place offer?',
      subtitle: 'Select the amenities available for guests.',
      tip: 'Only select amenities that are consistently available.',
      child: Column(
        children: _amenities.map((amenity) {
          final label = amenity.$1;
          final icon = amenity.$2;
          final selected = _draft.amenities.contains(label);

          return CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: selected,
            controlAffinity: ListTileControlAffinity.leading,
            secondary: Icon(icon, color: AppColors.primary),
            title: Text(label, style: AppTextStyles.bodyLarge),
            onChanged: (_) {
              final selectedAmenities = Set<String>.from(_draft.amenities);

              if (selected) {
                selectedAmenities.remove(label);
              } else {
                selectedAmenities.add(label);
              }

              _updateDraft(_draft.copyWith(amenities: selectedAmenities));
            },
          );
        }).toList(),
      ),
    );
  }

  Widget _roomsStep() {
    return _stepBody(
      title: 'Rooms and capacity',
      subtitle: 'Tell guests how many people and rooms your property supports.',
      tip: 'Set a realistic guest capacity for a comfortable stay.',
      child: Column(
        children: [
          _counter(
            label: 'Guests',
            value: _draft.guests,
            minimum: 1,
            onChanged: (value) {
              _updateDraft(_draft.copyWith(guests: value));
            },
          ),
          _counter(
            label: 'Bedrooms',
            value: _draft.bedrooms,
            minimum: 0,
            onChanged: (value) {
              _updateDraft(_draft.copyWith(bedrooms: value));
            },
          ),
          _counter(
            label: 'Bathrooms',
            value: _draft.bathrooms,
            minimum: 1,
            onChanged: (value) {
              _updateDraft(_draft.copyWith(bathrooms: value));
            },
          ),
        ],
      ),
    );
  }

  Widget _counter({
    required String label,
    required int value,
    required int minimum,
    required ValueChanged<int> onChanged,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(label, style: AppTextStyles.titleMedium),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            onPressed: value > minimum ? () => onChanged(value - 1) : null,
            icon: const Icon(Icons.remove_circle_outline),
          ),
          Text('$value', style: AppTextStyles.titleLarge),
          IconButton(
            onPressed: () => onChanged(value + 1),
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
    );
  }

  Widget _pricingStep() {
    return _stepBody(
      title: 'Set your nightly price',
      subtitle: 'Guests will see this amount in Ethiopian birr.',
      tip: 'Compare similar places nearby to choose a competitive price.',
      child: TextField(
        controller: _priceController,
        keyboardType: TextInputType.number,
        decoration: const InputDecoration(hintText: 'Nightly price in ETB'),
      ),
    );
  }

  Widget _availabilityStep() {
    return _stepBody(
      title: 'Set availability',
      subtitle: 'Add dates when your property cannot be booked.',
      tip: 'You can update blocked dates later from your host dashboard.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OutlinedButton.icon(
            onPressed: _addBlockedDate,
            icon: const Icon(Icons.calendar_month_outlined),
            label: const Text('Block a date'),
          ),
          const SizedBox(height: 16),
          if (_draft.blockedDates.isEmpty)
            Text('No dates are blocked yet.', style: AppTextStyles.bodyMedium)
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _draft.blockedDates.map((date) {
                final label = date.toIso8601String().substring(0, 10);

                return InputChip(
                  label: Text(label),
                  onDeleted: () {
                    _updateDraft(
                      _draft.copyWith(
                        blockedDates: _draft.blockedDates
                            .where((item) => item != date)
                            .toList(),
                      ),
                    );
                  },
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _houseRulesStep() {
    return _stepBody(
      title: 'Set house rules',
      subtitle: 'Select the rules that apply to your property.',
      tip:
          'Clear rules help prevent misunderstandings between hosts and guests.',
      child: Column(
        children: [
          ..._commonRules.map((rule) {
            final selected = _draft.houseRules.contains(rule);

            return CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              value: selected,
              controlAffinity: ListTileControlAffinity.leading,
              title: Text(rule, style: AppTextStyles.bodyLarge),
              onChanged: (_) {
                final rules = List<String>.from(_draft.houseRules);

                if (selected) {
                  rules.remove(rule);
                } else {
                  rules.add(rule);
                }

                _updateDraft(_draft.copyWith(houseRules: rules));
              },
            );
          }),
          const SizedBox(height: 12),
          TextField(
            controller: _otherRuleController,
            decoration: InputDecoration(
              hintText: 'Other house rule',
              suffixIcon: IconButton(
                icon: const Icon(Icons.add),
                tooltip: 'Add rule',
                onPressed: () {
                  final rule = _otherRuleController.text.trim();

                  if (rule.isEmpty || _draft.houseRules.contains(rule)) {
                    return;
                  }

                  _updateDraft(
                    _draft.copyWith(houseRules: [..._draft.houseRules, rule]),
                  );

                  _otherRuleController.clear();
                },
              ),
            ),
          ),
          if (_draft.houseRules
              .where((rule) => !_commonRules.contains(rule))
              .isNotEmpty) ...[
            const SizedBox(height: 12),
            ..._draft.houseRules
                .where((rule) => !_commonRules.contains(rule))
                .map(
                  (rule) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.check_circle_outline,
                      color: AppColors.primary,
                    ),
                    title: Text(rule),
                    trailing: IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        _updateDraft(
                          _draft.copyWith(
                            houseRules: _draft.houseRules
                                .where((item) => item != rule)
                                .toList(),
                          ),
                        );
                      },
                    ),
                  ),
                ),
          ],
        ],
      ),
    );
  }
}
