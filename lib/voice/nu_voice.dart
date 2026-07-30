import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';

import 'planets.dart';

/// Wraps native Android SpeechRecognizer + TTS behind a ChangeNotifier.
/// UI observes via `Provider.of<NuVoice>(context)`.
class NuVoice extends ChangeNotifier {
  final stt.SpeechToText _stt = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _initialized = false;
  bool _available = false;
  bool _listening = false;
  bool _speaking = false;
  String _transcript = '';
  String _interim = '';
  String? _error;
  ParsedIntent? _lastIntent;

  bool get available => _available;
  bool get listening => _listening;
  bool get speaking => _speaking;
  String get transcript => _transcript;
  String get interim => _interim;
  String? get error => _error;
  ParsedIntent? get lastIntent => _lastIntent;

  /// Emits every finalized intent so navigators / dialog managers can react.
  final _intentController = StreamController<ParsedIntent>.broadcast();
  Stream<ParsedIntent> get intents => _intentController.stream;

  Future<bool> initialize() async {
    if (_initialized) return _available;
    _initialized = true;

    // Request mic permission up front.
    final micStatus = await Permission.microphone.request();
    if (!micStatus.isGranted) {
      _error = 'Microphone permission denied. Enable it in Settings → Apps → Nu → Permissions.';
      notifyListeners();
      return false;
    }

    _available = await _stt.initialize(
      onError: _onSttError,
      onStatus: _onSttStatus,
      debugLogging: kDebugMode,
    );

    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.5);
    await _tts.setPitch(1.05);
    _tts.setStartHandler(() { _speaking = true; notifyListeners(); });
    _tts.setCompletionHandler(() { _speaking = false; notifyListeners(); });
    _tts.setCancelHandler(() { _speaking = false; notifyListeners(); });

    notifyListeners();
    return _available;
  }

  Future<void> start() async {
    if (!_initialized) {
      final ok = await initialize();
      if (!ok) return;
    }
    if (_listening) return;

    _transcript = '';
    _interim = '';
    _error = null;
    _lastIntent = null;
    notifyListeners();

    await _stt.listen(
      onResult: _onResult,
      listenOptions: stt.SpeechListenOptions(
        listenMode: stt.ListenMode.dictation,
        partialResults: true,
        cancelOnError: false,
      ),
      pauseFor: const Duration(seconds: 6),
      listenFor: const Duration(seconds: 30),
      localeId: 'en_US',
    );
    _listening = true;
    notifyListeners();
  }

  Future<void> stop() async {
    if (!_listening) return;
    await _stt.stop();
    _listening = false;
    // Finalize whatever we got. Prefer final transcript, fall back to
    // interim (Android STT often streams interim results without ever
    // marking one final).
    final utterance = _bestUtterance();
    if (utterance.isNotEmpty) {
      final intent = IntentParser.parse(utterance);
      _lastIntent = intent;
      _intentController.add(intent);
    }
    notifyListeners();
  }

  String _bestUtterance() {
    final t = _transcript.trim();
    if (t.isNotEmpty) return t;
    return _interim.trim();
  }

  Future<void> cancel() async {
    await _stt.cancel();
    _listening = false;
    _transcript = '';
    _interim = '';
    notifyListeners();
  }

  void resetIntent() {
    _lastIntent = null;
    notifyListeners();
  }

  /// Debug helper — inject a synthetic transcript through the intent pipeline
  /// so we can verify the parser + navigation work independently of STT.
  Future<void> injectTranscript(String text) async {
    _transcript = text;
    _interim = '';
    _error = null;
    final intent = IntentParser.parse(text);
    _lastIntent = intent;
    _intentController.add(intent);
    notifyListeners();
  }

  Future<void> speak(String text) async {
    if (text.trim().isEmpty) return;
    await _tts.stop();
    await _tts.speak(text);
  }

  Future<void> shutUp() async {
    await _tts.stop();
    _speaking = false;
    notifyListeners();
  }

  // ---------- STT event handlers ----------

  void _onResult(SpeechRecognitionResult result) {
    if (result.finalResult) {
      _transcript = (_transcript.isEmpty ? '' : '$_transcript ') + result.recognizedWords.trim();
      _interim = '';
    } else {
      _interim = result.recognizedWords;
    }
    notifyListeners();
  }

  void _onSttStatus(String status) {
    // status: "listening" | "notListening" | "done"
    if (status == 'notListening' || status == 'done') {
      if (_listening) {
        _listening = false;
        // Same fallback logic as stop() — interim if no final arrived.
        final utterance = _bestUtterance();
        if (utterance.isNotEmpty) {
          final intent = IntentParser.parse(utterance);
          _lastIntent = intent;
          _intentController.add(intent);
        }
        notifyListeners();
      }
    }
  }

  void _onSttError(SpeechRecognitionError e) {
    final code = e.errorMsg;
    const map = {
      'error_no_match': "I didn't catch that. Try again?",
      'error_speech_timeout': "I didn't hear anything. Tap the mic again.",
      'error_network': 'Network error during speech recognition.',
      'error_audio': 'Microphone unavailable.',
      'error_permission': 'Microphone permission was denied.',
    };
    _error = map[code] ?? 'Voice error: $code';
    _listening = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _intentController.close();
    _stt.cancel();
    _tts.stop();
    super.dispose();
  }
}
