import 'package:flutter/material.dart';

class CategoryChipRow extends StatelessWidget {
  final List<String> categories;
  final ValueChanged<String> onSelected;

  const CategoryChipRow({super.key, required this.categories, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          return ActionChip(
            label: Text(category),
            onPressed: () => onSelected(category),
          );
        },
      ),
    );
  }
}