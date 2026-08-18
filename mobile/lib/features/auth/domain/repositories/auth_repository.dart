import '../../../../core/utils/result.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Result<User>> register({
    required String firstName,
    String? middleName,
    required String lastName,
    required String phoneNumber,
    required String email,
    required String password,
    required String role,
  });

  Future<Result<User>> login({
    required String email,
    required String password,
  });

  Future<Result<User>> getCurrentUser();
}