import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_hero_header.dart';
import '../widgets/role_toggle.dart';

/// Registration page — FR-1.1 (register as Guest or Host with email/password).
/// Presentation layer only: collects input, validates it, and delegates to
/// [AuthController.register]. No business logic or networking lives here.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _role = 'guest';
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    ref.read(authControllerProvider.notifier).register(
          name: _nameController.text.trim(),
          emailOrPhone: _emailController.text.trim(),
          password: _passwordController.text,
          role: _role,
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (next is AuthSuccess) {
        context.go('/home');
      } else if (next is AuthError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.message)),
        );
      }
    });

    final authState = ref.watch(authControllerProvider);
    final isLoading = authState is AuthLoading;

    return Scaffold(
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const AuthHeroHeader(),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Create your account', style: AppTextStyles.displayMedium),
                      const SizedBox(height: 8),
                      Text(
                        'Join Sheba Stays to book and save places across Ethiopia.',
                        style: AppTextStyles.bodyMedium,
                      ),
                      const SizedBox(height: 24),

                      RoleToggle(
                        role: _role,
                        onChanged: (value) => setState(() => _role = value),
                      ),
                      const SizedBox(height: 16),

                      AppTextField(
                        controller: _nameController,
                        hint: 'Full name',
                        textCapitalization: TextCapitalization.words,
                        validator: (v) => Validators.required(v, field: 'Name'),
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _emailController,
                        hint: 'Email or phone number',
                        keyboardType: TextInputType.emailAddress,
                        validator: Validators.emailOrPhone,
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _passwordController,
                        hint: 'Password',
                        obscureText: _obscurePassword,
                        validator: Validators.password,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: AppColors.textMuted,
                          ),
                          onPressed: () =>
                              setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      const SizedBox(height: 20),

                      PrimaryButton(
                        label: 'Continue',
                        isLoading: isLoading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          const Expanded(child: Divider()),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text('OR', style: AppTextStyles.caption),
                          ),
                          const Expanded(child: Divider()),
                        ],
                      ),
                      const SizedBox(height: 20),

                      SizedBox(
                        height: 54,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            // Not in FR scope for this cycle.
                          },
                          icon: const Icon(Icons.g_mobiledata, size: 26),
                          label: const Text('Continue with Google'),
                        ),
                      ),
                      const SizedBox(height: 24),

                      Center(
                        child: GestureDetector(
                          onTap: () => context.go('/login'),
                          child: RichText(
                            text: TextSpan(
                              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                              children: [
                                const TextSpan(text: 'Already have an account? '),
                                TextSpan(text: 'Log in', style: AppTextStyles.link),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}