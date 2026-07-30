import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Light-theme design tokens for the Habitnu redesign.
/// Kept intentionally separate from app_theme.dart (the dark Nu Universe theme)
/// so both can coexist via the launch-time UI-mode toggle.
class HColors {
  // Surface + text
  static const bg = Color(0xFFF7F7FB);         // page background
  static const surface = Color(0xFFFFFFFF);    // card surface
  static const surfaceMuted = Color(0xFFF3F4F9);
  static const ink = Color(0xFF0F172A);        // primary text
  static const inkMuted = Color(0xFF6B7280);   // secondary text
  static const line = Color(0xFFE5E7EB);       // dividers, thin borders

  // Habitnu brand
  static const brandBlue = Color(0xFF2F30E5);  // primary CTA
  static const brandBlueDeep = Color(0xFF1E1FA0);
  static const brandGreen = Color(0xFF10B981); // sprout logo leaf

  // Semantic
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFF87171);

  // Health Compass segment tones — soft pastels for the ring, deeper accents for selection
  static const seg = _CompassColors();
}

class _CompassColors {
  const _CompassColors();
  Color get movement  => const Color(0xFFDFF3D2);
  Color get nutrition => const Color(0xFFFFE9C7);
  Color get glucose   => const Color(0xFFD9E1FF);
  Color get sleep     => const Color(0xFFE0DDF7);
  Color get stress    => const Color(0xFFFDD8E3);
  Color get hydration => const Color(0xFFCFE8FA);
  Color get mindset   => const Color(0xFFFED4CB);
  Color get weight    => const Color(0xFFE7E7F5);

  // Selected / accent versions (deeper)
  Color get movementDeep  => const Color(0xFF7DBB47);
  Color get nutritionDeep => const Color(0xFFF59E0B);
  Color get glucoseDeep   => const Color(0xFF4F5FE5);
  Color get sleepDeep     => const Color(0xFF6B5CE0);
  Color get stressDeep    => const Color(0xFFEC4A83);
  Color get hydrationDeep => const Color(0xFF38BDF8);
  Color get mindsetDeep   => const Color(0xFFEF5C3E);
  Color get weightDeep    => const Color(0xFF8B7EE0);

  Color get needsFocus => const Color(0xFFF87171);
  Color get good => const Color(0xFFF59E0B);
  Color get strong => const Color(0xFF10B981);
}

class HText {
  static TextStyle body({double size = 14, FontWeight w = FontWeight.w500, Color c = HColors.ink}) =>
      GoogleFonts.inter(fontSize: size, fontWeight: w, color: c, height: 1.4);

  static TextStyle mono({double size = 12, Color c = HColors.ink}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, color: c);

  static TextStyle eyebrow({Color c = HColors.brandBlue}) => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.4,
        color: c,
      );

  static TextStyle heroNumber({Color c = HColors.ink}) => GoogleFonts.inter(
        fontSize: 42,
        fontWeight: FontWeight.w900,
        color: c,
        height: 1.0,
      );
}

ThemeData buildHabitnuTheme() {
  final base = ThemeData(
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: HColors.brandBlue,
      secondary: HColors.brandGreen,
      surface: HColors.surface,
      error: HColors.danger,
    ),
    scaffoldBackgroundColor: HColors.bg,
    useMaterial3: true,
  );
  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: HColors.ink,
      displayColor: HColors.ink,
    ),
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
  );
}

/// Named 8 Health Compass segments in canonical order (clockwise from top).
enum HCompass { movement, nutrition, glucose, sleep, stress, hydration, mindset, weight }

extension HCompassMeta on HCompass {
  String get label {
    switch (this) {
      case HCompass.movement:  return 'Movement';
      case HCompass.nutrition: return 'Nutrition';
      case HCompass.glucose:   return 'Glucose';
      case HCompass.sleep:     return 'Sleep';
      case HCompass.stress:    return 'Stress';
      case HCompass.hydration: return 'Hydration';
      case HCompass.mindset:   return 'Mindset';
      case HCompass.weight:    return 'Weight';
    }
  }

  IconData get icon {
    switch (this) {
      case HCompass.movement:  return Icons.directions_run_rounded;
      case HCompass.nutrition: return Icons.restaurant_rounded;
      case HCompass.glucose:   return Icons.water_drop_rounded;
      case HCompass.sleep:     return Icons.nightlight_round;
      case HCompass.stress:    return Icons.spa_rounded;
      case HCompass.hydration: return Icons.local_drink_rounded;
      case HCompass.mindset:   return Icons.wb_sunny_rounded;
      case HCompass.weight:    return Icons.monitor_weight_rounded;
    }
  }

  Color get fill {
    switch (this) {
      case HCompass.movement:  return HColors.seg.movement;
      case HCompass.nutrition: return HColors.seg.nutrition;
      case HCompass.glucose:   return HColors.seg.glucose;
      case HCompass.sleep:     return HColors.seg.sleep;
      case HCompass.stress:    return HColors.seg.stress;
      case HCompass.hydration: return HColors.seg.hydration;
      case HCompass.mindset:   return HColors.seg.mindset;
      case HCompass.weight:    return HColors.seg.weight;
    }
  }

  Color get deep {
    switch (this) {
      case HCompass.movement:  return HColors.seg.movementDeep;
      case HCompass.nutrition: return HColors.seg.nutritionDeep;
      case HCompass.glucose:   return HColors.seg.glucoseDeep;
      case HCompass.sleep:     return HColors.seg.sleepDeep;
      case HCompass.stress:    return HColors.seg.stressDeep;
      case HCompass.hydration: return HColors.seg.hydrationDeep;
      case HCompass.mindset:   return HColors.seg.mindsetDeep;
      case HCompass.weight:    return HColors.seg.weightDeep;
    }
  }

  String get key => name; // enum name matches JSON keys
}
