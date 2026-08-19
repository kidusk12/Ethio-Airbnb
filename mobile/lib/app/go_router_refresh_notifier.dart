import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/presentation/providers/auth_providers.dart';

/// Bridges Riverpod's [authControllerProvider] to GoRouter's
/// [refreshListenable], so protected routes are re-evaluated the moment
/// auth state changes (login, logout, session restore).
class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(Ref ref) {
    ref.listen<AuthState>(authControllerProvider, (_, __) => notifyListeners());
  }
}
