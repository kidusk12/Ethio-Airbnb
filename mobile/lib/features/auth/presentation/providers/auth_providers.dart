import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/token_storage.dart';
import '../../../../core/utils/result.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/get_current_user.dart';
import '../../domain/usecases/login_user.dart';
import '../../domain/usecases/register_user.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSource(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(authRemoteDataSourceProvider));
});

final registerUserProvider = Provider<RegisterUser>((ref) {
  return RegisterUser(ref.watch(authRepositoryProvider));
});

final loginUserProvider = Provider<LoginUser>((ref) {
  return LoginUser(ref.watch(authRepositoryProvider));
});

final getCurrentUserProvider = Provider<GetCurrentUser>((ref) {
  return GetCurrentUser(ref.watch(authRepositoryProvider));
});

sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthIdle extends AuthState {
  const AuthIdle();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

/// A registered account exists, but it is not authenticated yet.
class RegistrationSuccess extends AuthState {
  final User user;

  const RegistrationSuccess(this.user);
}

/// The user has a valid JWT session.
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
  final GetCurrentUser _getCurrentUser;
  final AuthRepository _authRepository;
  final TokenStorage _tokenStorage;

  AuthController({
    required RegisterUser registerUser,
    required LoginUser loginUser,
    required GetCurrentUser getCurrentUser,
    required AuthRepository authRepository,
    required TokenStorage tokenStorage,
  })  : _registerUser = registerUser,
        _loginUser = loginUser,
        _getCurrentUser = getCurrentUser,
        _authRepository = authRepository,
        _tokenStorage = tokenStorage,
        super(const AuthInitial()) {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final token = await _tokenStorage.getToken();

    if (token == null) {
      state = const AuthIdle();
      return;
    }

    final result = await _getCurrentUser();

    state = result.fold(
      (_) => const AuthIdle(),
      (user) => AuthSuccess(user),
    );
  }

  Future<void> register({
    required String firstName,
    String? middleName,
    required String lastName,
    required String phoneNumber,
    required String email,
    required String password,
    required String role,
  }) async {
    state = const AuthLoading();

    final result = await _registerUser(
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      email: email,
      password: password,
      role: role,
    );

    state = result.fold(
      (message) => AuthError(message),
      (user) => RegistrationSuccess(user),
    );
  }

  Future<void> login({
    required String emailOrPhone,
    required String password,
  }) async {
    state = const AuthLoading();

    final result = await _loginUser(
      email: emailOrPhone,
      password: password,
    );

    state = result.fold(
      (message) => AuthError(message),
      (user) => AuthSuccess(user),
    );
  }

  Future<Result<User>> updateProfile({
    required String name,
    required String email,
  }) async {
    final result = await _authRepository.updateProfile(name: name, email: email);
    result.fold(
      (_) {},
      (user) => state = AuthSuccess(user),
    );
    return result;
  }

  Future<Result<bool>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    return _authRepository.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
  }

  Future<void> logout() async {
    await _tokenStorage.clearToken();
    state = const AuthIdle();
  }

  bool get isAuthenticated => state is AuthSuccess;
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    registerUser: ref.watch(registerUserProvider),
    loginUser: ref.watch(loginUserProvider),
    getCurrentUser: ref.watch(getCurrentUserProvider),
    authRepository: ref.watch(authRepositoryProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});