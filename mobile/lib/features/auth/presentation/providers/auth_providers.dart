import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/token_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/get_current_user.dart';
import '../../domain/usecases/login_user.dart';
import '../../domain/usecases/register_user.dart';

// --- Infrastructure -------------------------------------------------------

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
});

// --- Data layer -------------------------------------------------------------

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSource(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(authRemoteDataSourceProvider));
});

// --- Domain layer (usecases) -------------------------------------------------

final registerUserProvider = Provider<RegisterUser>((ref) {
  return RegisterUser(ref.watch(authRepositoryProvider));
});

final loginUserProvider = Provider<LoginUser>((ref) {
  return LoginUser(ref.watch(authRepositoryProvider));
});

final getCurrentUserProvider = Provider<GetCurrentUser>((ref) {
  return GetCurrentUser(ref.watch(authRepositoryProvider));
});

// --- Presentation layer -------------------------------------------------------

sealed class AuthState {
  const AuthState();
}

class AuthIdle extends AuthState {
  const AuthIdle();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthSuccess extends AuthState {
  final User user;
  const AuthSuccess(this.user);
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthController extends StateNotifier<AuthState> {
  final RegisterUser _registerUser;
  final LoginUser _loginUser;

  AuthController({
    required RegisterUser registerUser,
    required LoginUser loginUser,
  })  : _registerUser = registerUser,
        _loginUser = loginUser,
        super(const AuthIdle());

  Future<void> register({
    required String name,
    required String emailOrPhone,
    required String password,
    required String role,
  }) async {
    state = const AuthLoading();

    final result = await _registerUser(
      name: name,
      email: emailOrPhone,
      password: password,
      role: role,
    );

    state = result.fold(
      (message) => AuthError(message),
      (user) => AuthSuccess(user),
    );
  }

  Future<void> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = const AuthLoading();

    final result = await _loginUser(email: emailOrPhone, password: password);

    state = result.fold(
      (message) => AuthError(message),
      (user) => AuthSuccess(user),
    );
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    registerUser: ref.watch(registerUserProvider),
    loginUser: ref.watch(loginUserProvider),
  );
});