import 'package:flutter/material.dart';

import 'theme/app_theme.dart';
import 'screens/universe_screen.dart';
import 'screens/today_screen.dart';
import 'screens/cgm_screen.dart';
import 'screens/stub_screen.dart';
import 'voice/planets.dart';

class NuApp extends StatelessWidget {
  const NuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nu — Habitnu',
      debugShowCheckedModeBanner: false,
      theme: buildNuTheme(),
      initialRoute: '/',
      onGenerateRoute: (settings) {
        // /  → Universe
        // /planet/<slug>  → planet screen
        if (settings.name == '/') {
          return MaterialPageRoute(builder: (_) => const UniverseScreen());
        }
        if (settings.name!.startsWith('/planet/')) {
          final slug = settings.name!.substring('/planet/'.length);
          return MaterialPageRoute(builder: (_) => planetScreen(slug));
        }
        return MaterialPageRoute(builder: (_) => const UniverseScreen());
      },
    );
  }
}

Widget planetScreen(String slug) {
  switch (slug) {
    case 'today':
      return const TodayScreen();
    case 'cgm':
      return const CgmScreen();
    default:
      final planet = planetBySlug(slug);
      return StubScreen(planet: planet);
  }
}
