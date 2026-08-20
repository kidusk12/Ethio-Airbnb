import 'package:flutter/material.dart';

/// The single rounded text-field style used everywhere. Picks up styling
/// from `AppTheme.light.inputDecorationTheme` — pass hint/controller/
/// validator only, don't reach for custom `InputDecoration`s in pages.
class AppTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool obscureText;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;
  final int maxLines;
  final int? minLines;
  final String? Function(String?)? validator;

  const AppTextField({
    super.key,
    required this.controller,
    required this.hint,
    this.obscureText = false,
    this.suffixIcon,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
    this.maxLines = 1,
    this.minLines,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      maxLines: maxLines,
      minLines: minLines,
      validator: validator,
      decoration: InputDecoration(hintText: hint, suffixIcon: suffixIcon),
    );
  }
}
