import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../voice/nu_voice.dart';

/// The persistent bottom voice bar. Big mic button + wake-phrase hint +
/// last-attempt debug line.
class VoiceBar extends StatelessWidget {
  const VoiceBar({super.key});

  @override
  Widget build(BuildContext context) {
    final voice = context.watch<NuVoice>();
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _TestButtons(voice: voice),
          if (voice.lastIntent != null || voice.error != null)
            _DebugLine(voice: voice),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: LinearGradient(
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [
                  NuColors.spaceBg.withOpacity(0.8),
                  NuColors.spaceBg.withOpacity(0.95),
                ],
              ),
              border: Border.all(color: NuColors.violet400.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        voice.speaking
                            ? 'Nu is speaking'
                            : voice.listening
                                ? 'Listening…'
                                : 'Say the wake phrase',
                        style: NuText.eyebrow(
                            c: voice.speaking
                                ? NuColors.emerald400
                                : voice.listening
                                    ? NuColors.rose400
                                    : NuColors.violet300),
                      ),
                      const SizedBox(height: 3),
                      RichText(
                        text: TextSpan(
                          style: NuText.body(size: 13, w: FontWeight.w600),
                          children: const [
                            TextSpan(
                              text: '"Whatsup Nu"',
                              style: TextStyle(color: NuColors.violet300, fontWeight: FontWeight.w900),
                            ),
                            TextSpan(text: ' + a planet'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                _MicButton(voice: voice),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Small row of debug buttons that inject synthetic transcripts, bypassing
/// STT entirely. If these navigate but voice doesn't, STT is the problem.
class _TestButtons extends StatelessWidget {
  final NuVoice voice;
  const _TestButtons({required this.voice});

  @override
  Widget build(BuildContext context) {
    Widget btn(String label) => Padding(
          padding: const EdgeInsets.only(right: 6),
          child: GestureDetector(
            onTap: () => voice.injectTranscript(label),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.white.withOpacity(0.06),
                border: Border.all(color: NuColors.violet400.withOpacity(0.3)),
              ),
              child: Text(label,
                  style: NuText.body(size: 10, w: FontWeight.w800, c: NuColors.violet300)),
            ),
          ),
        );
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            Text('Test:', style: NuText.eyebrow(c: Colors.white.withOpacity(0.55))),
            const SizedBox(width: 8),
            btn('cgm'),
            btn('today'),
            btn('rewards'),
            btn('home'),
            btn('whatsup nu open cgm'),
            btn('whatsup new open cgm'),
            btn('why did my tir drop'),
          ],
        ),
      ),
    );
  }
}

/// Persistent debug line — shows last STT output + parser result until dismissed.
class _DebugLine extends StatelessWidget {
  final NuVoice voice;
  const _DebugLine({required this.voice});

  @override
  Widget build(BuildContext context) {
    final intent = voice.lastIntent;
    final err = voice.error;

    Color tint;
    String label;
    List<Widget> lines = [];

    if (err != null) {
      tint = NuColors.rose400;
      label = 'Voice error';
      lines.add(Text(err, style: NuText.body(size: 11, w: FontWeight.w500)));
    } else if (intent != null) {
      tint = intent.matched ? NuColors.emerald400 : NuColors.amber400;
      label = intent.matched ? 'Matched  ${intent.reason}' : "No match  (${intent.reason})";
      lines.add(_kv('heard', intent.transcript));
      lines.add(_kv('parsed', intent.cleaned));
      if (intent.matched && intent.target != null) {
        lines.add(_kv('→ route', intent.route ?? '?'));
      }
    } else {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: tint.withOpacity(0.12),
        border: Border.all(color: tint.withOpacity(0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(label, style: NuText.eyebrow(c: tint)),
                const SizedBox(height: 4),
                ...lines,
              ],
            ),
          ),
          GestureDetector(
            onTap: voice.resetIntent,
            child: Container(
              width: 22, height: 22,
              decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.08)),
              child: const Icon(Icons.close, size: 12, color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kv(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 1),
        child: RichText(
          text: TextSpan(
            style: NuText.body(size: 11, w: FontWeight.w500, c: Colors.white.withOpacity(0.85)),
            children: [
              TextSpan(text: '$k: ', style: TextStyle(color: Colors.white.withOpacity(0.55), fontWeight: FontWeight.w900)),
              TextSpan(text: v.isEmpty ? '(empty)' : v),
            ],
          ),
        ),
      );
}

class _MicButton extends StatelessWidget {
  final NuVoice voice;
  const _MicButton({required this.voice});

  @override
  Widget build(BuildContext context) {
    final listening = voice.listening;
    return GestureDetector(
      onTap: () => listening ? voice.stop() : voice.start(),
      onLongPress: () => voice.cancel(),
      child: Container(
        width: 58, height: 58,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: listening ? NuGradients.micListening : NuGradients.micIdle,
          boxShadow: [
            BoxShadow(
              color: (listening ? NuColors.rose600 : NuColors.violet600).withOpacity(0.5),
              blurRadius: 24, spreadRadius: 2, offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Icon(listening ? Icons.mic_off : Icons.mic, color: Colors.white, size: 26),
            if (listening) _PulseRing(),
            if (listening) _PulseRing(delay: 0.5),
          ],
        ),
      ),
    );
  }
}

class _PulseRing extends StatefulWidget {
  final double delay;
  const _PulseRing({this.delay = 0});
  @override
  State<_PulseRing> createState() => _PulseRingState();
}

class _PulseRingState extends State<_PulseRing> with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))
      ..repeat();
    Future.delayed(Duration(milliseconds: (widget.delay * 700).round()), () {
      if (mounted) _c.forward(from: 0);
    });
  }

  @override
  void dispose() { _c.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) {
        final t = _c.value;
        return Container(
          width: 58 + 30 * t, height: 58 + 30 * t,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: NuColors.rose400.withOpacity((1 - t) * 0.6),
              width: 2,
            ),
          ),
        );
      },
    );
  }
}
