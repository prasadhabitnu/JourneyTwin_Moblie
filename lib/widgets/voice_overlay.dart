import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../voice/nu_voice.dart';
import '../voice/planets.dart';

/// Overlay layer that sits above the frame's content while the mic is active
/// or after Nu has parsed an intent. Three states:
///   1. Listening — live transcript + interim words.
///   2. Result banner — matched or unmatched, auto-dismisses.
///   3. Error banner — mic denied / network error.
class VoiceOverlay extends StatelessWidget {
  const VoiceOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    final voice = context.watch<NuVoice>();
    Widget? content;

    if (voice.listening) {
      content = _ListeningPanel(transcript: voice.transcript, interim: voice.interim);
    } else if (voice.lastIntent != null) {
      content = _ResultPanel(intent: voice.lastIntent!, onDismiss: voice.resetIntent);
    } else if (voice.error != null) {
      content = _ErrorPanel(text: voice.error!, onDismiss: voice.resetIntent);
    }

    return IgnorePointer(
      ignoring: content == null,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: content == null
            ? const SizedBox.shrink(key: ValueKey('empty'))
            : Align(
                key: const ValueKey('active'),
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 110, left: 16, right: 16),
                  child: content,
                ),
              ),
      ),
    );
  }
}

class _ListeningPanel extends StatelessWidget {
  final String transcript;
  final String interim;
  const _ListeningPanel({required this.transcript, required this.interim});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [NuColors.violet900.withOpacity(0.7), NuColors.spaceIndigo.withOpacity(0.75)],
        ),
        border: Border.all(color: NuColors.violet400.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(color: NuColors.violet600.withOpacity(0.5), blurRadius: 30, offset: const Offset(0, 12)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: NuColors.rose400, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text('Listening…', style: NuText.eyebrow()),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _display(transcript, interim),
            style: NuText.body(size: 15, w: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  String _display(String t, String i) {
    if (t.isEmpty && i.isEmpty) return 'Waiting for you to speak…';
    if (t.isNotEmpty && i.isNotEmpty) return '$t $i';
    return t.isNotEmpty ? t : i;
  }
}

class _ResultPanel extends StatelessWidget {
  final ParsedIntent intent;
  final VoidCallback onDismiss;
  const _ResultPanel({required this.intent, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    final good = intent.matched;
    return GestureDetector(
      onTap: onDismiss,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: good
                ? [NuColors.emerald500.withOpacity(0.35), NuColors.emerald500.withOpacity(0.15)]
                : [NuColors.amber400.withOpacity(0.30), NuColors.rose600.withOpacity(0.20)],
          ),
          border: Border.all(
            color: (good ? NuColors.emerald400 : NuColors.amber400).withOpacity(0.5),
            width: 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(
                  good ? 'Nu understood' : "Didn't catch that",
                  style: NuText.eyebrow(c: good ? NuColors.emerald400 : NuColors.amber400),
                ),
                const Spacer(),
                Text(
                  good ? '${(intent.confidence * 100).round()}% confident' : intent.reason,
                  style: NuText.body(size: 10, w: FontWeight.w500, c: Colors.white.withOpacity(0.6)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('You said: "${intent.transcript}"', style: NuText.body(size: 13, w: FontWeight.w500, c: Colors.white.withOpacity(0.9))),
            const SizedBox(height: 4),
            Text('Parsed: "${intent.cleaned}"',
                style: NuText.body(size: 11, w: FontWeight.w500, c: Colors.white.withOpacity(0.55))),
            if (good && intent.target != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(intent.target!.emoji, style: const TextStyle(fontSize: 20)),
                  const SizedBox(width: 8),
                  Text('Opening ', style: NuText.body(size: 13, w: FontWeight.w600)),
                  Text(intent.target!.name, style: NuText.body(size: 13, w: FontWeight.w900)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  final String text;
  final VoidCallback onDismiss;
  const _ErrorPanel({required this.text, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onDismiss,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: NuColors.rose600.withOpacity(0.25),
          border: Border.all(color: NuColors.rose400.withOpacity(0.5), width: 1),
        ),
        child: Text(text, style: NuText.body(size: 13, w: FontWeight.w600, c: NuColors.rose400)),
      ),
    );
  }
}
