import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Single source of truth for typography.
///
/// Two font families are used, matching the reference design:
/// - `_serif` for large headline/display text (app name, page titles like
///   "Create your account").
/// - `_sans` for everything else (body copy, buttons, labels, prices).
///
/// If your pubspec adds custom fonts (e.g. via google_fonts or bundled
/// font files), update the two constants below — every style in this file
/// will pick it up automatically. Don't set `fontFamily` anywhere else.
class AppTextStyles {
  AppTextStyles._();

  static const String _serif = 'Serif';
  static const String _sans = 'Sans';

  // Display / Headline (hero text, page titles) ----------------------------
  static const TextStyle displayLarge = TextStyle(
    fontFamily: _serif,
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    height: 1.15,
  );

  static const TextStyle displayMedium = TextStyle(
    fontFamily: _serif,
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: _serif,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Titles (card titles, section headers) -----------------------------------
  static const TextStyle titleLarge = TextStyle(
    fontFamily: _sans,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: _sans,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Body -----------------------------------------------------------------
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: _sans,
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: _sans,
    fontSize: 15,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: _sans,
    fontSize: 13,
    fontWeight: FontWeight.normal,
    color: AppColors.textMuted,
  );

  // Caption / labels ---------------------------------------------------
  static const TextStyle caption = TextStyle(
    fontFamily: _sans,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
  );

  static const TextStyle overline = TextStyle(
    fontFamily: _sans,
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.textMuted,
    letterSpacing: 0.6,
  );

  // Interactive -----------------------------------------------------------
  static const TextStyle button = TextStyle(
    fontFamily: _sans,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textOnPrimary,
  );

  static const TextStyle link = TextStyle(
    fontFamily: _sans,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
  );

  // Domain-specific: prices, ratings ----------------------------------------
  /// e.g. "ETB 4,800 / night" on a listing card.
  static const TextStyle price = TextStyle(
    fontFamily: _sans,
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static const TextStyle priceUnit = TextStyle(
    fontFamily: _sans,
    fontSize: 13,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );

  /// e.g. "4.92" next to a star icon.
  static const TextStyle rating = TextStyle(
    fontFamily: _sans,
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Text-on-image (hero header overlays) -------------------------------------
  static const TextStyle heroTitle = TextStyle(
    fontFamily: _serif,
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textOnImage,
  );

  static const TextStyle heroSubtitle = TextStyle(
    fontFamily: _sans,
    fontSize: 15,
    color: AppColors.textOnImage,
  );

  static const TextStyle heroCaption = TextStyle(
    fontFamily: _sans,
    fontSize: 12,
    color: AppColors.textOnImageMuted,
  );
}