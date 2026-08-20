import 'package:flutter/material.dart';

class ListingHostInfoRow extends StatelessWidget {
  final String? hostName;
  final String? hostDetails;
  final String? hostImageUrl;
  final String? avatarUrl;
  final VoidCallback? onContactHost;

  const ListingHostInfoRow({
    super.key,
    this.hostName,
    this.hostDetails,
    this.hostImageUrl,
    this.avatarUrl,
    this.onContactHost,
  });

  @override
  Widget build(BuildContext context) {
    // Fallbacks to handle any combination of parameters safely
    final displayName = hostName ?? 'Host';
    final displayDetails = hostDetails ?? 'Superhost · Joined recently';
    final displayImage = (avatarUrl != null && avatarUrl!.isNotEmpty)
        ? avatarUrl
        : hostImageUrl;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Colors.grey.shade200,
                  backgroundImage:
                      displayImage != null && displayImage.isNotEmpty
                      ? NetworkImage(displayImage)
                      : null,
                  child: displayImage == null || displayImage.isEmpty
                      ? const Icon(Icons.person, color: Colors.grey, size: 28)
                      : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Hosted by $displayName',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        displayDetails,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 13,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
