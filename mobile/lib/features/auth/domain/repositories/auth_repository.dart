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

  Future<Result<User>> updateProfile({
    required String name,
    required String email,
  });

  Future<Result<bool>> changePassword({
    required String currentPassword,
    required String newPassword,
  });
}