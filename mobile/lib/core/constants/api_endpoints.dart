class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'http://localhost:4000/api';

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String me = '/auth/me';
}
