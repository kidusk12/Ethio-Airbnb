import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/token_storage.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  AuthRemoteDataSource({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
  }) : _apiClient = apiClient,
       _tokenStorage = tokenStorage;

  Future<UserModel> register({
    required String firstName,
    String? middleName,
    required String lastName,
    required String phoneNumber,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.register,
      body: {
        'firstName': firstName,
        'middleName': middleName,
        'lastName': lastName,
        'phoneNumber': phoneNumber,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = response['data'] as Map<String, dynamic>;

    // Registration does not authenticate the user.
    // Backend response: { "data": { "user": { ... } } }
    return UserModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.login,
      body: {'email': email, 'password': password},
    );

    final data = response['data'] as Map<String, dynamic>;
    await _tokenStorage.saveToken(data['token'] as String);

    return UserModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<UserModel> getCurrentUser() async {
    final response = await _apiClient.get(ApiEndpoints.me, authenticated: true);

    return UserModel.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<UserModel> updateProfile({
    required String name,
    required String email,
  }) async {
    final response = await _apiClient.put(
      ApiEndpoints.me,
      body: {'name': name, 'email': email},
      authenticated: true,
    );

    final data = response['data'] is Map<String, dynamic>
        ? response['data'] as Map<String, dynamic>
        : response;

    return UserModel.fromJson(
      data['user'] != null ? data['user'] as Map<String, dynamic> : data,
    );
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiClient.patch(
      ApiEndpoints.changePassword,
      body: {'currentPassword': currentPassword, 'newPassword': newPassword},
      authenticated: true,
    );
  }
}
