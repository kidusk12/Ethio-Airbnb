import '../../../../core/utils/result.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUser {
  final AuthRepository repository;

  RegisterUser(this.repository);

  Future<Result<User>> call({
    required String firstName,
    String? middleName,
    required String lastName,
    required String phoneNumber,
    required String email,
    required String password,
    required String role,
  }) {
    return repository.register(
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      email: email,
      password: password,
      role: role,
    );
  }
}