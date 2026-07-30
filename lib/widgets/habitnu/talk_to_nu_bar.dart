import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../theme/habitnu_theme.dart';
import '../../voice/nu_voice.dart';

/// Persistent bottom "Talk to Nu" bar. Left: mic + label. Right: suggestion pills.
class TalkToNuBar extends StatelessWidget {
  final List<String> pills;
  final ValueChanged<String>? onPill;
  const TalkToNuBar({super.key, required this.pills, this.onPill});

  @override
  Widget build(BuildContext context) {
    final voice = context.watch<NuVoice>();
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
      decoration: BoxDecoration(
        color: const Color(0xFFECEBFB),
        border: Border(top: BorderSide(color: HColors.line.withOpacity(0.6))),
      ),
      child: Row(
        children: [
          _MicButton(voice: voice),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Talk to Nu',
                    style: HText.body(size: 13, w: FontWeight.w900, c: HColors.ink)),
                Text(
                    voice.listening
                        ? 'Listening…'
                        : voice.speaking
                            ? 'Speaking…'
                            : 'Ask anything…',
                    style: HText.body(size: 11, w: FontWeight.w500, c: HColors.inkMuted)),
              ],
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            flex: 3,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final p in pills) ...[
                    _pill(p, () {
                      if (onPill != null) onPill!(p);
                      voice.injectTranscript(p);
                    }),
                    const SizedBox(width: 6),
                  ],
                  Icon(Icons.chevron_right_rounded,
                      size: 18, color: HColors.inkMuted),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _pill(String label, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: HColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: HColors.line),
          ),
          child: Text(label,
              style: HText.body(size: 11.5, w: FontWeight.w700, c: HColors.ink)),
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
      child: Container(
        width: 44, height: 44,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: listening
                ? [HColors.danger, const Color(0xFFDC2626)]
                : [const Color(0xFF6366F1), HColors.brandBlue],
          ),
          boxShadow: [
            BoxShadow(
              color: (listening ? HColors.danger : HColors.brandBlue).withOpacity(0.35),
              blurRadius: 12, offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          listening ? Icons.mic_off_rounded : Icons.mic_rounded,
          color: Colors.white, size: 20,
        ),
      ),
    );
  }
}
