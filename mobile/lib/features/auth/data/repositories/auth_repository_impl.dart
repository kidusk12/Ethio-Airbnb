import '../../../../core/network/api_exception.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<User>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final user = await _remoteDataSource.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      return Success(user);
    } on ApiException catch (e) {
      return Failure(e.message);
    } catch (_) {
      return const Failure('Could not connect. Check your internet connection.');
    }
  }

  @override
  Future<Result<User>> login({
    required String email,
    required String password,
  }) async {
    try {
      final user = await _remoteDataSource.login(email: email, password: password);
      return Success(user);
    } on ApiException catch (e) {
      return Failure(e.message);
    } catch (_) {
      return const Failure('Could not connect. Check your internet connection.');
    }
  }

  @override
  Future<Result<User>> getCurrentUser() async {
    try {
      final user = await _remoteDataSource.getCurrentUser();
      return Success(user);
    } on ApiException catch (e) {
      return Failure(e.message);
    } catch (_) {
      return const Failure('Could not connect. Check your internet connection.');
    }
  }
}