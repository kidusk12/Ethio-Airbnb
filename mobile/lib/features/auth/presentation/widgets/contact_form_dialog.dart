import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';

/// Support contact form, shown as a dialog from the Help Center.
/// No backend yet — submission is simulated, matching the same
/// temporary pattern used for payment submission until a real
/// endpoint exists.
class ContactFormDialog extends ConsumerStatefulWidget {
  const ContactFormDialog({super.key});

  static const String supportEmail = 'support@ethiostays.com';

  @override
  ConsumerState<ContactFormDialog> createState() => _ContactFormDialogState();
}

class _ContactFormDialogState extends ConsumerState<ContactFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _senderEmailController;
  final _messageController = TextEditingController();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    final authState = ref.read(authControllerProvider);
    final email = authState is AuthSuccess ? authState.user.email : '';
    _senderEmailController = TextEditingController(text: email);
  }

  @override
  void dispose() {
    _senderEmailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSending = true);

    // Temporary simulation until the backend/contact API is connected.
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    setState(() => _isSending = false);

    Navigator.of(context).pop();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Your message has been sent')));
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text('Contact us', style: AppTextStyles.titleLarge),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Send us a message and we\'ll get back to you.',
                style: AppTextStyles.bodyMedium,
              ),
              const SizedBox(height: 20),

              Text('From', style: AppTextStyles.titleMedium),
              const SizedBox(height: 8),
              AppTextField(
                controller: _senderEmailController,
                hint: 'Your email address',
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
              const SizedBox(height: 16),

              Text('To', style: AppTextStyles.titleMedium),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  ContactFormDialog.supportEmail,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Text('Message', style: AppTextStyles.titleMedium),
              const SizedBox(height: 8),
              AppTextField(
                controller: _messageController,
                hint: 'Write your message here',
                maxLines: 5,
                validator: (v) => Validators.required(v, field: 'Message'),
              ),
              const SizedBox(height: 24),

              PrimaryButton(
                label: 'Send',
                isLoading: _isSending,
                onPressed: _send,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
