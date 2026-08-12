class User {
  final String id;
  final String name;
  final String email;
  final String role; // 'guest' | 'host' | 'admin'

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  bool get isHost => role == 'host';
  bool get isAdmin => role == 'admin';
}