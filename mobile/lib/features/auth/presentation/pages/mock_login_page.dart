import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../domain/entities/user.dart';
import '../providers/auth_providers.dart';

/// Testing only — lets you sign in as a Guest, Host, or Admin without a
/// working backend. Same idea as /test/booking-checkout: isolated route,
/// safe to delete once real auth is testable end to end.
class MockLoginPage extends ConsumerWidget {
  const MockLoginPage({super.key});

  static const _guest = User(
    id: 'mock-guest',
    firstName: 'Test',
    lastName: 'Guest',
    phoneNumber: '+251900000001',
    email: 'guest@test.com',
    role: 'guest',
  );

  static const _host = User(
    id: 'mock-host',
    firstName: 'Test',
    lastName: 'Host',
    phoneNumber: '+251900000002',
    email: 'host@test.com',
    role: 'host',
  );

  static const _admin = User(
    id: 'mock-admin',
    firstName: 'Test',
    lastName: 'Admin',
    phoneNumber: '+251900000003',
    email: 'admin@test.com',
    role: 'admin',
  );

  void _loginAs(BuildContext context, WidgetRef ref, User user) {
    ref.read(authControllerProvider.notifier).mockLogin(user);

    final destination = switch (user.role) {
      'host' => '/host/home',
      'admin' => '/admin/dashboard',
      _ => '/home',
    };

    context.go(destination);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mock Login (testing only)')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ElevatedButton(
              onPressed: () => _loginAs(context, ref, _guest),
              child: const Text('Log in as Guest'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => _loginAs(context, ref, _host),
              child: const Text('Log in as Host'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => _loginAs(context, ref, _admin),
              child: const Text('Log in as Admin'),
            ),
          ],
        ),
      ),
    );
  }
}
