import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';

/// Central route table. Add one GoRoute per page as features are built —
/// don't navigate with raw `Navigator.push` anywhere in the app once this
/// is wired in; use `context.go(...)` / `context.push(...)` instead.
final GoRouter appRouter = GoRouter(
  initialLocation: '/register',
  routes: [
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    // Placeholder until the listings feature exists — swap for the real
    // home/listings page in Sprint 1.
    GoRoute(
      path: '/home',
      builder: (context, state) => const _HomePlaceholder(),
    ),
  ],
);

class _HomePlaceholder extends StatelessWidget {
  const _HomePlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Home — listings feature not built yet')),
    );
  }
}