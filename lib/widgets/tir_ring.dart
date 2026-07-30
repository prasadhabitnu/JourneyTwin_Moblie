import 'dart:math';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Animated Time-in-Range ring — three-band stacked arc showing % in range
/// (green), % above (amber), and % below (red). Center label shows the TIR%.
class TirRing extends StatefulWidget {
  final double tir;         // 0..1
  final double timeAbove;   // 0..1
  final double timeBelow;   // 0..1
  final double size;

  const TirRing({
    super.key,
    required this.tir,
    required this.timeAbove,
    required this.timeBelow,
    this.size = 180,
  });

  @override
  State<TirRing> createState() => _TirRingState();
}

class _TirRingState extends State<TirRing> with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..forward();
  }

  @override
  void dispose() { _c.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) {
        final t = Curves.easeOutCubic.transform(_c.value);
        return SizedBox(
          width: widget.size, height: widget.size,
          child: CustomPaint(
            painter: _TirPainter(
              tir: widget.tir * t,
              timeAbove: widget.timeAbove * t,
              timeBelow: widget.timeBelow * t,
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${(widget.tir * 100 * t).round()}',
                    style: NuText.heroNumber(c: _pickColor(widget.tir)),
                  ),
                  Text('% in range', style: NuText.eyebrow(c: Colors.white.withOpacity(0.85))),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Color _pickColor(double tir) {
    final pct = tir * 100;
    if (pct >= 80) return NuColors.emerald500;
    if (pct >= 65) return NuColors.amber400;
    return NuColors.rose400;
  }
}

class _TirPainter extends CustomPainter {
  final double tir;
  final double timeAbove;
  final double timeBelow;

  _TirPainter({required this.tir, required this.timeAbove, required this.timeBelow});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final center = rect.center;
    final radius = size.width / 2 - 12;
    final stroke = 16.0;

    // Background track
    final track = Paint()
      ..color = Colors.white.withOpacity(0.06)
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke;
    canvas.drawCircle(center, radius, track);

    // Segments (start at 12 o'clock, sweep clockwise).
    const start = -pi / 2;
    final greenArc = tir * 2 * pi;
    final amberArc = timeAbove * 2 * pi;
    final redArc = timeBelow * 2 * pi;

    // In-range
    _drawArc(canvas, center, radius, start, greenArc, NuColors.emerald500, stroke);
    // Above
    _drawArc(canvas, center, radius, start + greenArc, amberArc, NuColors.amber400, stroke);
    // Below
    _drawArc(canvas, center, radius, start + greenArc + amberArc, redArc, NuColors.rose400, stroke);
  }

  void _drawArc(Canvas c, Offset center, double r, double from, double sweep, Color color, double stroke) {
    if (sweep <= 0) return;
    final rect = Rect.fromCircle(center: center, radius: r);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        colors: [color, color.withOpacity(0.75)],
        transform: GradientRotation(from),
      ).createShader(rect);
    c.drawArc(rect, from, sweep, false, paint);
  }

  @override
  bool shouldRepaint(covariant _TirPainter old) =>
      tir != old.tir || timeAbove != old.timeAbove || timeBelow != old.timeBelow;
}
