import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../voice/nu_voice.dart';
import '../voice/planets.dart';
import '../voice/dialog_manager.dart';
import 'voice_bar.dart';
import 'voice_overlay.dart';

/// The base scaffold for every screen in Nu.
/// - Dark space background with subtle star field.
/// - Optional back button and title in the top bar.
/// - Voice bar pinned to the bottom.
/// - Overlay stack: listening transcript, Nu-speaking indicator, intent-result banner.
///
/// Screens pass their body content as [child]. When [dialogScope] is provided,
/// the frame registers/unregisters that scope with the DialogManager so
/// screen-local scripted conversations resolve while this screen is visible.
class NuFrame extends StatefulWidget {
  final Widget child;
  final String? title;
  final bool showBack;
  final String? dialogScope;
  final DialogTree? dialogTree;

  const NuFrame({
    super.key,
    required this.child,
    this.title,
    this.showBack = false,
    this.dialogScope,
    this.dialogTree,
  });

  @override
  State<NuFrame> createState() => _NuFrameState();
}

class _NuFrameState extends State<NuFrame> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.dialogScope != null && widget.dialogTree != null) {
        context.read<DialogManager>().register(widget.dialogScope!, widget.dialogTree!);
      }
    });

    // Listen for voice intents while this frame is mounted.
    final voice = context.read<NuVoice>();
    voice.intents.listen(_onIntent);
  }

  @override
  void dispose() {
    if (widget.dialogScope != null) {
      context.read<DialogManager>().unregister(widget.dialogScope!);
    }
    super.dispose();
  }

  void _onIntent(ParsedIntent intent) async {
    if (!mounted) return;
    final voice = context.read<NuVoice>();
    final dialog = context.read<DialogManager>();

    // Try screen-local scripted response first.
    final node = dialog.resolve(intent);
    if (node != null) {
      await voice.speak(node.say);
      return;
    }

    // Otherwise if it's a navigation intent, speak the acknowledgement and route.
    if (intent.matched && intent.route != null) {
      if (intent.target != null) {
        await voice.speak('Opening ${intent.target!.name}');
      } else if (intent.route == '/') {
        await voice.speak('Back to your Universe');
      }
      await Future.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil(intent.route!, (r) => intent.route == '/' ? false : r.isFirst);
    } else if (!intent.matched && intent.transcript.isNotEmpty) {
      await voice.speak("I didn't catch that. Try saying: open C G M, or, why did my T I R drop.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NuColors.spaceBg,
      body: Stack(
        children: [
          _spaceBg(),
          SafeArea(
            child: Column(
              children: [
                _topBar(),
                Expanded(child: widget.child),
                const VoiceBar(),
              ],
            ),
          ),
          const VoiceOverlay(),
        ],
      ),
    );
  }

  Widget _spaceBg() {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.topCenter,
          radius: 1.4,
          colors: [NuColors.spaceIndigo, NuColors.spaceBg],
          stops: [0.0, 0.55],
        ),
      ),
      child: CustomPaint(
        painter: _StarFieldPainter(),
        child: Container(),
      ),
    );
  }

  Widget _topBar() {
    if (!widget.showBack && widget.title == null) return const SizedBox(height: 8);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Row(
        children: [
          if (widget.showBack)
            _BackButton(onTap: () {
              Navigator.of(context).canPop()
                  ? Navigator.of(context).pop()
                  : Navigator.of(context).pushReplacementNamed('/');
            }),
          if (widget.showBack) const SizedBox(width: 10),
          if (widget.title != null)
            Text(widget.title!, style: NuText.body(size: 16, w: FontWeight.w800)),
          const Spacer(),
          Selector<NuVoice, bool>(
            selector: (_, v) => v.listening,
            builder: (_, listening, __) => listening
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 8, height: 8, decoration: const BoxDecoration(color: NuColors.violet400, shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      Text('Nu is listening', style: NuText.eyebrow()),
                    ],
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _BackButton extends StatelessWidget {
  final VoidCallback onTap;
  const _BackButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          border: Border.all(color: Colors.white.withOpacity(0.12)),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
      ),
    );
  }
}

class _StarFieldPainter extends CustomPainter {
  static const _stars = [
    [0.12, 0.08, 0.4], [0.68, 0.06, 0.35], [0.08, 0.44, 0.3],
    [0.92, 0.52, 0.3], [0.32, 0.28, 0.45], [0.74, 0.44, 0.4],
    [0.18, 0.72, 0.32], [0.58, 0.78, 0.36], [0.86, 0.86, 0.3],
    [0.24, 0.92, 0.32], [0.44, 0.14, 0.28], [0.82, 0.22, 0.34],
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    for (final s in _stars) {
      paint.color = Colors.white.withOpacity(s[2]);
      canvas.drawCircle(Offset(s[0] * size.width, s[1] * size.height), 1.2, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _StarFieldPainter oldDelegate) => false;
}
