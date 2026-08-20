class User {
  final String id;
  final String firstName;
  final String? middleName;
  final String lastName;
  final String phoneNumber;
  final String email;
  final String role;

  const User({
    required this.id,
    required this.firstName,
    this.middleName,
    required this.lastName,
    required this.phoneNumber,
    required this.email,
    required this.role,
  });

  String get fullName {
    return [firstName, middleName, lastName]
        .where((part) => part != null && part.trim().isNotEmpty)
        .join(' ');
  }

  // Keeps existing Profile and Host Dashboard code compatible.
  String get name => fullName;

  bool get isHost => role == 'host';
  bool get isAdmin => role == 'admin';
}