import 'package:flutter/material.dart';

import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';

/// Shown when a logged-out user taps a gated action (Book, leave a review,
/// etc). Offers Create account / Log in, both carrying `returnTo` so the
/// person lands back where they were after signing in.
class AuthRequiredDialog extends StatelessWidget {
  final String message;
  final VoidCallback onCreateAccount;
  final VoidCallback onLogIn;

  const AuthRequiredDialog({
    super.key,
    this.message = 'Sign in to continue',
    required this.onCreateAccount,
    required this.onLogIn,
  });

  /// Convenience: shows the dialog and returns immediately — the two
  /// buttons handle navigation themselves via the callbacks passed in.
  static Future<void> show(
    BuildContext context, {
    String message = 'Sign in to continue',
    required VoidCallback onCreateAccount,
    required VoidCallback onLogIn,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AuthRequiredDialog(
        message: message,
        onCreateAccount: onCreateAccount,
        onLogIn: onLogIn,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(message, style: AppTextStyles.titleLarge),
      content: Text(
        'Create a free account or log in to keep going.',
        style: AppTextStyles.bodyMedium,
      ),
      actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      actions: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            PrimaryButton(
              label: 'Create account',
              onPressed: () {
                Navigator.of(context).pop();
                onCreateAccount();
              },
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).pop();
                onLogIn();
              },
              child: const Text('Log in'),
            ),
          ],
        ),
      ],
    );
  }
}