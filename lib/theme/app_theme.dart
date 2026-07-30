import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Lilly + Nu design tokens. Kept in sync with tailwind config in the web POC.
class NuColors {
  // Lilly identity
  static const lillyNavy = Color(0xFF1E3A5F);
  static const lillyRed = Color(0xFFD52B1E);
  static const lillyGrey = Color(0xFF6B7280);
  static const lillyLine = Color(0xFFE5E7EB);

  // Nu space palette
  static const spaceBg = Color(0xFF0B0E1F);
  static const spaceDeep = Color(0xFF0F172A);
  static const spaceIndigo = Color(0xFF1E1B4B);

  static const violet300 = Color(0xFFC4B5FD);
  static const violet400 = Color(0xFFA78BFA);
  static const violet600 = Color(0xFF7C3AED);
  static const violet900 = Color(0xFF4C1D95);

  static const emerald400 = Color(0xFF34D399);
  static const emerald500 = Color(0xFF10B981);
  static const amber400 = Color(0xFFFBBF24);
  static const rose400 = Color(0xFFF87171);
  static const rose600 = Color(0xFFDC2626);
  static const sky400 = Color(0xFF38BDF8);

  // Success profile gold
  static const gold = Color(0xFFC89A3B);
  static const goldLight = Color(0xFFE8C874);
}

class NuGradients {
  static const universeBg = RadialGradient(
    center: Alignment.topCenter,
    radius: 1.2,
    colors: [NuColors.spaceIndigo, Color(0x00000000)],
    stops: [0.0, 0.4],
  );

  static const micIdle = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [NuColors.violet300, NuColors.violet600, NuColors.violet900],
    stops: [0.0, 0.4, 1.0],
  );

  static const micListening = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [NuColors.rose400, NuColors.rose600],
  );

  static const successProfile = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [NuColors.goldLight, NuColors.gold, Color(0xFF8B6F2A)],
  );
}

class NuText {
  static TextStyle body({double size = 14, FontWeight w = FontWeight.w500, Color c = Colors.white}) =>
      GoogleFonts.inter(fontSize: size, fontWeight: w, color: c, height: 1.4);

  static TextStyle mono({double size = 12, Color c = Colors.white}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, color: c);

  static TextStyle eyebrow({Color c = NuColors.violet300}) => GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.6,
        color: c,
      );

  static TextStyle heroNumber({Color c = Colors.white}) => GoogleFonts.inter(
        fontSize: 44,
        fontWeight: FontWeight.w900,
        color: c,
        height: 1.0,
      );
}

ThemeData buildNuTheme() {
  final base = ThemeData(
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: NuColors.violet600,
      secondary: NuColors.emerald500,
      surface: NuColors.spaceBg,
      error: NuColors.lillyRed,
    ),
    scaffoldBackgroundColor: NuColors.spaceBg,
    useMaterial3: true,
  );

  return base.copyWith(
    textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: Colors.white,
      displayColor: Colors.white,
    ),
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
  );
}
