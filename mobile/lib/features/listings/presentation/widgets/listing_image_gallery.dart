import 'package:flutter/material.dart';

class ListingImageGallery extends StatefulWidget {
  final List<String> images;

  const ListingImageGallery({super.key, required this.images});

  @override
  State<ListingImageGallery> createState() => _ListingImageGalleryState();
}

class _ListingImageGalleryState extends State<ListingImageGallery> {
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SizedBox(
          height: 280,
          child: PageView.builder(
            itemCount: widget.images.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (context, index) {
              return Image.network(
                widget.images[index],
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: Colors.grey.shade300,
                  child: const Icon(Icons.apartment, size: 50, color: Colors.grey),
                ),
              );
            },
          ),
        ),

        // Back, Share & Save Overlay Buttons
        Positioned(
          top: 12,
          left: 16,
          right: 16,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.black, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.share_outlined, color: Colors.black, size: 20),
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.favorite_border, color: Colors.black, size: 20),
                      onPressed: () {},
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Image Counter Indicator
        Positioned(
          bottom: 12,
          right: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '${_currentPage + 1} / ${widget.images.length}',
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}