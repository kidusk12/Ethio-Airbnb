import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';

/// Clean, lightweight Profile page with dynamic Signed-In and Guest views.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppColors.surfaceElevated,
        centerTitle: false,
      ),
      body: SafeArea(
        child: switch (authState) {
          AuthSuccess(:final user) => _SignedInProfileView(
            userName: user.fullName,
            userEmail: user.email,
            userRole: user.role,
          ),
          _ => const _GuestProfileView(),
        },
      ),
    );
  }
}

/// View rendered when user is logged in.
class _SignedInProfileView extends ConsumerWidget {
  final String userName;
  final String userEmail;
  final String userRole;

  const _SignedInProfileView({
    required this.userName,
    required this.userEmail,
    required this.userRole,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initial = userName.isNotEmpty ? userName[0].toUpperCase() : '?';

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        // 1. User Header with Avatar
        Row(
          children: [
            GestureDetector(
              onTap: () => context.push('/account/personal-info'),
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      initial,
                      style: AppTextStyles.displayMedium.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        color: Colors.white,
                        size: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    userName,
                    style: AppTextStyles.titleLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    userEmail,
                    style: AppTextStyles.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.chipBackground,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      userRole == 'host'
                          ? 'Host'
                          : userRole == 'admin'
                          ? 'Admin'
                          : 'Guest',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 12),

        // 2. Account Settings (Editable Details Only)
        _ProfileSectionHeader(title: 'Account'),
        _ProfileTile(
          icon: Icons.person_outline,
          title: 'Personal information',
          subtitle: 'Name, email, and profile photo',
          onTap: () => context.push('/account/personal-info'),
        ),
        _ProfileTile(
          icon: Icons.lock_outline,
          title: 'Login and security',
          subtitle: 'Update your password',
          onTap: () => context.push('/account/login-security'),
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 12),

        // 3. Information & Support (Direct Redirection Links)
        _ProfileSectionHeader(title: 'Support & Legal'),
        _ProfileTile(
          icon: Icons.help_outline,
          title: 'Help Center',
          onTap: () => context.push('/help'),
        ),
        _ProfileTile(
          icon: Icons.info_outline,
          title: 'About EthioStays',
          onTap: () => context.push('/about'),
        ),
        _ProfileTile(
          icon: Icons.description_outlined,
          title: 'Terms & Privacy',
          onTap: () => context.push('/legal/terms'),
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 12),

        // 4. Community & Socials
        _ProfileSectionHeader(title: 'Connect with us'),
        const SizedBox(height: 8),
        const _SocialIconsRow(),
        const SizedBox(height: 20),
        const Divider(),
        const SizedBox(height: 12),

        // 5. Logout Session
        _ProfileTile(
          icon: Icons.logout,
          title: 'Log out',
          iconColor: AppColors.error,
          textColor: AppColors.error,
          onTap: () {
            ref.read(authControllerProvider.notifier).logout();
            context.go('/home');
          },
        ),
        const SizedBox(height: 24),

        // 6. App Footnote
        Center(
          child: Column(
            children: [
              Text(
                'EthioStays v1.0.0 · Addis Ababa, Ethiopia',
                style: AppTextStyles.bodySmall,
              ),
              const SizedBox(height: 4),
              Text(
                '© 2026 EthioStays. All rights reserved.',
                style: AppTextStyles.caption,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// View rendered when guest is not signed in.
class _GuestProfileView extends StatelessWidget {
  const _GuestProfileView();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        // 1. Guest Welcome Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person_outline,
                  size: 36,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 14),
              Text('Welcome to EthioStays', style: AppTextStyles.titleLarge),
              const SizedBox(height: 6),
              Text(
                'Log in or create an account to manage your profile and bookings.',
                style: AppTextStyles.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 18),
              PrimaryButton(
                label: 'Log in',
                onPressed: () => context.go('/login'),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.go('/register'),
                  child: const Text('Create account'),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 12),

        // 2. Information & Support (Direct Redirection Links)
        _ProfileSectionHeader(title: 'Support & Legal'),
        _ProfileTile(
          icon: Icons.help_outline,
          title: 'Help Center',
          onTap: () => context.push('/help'),
        ),
        _ProfileTile(
          icon: Icons.info_outline,
          title: 'About EthioStays',
          onTap: () => context.push('/about'),
        ),
        _ProfileTile(
          icon: Icons.description_outlined,
          title: 'Terms & Privacy',
          onTap: () => context.push('/legal/terms'),
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 12),

        // 3. Community & Socials
        _ProfileSectionHeader(title: 'Connect with us'),
        const SizedBox(height: 8),
        const _SocialIconsRow(),
        const SizedBox(height: 24),

        // 4. App Footnote
        Center(
          child: Column(
            children: [
              Text(
                'EthioStays v1.0.0 · Addis Ababa, Ethiopia',
                style: AppTextStyles.bodySmall,
              ),
              const SizedBox(height: 4),
              Text(
                '© 2026 EthioStays. All rights reserved.',
                style: AppTextStyles.caption,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProfileSectionHeader extends StatelessWidget {
  final String title;

  const _ProfileSectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.overline.copyWith(
          color: AppColors.textMuted,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? textColor;

  const _ProfileTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      leading: Icon(icon, color: iconColor ?? AppColors.textPrimary, size: 22),
      title: Text(
        title,
        style: AppTextStyles.titleMedium.copyWith(
          color: textColor ?? AppColors.textPrimary,
          fontSize: 15,
        ),
      ),
      subtitle: subtitle != null
          ? Text(subtitle!, style: AppTextStyles.bodySmall)
          : null,
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.textMuted,
        size: 20,
      ),
      onTap: onTap,
    );
  }
}

class _SocialIconsRow extends StatelessWidget {
  const _SocialIconsRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        _SocialButton(icon: Icons.camera_alt_outlined),
        SizedBox(width: 10),
        _SocialButton(icon: Icons.facebook),
        SizedBox(width: 10),
        _SocialButton(icon: Icons.alternate_email),
        SizedBox(width: 10),
        _SocialButton(icon: Icons.smart_display_outlined),
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;

  const _SocialButton({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Icon(icon, size: 18, color: AppColors.textPrimary),
    );
  }
}
