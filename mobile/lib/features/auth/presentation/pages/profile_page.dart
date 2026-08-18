import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';

/// Profile tab. Never gated — a logged-out guest sees a "log in / sign up"
/// prompt inline instead of being blocked from the tab entirely.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: switch (authState) {
        AuthSuccess(:final user) => _SignedInProfile(userName: user.name, userRole: user.role),
        _ => const _LoggedOutPrompt(),
      },
    );
  }
}

class _LoggedOutPrompt extends StatelessWidget {
  const _LoggedOutPrompt();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.person_outline, size: 48, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text('You\'re not signed in', style: AppTextStyles.titleLarge),
            const SizedBox(height: 6),
            Text(
              'Log in or create an account to manage your bookings and profile.',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            PrimaryButton(label: 'Log in', onPressed: () => context.go('/login')),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.go('/register'),
              child: const Text('Create account'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SignedInProfile extends ConsumerWidget {
  final String userName;
  final String userRole;

  const _SignedInProfile({required this.userName, required this.userRole});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        CircleAvatar(
          radius: 32,
          backgroundColor: AppColors.primaryLight,
          child: Text(
            userName.isNotEmpty ? userName[0].toUpperCase() : '?',
            style: AppTextStyles.displayMedium.copyWith(color: AppColors.primary),
          ),
        ),
        const SizedBox(height: 12),
        Text(userName, style: AppTextStyles.titleLarge),
        Text(userRole == 'host' ? 'Host account' : 'Guest account', style: AppTextStyles.bodySmall),
        const SizedBox(height: 24),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: AppColors.error),
          title: const Text('Log out'),
          onTap: () {
            ref.read(authControllerProvider.notifier).logout();
            context.go('/home');
          },
        ),
      ],
    );
  }
}