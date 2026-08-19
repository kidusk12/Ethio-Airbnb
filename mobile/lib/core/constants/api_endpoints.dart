class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'https://api.ethio-airbnb.com/api';

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/password';
}