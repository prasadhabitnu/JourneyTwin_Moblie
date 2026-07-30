import 'package:shared_preferences/shared_preferences.dart';

/// Which UI shell to render at launch.
/// - habitnu  → new light-theme dashboard (default)
/// - nuUniverse → original dark space Universe
enum UiMode { habitnu, nuUniverse }

class UiModeStore {
  static const _key = 'ui_mode';

  static Future<UiMode> load() async {
    final prefs = await SharedPreferences.getInstance();
    final v = prefs.getString(_key);
    if (v == UiMode.nuUniverse.name) return UiMode.nuUniverse;
    return UiMode.habitnu;
  }

  static Future<void> save(UiMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode.name);
  }
}
