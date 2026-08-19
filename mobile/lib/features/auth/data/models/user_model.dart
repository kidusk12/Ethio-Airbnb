import '../../domain/entities/user.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.firstName,
    super.middleName,
    required super.lastName,
    required super.phoneNumber,
    required super.email,
    required super.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    String firstName = (json['firstName'] as String?) ?? '';
    String lastName = (json['lastName'] as String?) ?? '';
    if (firstName.isEmpty && json['name'] != null) {
      final parts = (json['name'] as String).trim().split(' ');
      firstName = parts.first;
      if (parts.length > 1) {
        lastName = parts.sublist(1).join(' ');
      }
    }

    return UserModel(
      id: (json['id'] ?? '').toString(),
      firstName: firstName,
      middleName: json['middleName'] as String?,
      lastName: lastName,
      phoneNumber: (json['phoneNumber'] as String?) ?? '',
      email: (json['email'] as String?) ?? '',
      role: (json['role'] as String?) ?? 'guest',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'firstName': firstName,
        'middleName': middleName,
        'lastName': lastName,
        'phoneNumber': phoneNumber,
        'email': email,
        'role': role,
      };
}