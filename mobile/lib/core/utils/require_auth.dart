import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/widgets/auth_required_dialog.dart';

/// Call this from any tap handler that should be gated behind login
/// (Book, leave a review, host actions...). If the user is already
/// authenticated, [onAuthenticated] runs immediately with no interruption.
/// If not, shows [AuthRequiredDialog]; picking Create account / Log in
/// carries the current location as `returnTo`, so after signing in the
/// router sends them back to [returnTo] instead of the default home tab.
///
/// Usage:
/// ```dart
/// onPressed: () => requireAuth(
///   context, ref,
///   returnTo: '/listings/${listing.id}',
///   message: 'Sign in to book this stay',
///   onAuthenticated: () => _openBookingFlow(),
/// ),
/// ```
void requireAuth(
  BuildContext context,
  WidgetRef ref, {
  required String returnTo,
  required VoidCallback onAuthenticated,
  String message = 'Sign in to continue',
}) {
  final isAuthenticated = ref.read(authControllerProvider) is AuthSuccess;

  if (isAuthenticated) {
    onAuthenticated();
    return;
  }

  final encodedReturnTo = Uri.encodeComponent(returnTo);

  AuthRequiredDialog.show(
    context,
    message: message,
    onCreateAccount: () => context.go('/register?returnTo=$encodedReturnTo'),
    onLogIn: () => context.go('/login?returnTo=$encodedReturnTo'),
  );
}