enum ListingApprovalStatus { pending, approved, rejected }

class PendingListing {
  final String id;
  final String hostId;
  final String hostName;
  final String propertyTitle;
  final List<String> fileUrls; // photos + docs the host submitted
  final DateTime submittedAt;
  final ListingApprovalStatus status;
  final String? rejectionReason;

  const PendingListing({
    required this.id,
    required this.hostId,
    required this.hostName,
    required this.propertyTitle,
    required this.fileUrls,
    required this.submittedAt,
    this.status = ListingApprovalStatus.pending,
    this.rejectionReason,
  });

  PendingListing copyWith({
    String? id,
    String? hostId,
    String? hostName,
    String? propertyTitle,
    List<String>? fileUrls,
    DateTime? submittedAt,
    ListingApprovalStatus? status,
    String? rejectionReason,
  }) {
    return PendingListing(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      hostName: hostName ?? this.hostName,
      propertyTitle: propertyTitle ?? this.propertyTitle,
      fileUrls: fileUrls ?? this.fileUrls,
      submittedAt: submittedAt ?? this.submittedAt,
      status: status ?? this.status,
      rejectionReason: rejectionReason ?? this.rejectionReason,
    );
  }
}
