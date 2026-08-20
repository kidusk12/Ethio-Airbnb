import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../widgets/terms_content.dart';

/// Terms & Conditions page, reachable from the profile menu.
class TermsPrivacyPage extends StatelessWidget {
  const TermsPrivacyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceElevated,
      appBar: AppBar(
        title: const Text('Terms & Conditions'),
        backgroundColor: AppColors.surfaceElevated,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: const TermsContent(),
        ),
      ),
    );
  }
}
