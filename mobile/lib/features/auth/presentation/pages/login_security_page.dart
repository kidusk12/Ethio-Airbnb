import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';

class LoginSecurityPage extends ConsumerStatefulWidget {
  const LoginSecurityPage({super.key});

  @override
  ConsumerState<LoginSecurityPage> createState() => _LoginSecurityPageState();
}

class _LoginSecurityPageState extends ConsumerState<LoginSecurityPage> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isSaving = false;
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final result = await ref
        .read(authControllerProvider.notifier)
        .changePassword(
          currentPassword: _currentPasswordController.text,
          newPassword: _newPasswordController.text,
        );

    if (!mounted) return;
    setState(() => _isSaving = false);

    result.fold(
      (message) => ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message))),
      (_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password changed successfully')),
        );
        Navigator.of(context).pop();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('Login and security'),
        backgroundColor: AppColors.surfaceElevated,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Change Password', style: AppTextStyles.titleLarge),
                const SizedBox(height: 6),
                Text(
                  'Choose a strong password with at least 8 characters.',
                  style: AppTextStyles.bodyMedium,
                ),
                const SizedBox(height: 24),

                Text('Current password', style: AppTextStyles.titleMedium),
                const SizedBox(height: 8),
                AppTextField(
                  controller: _currentPasswordController,
                  hint: 'Enter your current password',
                  obscureText: _obscureCurrent,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureCurrent
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () =>
                        setState(() => _obscureCurrent = !_obscureCurrent),
                  ),
                  validator: (v) =>
                      Validators.required(v, field: 'Current password'),
                ),
                const SizedBox(height: 20),

                Text('New password', style: AppTextStyles.titleMedium),
                const SizedBox(height: 8),
                AppTextField(
                  controller: _newPasswordController,
                  hint: 'Enter your new password',
                  obscureText: _obscureNew,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureNew
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _obscureNew = !_obscureNew),
                  ),
                  validator: Validators.password,
                ),
                const SizedBox(height: 20),

                Text('Confirm new password', style: AppTextStyles.titleMedium),
                const SizedBox(height: 8),
                AppTextField(
                  controller: _confirmPasswordController,
                  hint: 'Re-enter your new password',
                  obscureText: _obscureConfirm,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirm
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () =>
                        setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                  validator: (v) => Validators.confirmPassword(
                    v,
                    _newPasswordController.text,
                  ),
                ),
                const SizedBox(height: 32),

                PrimaryButton(
                  label: 'Update password',
                  isLoading: _isSaving,
                  onPressed: _save,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
