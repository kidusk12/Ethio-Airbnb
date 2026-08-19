import 'package:flutter/material.dart';

class ListingSpecsRow extends StatelessWidget {
  const ListingSpecsRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: const [
        _SpecItem(icon: Icons.group_outlined, label: '4 guests'),
        _SpecItem(icon: Icons.meeting_room_outlined, label: '2 bedrooms'),
        _SpecItem(icon: Icons.bed_outlined, label: '2 beds'),
        _SpecItem(icon: Icons.bathtub_outlined, label: '2 baths'),
      ],
    );
  }
}

class _SpecItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SpecItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade700),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: Colors.black87, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}