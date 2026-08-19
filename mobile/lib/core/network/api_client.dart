import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants/api_endpoints.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

/// Thin wrapper around package:http. Every data source goes through this —
/// nothing outside core/network should import package:http directly.
class ApiClient {
  final http.Client _client;
  final TokenStorage _tokenStorage;

  ApiClient({http.Client? client, required TokenStorage tokenStorage})
      : _client = client ?? http.Client(),
        _tokenStorage = tokenStorage;

  Future<Map<String, String>> _headers({bool authenticated = false}) async {
    final headers = {'Content-Type': 'application/json'};
    if (authenticated) {
      final token = await _tokenStorage.getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final cleanQuery = query?.map((k, v) => MapEntry(k, v.toString()));
    return Uri.parse('${ApiEndpoints.baseUrl}$path').replace(
      queryParameters: cleanQuery?.isEmpty == true ? null : cleanQuery,
    );
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
    bool authenticated = false,
  }) async {
    final response = await _client.get(
      _uri(path, query),
      headers: await _headers(authenticated: authenticated),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = false,
  }) async {
    final response = await _client.post(
      _uri(path),
      headers: await _headers(authenticated: authenticated),
      body: jsonEncode(body ?? {}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = false,
  }) async {
    final response = await _client.put(
      _uri(path),
      headers: await _headers(authenticated: authenticated),
      body: jsonEncode(body ?? {}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = false,
  }) async {
    final response = await _client.patch(
      _uri(path),
      headers: await _headers(authenticated: authenticated),
      body: jsonEncode(body ?? {}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    bool authenticated = false,
  }) async {
    final response = await _client.delete(
      _uri(path),
      headers: await _headers(authenticated: authenticated),
    );
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final decoded = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    throw ApiException(
      statusCode: response.statusCode,
      message: decoded['message'] as String? ?? 'Something went wrong',
    );
  }
}