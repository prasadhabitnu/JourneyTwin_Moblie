import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'habitnu_app.dart';
import 'ui_mode.dart';
import 'data/repository/repository.dart';
import 'data/mock/mock_repository.dart';
import 'voice/nu_voice.dart';
import 'voice/dialog_manager.dart';

void main() {
  runZonedGuardedish(() async {
    WidgetsFlutterBinding.ensureInitialized();

    ErrorWidget.builder = _errorWidgetBuilder;
    FlutterError.onError = (details) {
      FlutterError.presentError(details);
      debugPrint('FlutterError: ${details.exceptionAsString()}');
    };

    // Load the persisted UI mode BEFORE building anything.
    final uiMode = await UiModeStore.load();

    // Style the system chrome to match the chosen mode.
    if (uiMode == UiMode.habitnu) {
      SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Color(0xFFFFFFFF),
        systemNavigationBarIconBrightness: Brightness.dark,
      ));
    } else {
      SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Color(0xFF0B0E1F),
        systemNavigationBarIconBrightness: Brightness.light,
      ));
    }

    await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    final NuRepository repository = MockRepository();
    Object? bootError;
    try {
      await repository.warmup();
    } catch (e, s) {
      bootError = e;
      debugPrint('MockRepository.warmup failed: $e\n$s');
    }

    runApp(
      MultiProvider(
        providers: [
          Provider<NuRepository>.value(value: repository),
          ChangeNotifierProvider<NuVoice>(create: (_) => NuVoice()),
          ChangeNotifierProvider<DialogManager>(create: (_) => DialogManager()),
        ],
        child: bootError == null
            ? (uiMode == UiMode.habitnu ? const HabitnuApp() : const NuApp())
            : _BootErrorApp(error: bootError),
      ),
    );
  });
}

void runZonedGuardedish(Future<void> Function() body) {
  Future(() async {
    try {
      await body();
    } catch (e, s) {
      debugPrint('main() crashed: $e\n$s');
      runApp(_BootCrashApp(error: e, stack: s));
    }
  });
}

Widget _errorWidgetBuilder(FlutterErrorDetails details) {
  final msg = details.exceptionAsString();
  return Container(
    color: const Color(0xFFF7F7FB),
    padding: const EdgeInsets.all(20),
    alignment: Alignment.center,
    child: SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.warning_amber, color: Color(0xFFF59E0B), size: 48),
          const SizedBox(height: 12),
          const Text('Widget error',
              style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 8),
          Text(msg,
              style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
              textAlign: TextAlign.center),
        ],
      ),
    ),
  );
}

class _BootErrorApp extends StatelessWidget {
  final Object error;
  const _BootErrorApp({required this.error});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: const Color(0xFFF7F7FB),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Data warmup failed',
                      style: TextStyle(color: Color(0xFFF59E0B), fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  const Text(
                    'App started, but MockRepository could not load bundled JSON. '
                    'Run:  npm run export-mock-data  in the dashboard, then rebuild.',
                    style: TextStyle(color: Color(0xFF6B7280), fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Text('$error',
                      style: const TextStyle(color: Color(0xFF0F172A), fontFamily: 'monospace', fontSize: 12)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BootCrashApp extends StatelessWidget {
  final Object error;
  final StackTrace stack;
  const _BootCrashApp({required this.error, required this.stack});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: const Color(0xFFF7F7FB),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Startup crash',
                      style: TextStyle(color: Colors.redAccent, fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text('$error',
                      style: const TextStyle(color: Color(0xFF0F172A), fontFamily: 'monospace', fontSize: 12)),
                  const SizedBox(height: 12),
                  Text('$stack',
                      style: const TextStyle(color: Color(0xFF6B7280), fontFamily: 'monospace', fontSize: 10)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
