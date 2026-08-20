import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'terms_agreement_page.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';
import '../widgets/auth_hero_header.dart';
import '../widgets/role_toggle.dart';

class RegisterPage extends ConsumerStatefulWidget {
  final String initialRole;
  final String? returnTo;

  const RegisterPage({super.key, this.initialRole = 'guest', this.returnTo});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  late String _role = widget.initialRole;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _phoneNumberController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final agreed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (context) => const TermsAgreementPage()),
    );

    if (agreed != true) return;
    if (!mounted) return;

    ref
        .read(authControllerProvider.notifier)
        .register(
          firstName: _firstNameController.text.trim(),
          middleName: _middleNameController.text.trim().isEmpty
              ? null
              : _middleNameController.text.trim(),
          lastName: _lastNameController.text.trim(),
          phoneNumber: _phoneNumberController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          role: _role,
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (next is RegistrationSuccess) {
        final loginPath = widget.returnTo == null
            ? '/login'
            : '/login?returnTo=${Uri.encodeComponent(widget.returnTo!)}';

        context.go(loginPath);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account created. Please log in to continue.'),
          ),
        );
      } else if (next is AuthError) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(next.message)));
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
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Create your account',
                        style: AppTextStyles.displayMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Join Sheba Stays to book and save places across Ethiopia.',
                        style: AppTextStyles.bodyMedium,
                      ),
                      const SizedBox(height: 24),

                      RoleToggle(
                        role: _role,
                        onChanged: (role) => setState(() => _role = role),
                      ),
                      const SizedBox(height: 16),

                      AppTextField(
                        controller: _firstNameController,
                        hint: 'First name',
                        textCapitalization: TextCapitalization.words,
                        validator: (value) =>
                            Validators.required(value, field: 'First name'),
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _middleNameController,
                        hint: 'Middle name (optional)',
                        textCapitalization: TextCapitalization.words,
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _lastNameController,
                        hint: 'Last name',
                        textCapitalization: TextCapitalization.words,
                        validator: (value) =>
                            Validators.required(value, field: 'Last name'),
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _phoneNumberController,
                        hint: 'Phone number (e.g. +251912345678)',
                        keyboardType: TextInputType.phone,
                        validator: Validators.phoneNumber,
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _emailController,
                        hint: 'Email address',
                        keyboardType: TextInputType.emailAddress,
                        validator: Validators.email,
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
                          onPressed: () {
                            setState(
                              () => _obscurePassword = !_obscurePassword,
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 14),

                      AppTextField(
                        controller: _confirmPasswordController,
                        hint: 'Confirm password',
                        obscureText: _obscureConfirmPassword,
                        validator: (value) => Validators.confirmPassword(
                          value,
                          _passwordController.text,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: AppColors.textMuted,
                          ),
                          onPressed: () {
                            setState(
                              () => _obscureConfirmPassword =
                                  !_obscureConfirmPassword,
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 22),

                      PrimaryButton(
                        label: 'Create account',
                        isLoading: isLoading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 24),

                      Center(
                        child: GestureDetector(
                          onTap: () {
                            final loginPath = widget.returnTo == null
                                ? '/login'
                                : '/login?returnTo=${Uri.encodeComponent(widget.returnTo!)}';

                            context.go(loginPath);
                          },
                          child: RichText(
                            text: TextSpan(
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.textPrimary,
                              ),
                              children: [
                                const TextSpan(
                                  text: 'Already have an account? ',
                                ),
                                TextSpan(
                                  text: 'Log in',
                                  style: AppTextStyles.link,
                                ),
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
