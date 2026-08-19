import 'package:flutter/material.dart';

class ListingAmenitiesSection extends StatelessWidget {
  const ListingAmenitiesSection({super.key});

  final List<Map<String, dynamic>> amenities = const [
    {'icon': Icons.wifi, 'label': 'Fast Wi-Fi'},
    {'icon': Icons.power, 'label': 'Backup generator'},
    {'icon': Icons.kitchen, 'label': 'Kitchen'},
    {'icon': Icons.local_parking, 'label': 'Free parking'},
    {'icon': Icons.ac_unit, 'label': 'Air conditioning'},
    {'icon': Icons.local_laundry_service, 'label': 'Washer'},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What this place offers',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 4,
            crossAxisSpacing: 8,
            mainAxisSpacing: 12,
          ),
          itemCount: amenities.length,
          itemBuilder: (context, index) {
            final item = amenities[index];
            return Row(
              children: [
                Icon(item['icon'] as IconData, size: 20, color: Colors.black87),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    item['label'] as String,
                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}