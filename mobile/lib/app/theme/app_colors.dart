import 'package:flutter/material.dart';

/// Single source of truth for every color in the app.
///
/// Rule (see architecture guide, §5.5): never write a raw `Color(0xFF...)`
/// inside a page or widget file — import a constant from here instead.
/// If you need a color that isn't listed, add it here first.
class AppColors {
  AppColors._();

  // Brand ----------------------------------------------------------------
  /// The red accent used for primary buttons, links, and selected states.
  static const Color primary = Color(0xFFE05252);
  static const Color primaryDark = Color(0xFFC23F3F);
  static const Color primaryLight = Color(0xFFF6D9D9);

  // Backgrounds ------------------------------------------------------------
  /// Warm cream background used on auth screens and page backgrounds.
  static const Color background = Color(0xFFFBF3EC);
  /// Slightly whiter surface, e.g. site theme-color / cards on cream bg.
  static const Color surface = Color(0xFFFDFCFA);
  static const Color surfaceElevated = Color(0xFFFFFFFF);

  // Text ---------------------------------------------------------------
  static const Color textPrimary = Color(0xFF1F1B18);
  static const Color textSecondary = Color(0xFF6B615A);
  static const Color textMuted = Color(0xFF9C9088);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnImage = Color(0xFFFFFFFF);
  static const Color textOnImageMuted = Color(0xB3FFFFFF); // 70% white

  // Borders / dividers ---------------------------------------------------
  static const Color border = Color(0x1F000000); // black12
  static const Color borderStrong = Color(0x3D000000); // black24
  static const Color divider = Color(0x1F000000);

  // Feedback ---------------------------------------------------------------
  static const Color success = Color(0xFF2E8B57);
  static const Color error = Color(0xFFD64545);
  static const Color warning = Color(0xFFE0A526);

  // Domain-specific accents -------------------------------------------------
  /// Star rating color (e.g. "4.92 ★"), matches Sheba Stays reference design.
  static const Color ratingStar = Color(0xFFE0A526);
  /// Background chip color for category pills (Apartments, Villas, ...).
  static const Color chipBackground = Color(0xFFF1E7DD);
  static const Color chipSelectedBackground = primary;

  // Overlays -----------------------------------------------------------
  /// Bottom gradient over hero images so white text stays readable.
  static const List<Color> heroImageOverlay = [
    Colors.transparent,
    Color(0x8A000000), // 54% black
  ];

  // Status colors used for booking state chips ------------------------------
  static const Color statusPending = warning;
  static const Color statusConfirmed = success;
  static const Color statusCancelled = error;
  static const Color statusCompleted = textMuted;
}