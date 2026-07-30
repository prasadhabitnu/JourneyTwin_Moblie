import 'dart:math';
import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/compass.dart';

/// The Health Compass — 8-segment radial dial with center Momentum score.
/// Tap a segment to select. Selected segment gets a deeper fill + outline +
/// slight outward "pull" glow.
class HealthCompass extends StatefulWidget {
  final CompassScores scores;
  final int momentum;                          // 0..100 center score
  final HCompass selected;
  final ValueChanged<HCompass> onSelect;
  final double size;

  const HealthCompass({
    super.key,
    required this.scores,
    required this.momentum,
    required this.selected,
    required this.onSelect,
    this.size = 260,
  });

  @override
  State<HealthCompass> createState() => _HealthCompassState();
}

class _HealthCompassState extends State<HealthCompass>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: GestureDetector(
        onTapDown: (details) => _handleTap(details.localPosition),
        child: AnimatedBuilder(
          animation: _pulse,
          builder: (_, __) => CustomPaint(
            painter: _CompassPainter(
              scores: widget.scores,
              selected: widget.selected,
              pulse: _pulse.value,
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('MOMENTUM',
                      style: HText.eyebrow(c: HColors.inkMuted)
                          .copyWith(fontSize: 10, letterSpacing: 1.6)),
                  const SizedBox(height: 2),
                  Text('${widget.momentum}',
                      style: HText.heroNumber(c: HColors.ink)
                          .copyWith(fontSize: 40)),
                  Text('Good',
                      style: HText.body(size: 13, w: FontWeight.w800, c: HColors.success)),
                  const SizedBox(height: 2),
                  Text('↑ Keep building!',
                      style: HText.body(
                          size: 10, w: FontWeight.w600, c: HColors.inkMuted)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _handleTap(Offset pos) {
    final center = Offset(widget.size / 2, widget.size / 2);
    final v = pos - center;
    final distance = v.distance;
    // Ring only — inner label area is dead space.
    if (distance < widget.size * 0.20) return;
    if (distance > widget.size * 0.48) return;
    var angle = atan2(v.dy, v.dx); // -pi..pi with 0 = east
    // Convert so 0 = north (top), clockwise increases.
    angle = angle + pi / 2;
    if (angle < 0) angle += 2 * pi;
    final seg = (angle / (2 * pi / 8)).floor() % 8;
    widget.onSelect(HCompass.values[seg]);
  }
}

class _CompassPainter extends CustomPainter {
  final CompassScores scores;
  final HCompass selected;
  final double pulse; // 0..1

  _CompassPainter({
    required this.scores,
    required this.selected,
    required this.pulse,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final outerR = size.width * 0.48;
    final innerR = size.width * 0.20;

    const segCount = 8;
    const segAngle = 2 * pi / segCount;
    const startAngle = -pi / 2 - segAngle / 2; // first segment centered on top

    // Base ring background
    final ringBg = Paint()
      ..color = HColors.line
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    for (int i = 0; i < segCount; i++) {
      final seg = HCompass.values[i];
      final a0 = startAngle + i * segAngle;

      final rect = Rect.fromCircle(center: center, radius: outerR);
      final rectInner = Rect.fromCircle(center: center, radius: innerR);

      // Segment path: outer arc + line to inner arc + inner arc back + line to start.
      final path = Path()
        ..moveTo(
          center.dx + outerR * cos(a0),
          center.dy + outerR * sin(a0),
        )
        ..arcTo(rect, a0, segAngle, false)
        ..lineTo(
          center.dx + innerR * cos(a0 + segAngle),
          center.dy + innerR * sin(a0 + segAngle),
        )
        ..arcTo(rectInner, a0 + segAngle, -segAngle, false)
        ..close();

      final isSelected = seg == selected;
      final fill = Paint()
        ..style = PaintingStyle.fill
        ..color = isSelected
            ? seg.deep.withOpacity(0.55)
            : seg.fill;

      // Selected segment gets a subtle outward pulse tint on top
      canvas.drawPath(path, fill);

      if (isSelected) {
        final glow = Paint()
          ..style = PaintingStyle.fill
          ..shader = RadialGradient(
            colors: [
              seg.deep.withOpacity(0.35 + 0.25 * pulse),
              seg.deep.withOpacity(0),
            ],
          ).createShader(rect);
        canvas.drawPath(path, glow);
      }

      canvas.drawPath(path, ringBg);

      // Icon + label near mid-radius of segment
      final midAngle = a0 + segAngle / 2;
      final labelR = (outerR + innerR) / 2;
      final lx = center.dx + labelR * cos(midAngle);
      final ly = center.dy + labelR * sin(midAngle);

      _drawSegmentLabel(
        canvas,
        Offset(lx, ly),
        seg,
        isSelected,
      );
    }

    // Center disk (white)
    final disk = Paint()..color = Colors.white;
    canvas.drawCircle(center, innerR, disk);
    final diskBorder = Paint()
      ..color = HColors.line
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(center, innerR, diskBorder);

    // Outer border
    final outerBorder = Paint()
      ..color = HColors.line
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(center, outerR, outerBorder);
  }

  void _drawSegmentLabel(
      Canvas canvas, Offset pos, HCompass seg, bool selected) {
    // Icon (rendered as text painter for TextSpan-style consistency).
    final iconPainter = TextPainter(
      text: TextSpan(
        text: String.fromCharCode(seg.icon.codePoint),
        style: TextStyle(
          fontSize: 20,
          fontFamily: seg.icon.fontFamily,
          package: seg.icon.fontPackage,
          color: selected ? seg.deep : HColors.ink.withOpacity(0.7),
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    iconPainter.layout();
    iconPainter.paint(
      canvas,
      Offset(pos.dx - iconPainter.width / 2, pos.dy - iconPainter.height - 4),
    );

    // Label text
    final label = TextPainter(
      text: TextSpan(
        text: seg.label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: selected ? FontWeight.w900 : FontWeight.w700,
          color: selected ? seg.deep : HColors.ink.withOpacity(0.7),
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    label.layout();
    label.paint(
      canvas,
      Offset(pos.dx - label.width / 2, pos.dy + 2),
    );
  }

  @override
  bool shouldRepaint(covariant _CompassPainter old) =>
      old.selected != selected || old.pulse != pulse;
}
