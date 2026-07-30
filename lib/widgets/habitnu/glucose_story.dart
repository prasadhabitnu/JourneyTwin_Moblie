import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/cgm.dart';

/// Today's Glucose Story — hero stats stacked (or side-by-side on wide),
/// then a full-width chart with meal + walk icons annotated inline.
class GlucoseStoryCard extends StatefulWidget {
  final DayStats day;
  final double? currentMgdl;
  final int tirGoalPct;
  final double gmiGoalPct;
  final ValueChanged<CgmAnnotation>? onAnnotationTap;

  const GlucoseStoryCard({
    super.key,
    required this.day,
    this.currentMgdl,
    this.tirGoalPct = 70,
    this.gmiGoalPct = 7.0,
    this.onAnnotationTap,
  });

  @override
  State<GlucoseStoryCard> createState() => _GlucoseStoryCardState();
}

class _GlucoseStoryCardState extends State<GlucoseStoryCard> {
  CgmAnnotation? _tapped;

  @override
  Widget build(BuildContext context) {
    final now = widget.currentMgdl ?? widget.day.meanGlucose;
    final tir = (widget.day.tir * 100).round();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: HColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: HColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text("TODAY'S GLUCOSE STORY",
                  style: HText.eyebrow(c: HColors.brandBlue)),
              const Spacer(),
              Icon(Icons.info_outline_rounded, size: 15, color: HColors.inkMuted),
            ],
          ),
          const SizedBox(height: 10),
          // Hero stats — horizontal so the chart below can be full-width
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _stat('${now.round()}', 'mg/dL', 'Now'),
              const SizedBox(width: 20),
              _stat('$tir%',            'TIR',  'Goal ${widget.tirGoalPct}%+'),
              const SizedBox(width: 20),
              _stat('${widget.day.gmi.toStringAsFixed(1)}%', 'GMI', 'Goal <${widget.gmiGoalPct.toStringAsFixed(1)}%'),
            ],
          ),
          const SizedBox(height: 14),
          // Full-width chart — sized by the parent card
          SizedBox(
            height: 170,
            child: _GlucoseChart(
              day: widget.day,
              onTap: (a) {
                setState(() => _tapped = a);
                widget.onAnnotationTap?.call(a);
              },
            ),
          ),
          const SizedBox(height: 8),
          _AnnotationLegend(day: widget.day),
          if (_tapped != null) ...[
            const SizedBox(height: 10),
            _AnnotationExplainer(
              annotation: _tapped!,
              onDismiss: () => setState(() => _tapped = null),
            ),
          ],
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: () {},
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('View full glucose story',
                      style: HText.body(size: 12, w: FontWeight.w800, c: HColors.brandBlue)),
                  Icon(Icons.chevron_right_rounded, size: 16, color: HColors.brandBlue),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String big, String label, String hint) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(big, style: HText.body(size: 24, w: FontWeight.w900, c: HColors.ink)),
            Text(label,
                style: HText.body(size: 10, w: FontWeight.w900, c: HColors.inkMuted)
                    .copyWith(letterSpacing: 1.0)),
            Text(hint, style: HText.body(size: 10.5, w: FontWeight.w500, c: HColors.inkMuted)),
          ],
        ),
      );
}

class _GlucoseChart extends StatelessWidget {
  final DayStats day;
  final ValueChanged<CgmAnnotation>? onTap;
  const _GlucoseChart({required this.day, this.onTap});

  @override
  Widget build(BuildContext context) {
    if (day.readings.isEmpty) {
      return const Center(child: Text('No readings'));
    }
    final anchor = DateTime(day.readings.first.t.year, day.readings.first.t.month, day.readings.first.t.day);
    double hr(DateTime t) => t.difference(anchor).inMinutes / 60.0;
    final spots = day.readings.map((r) => FlSpot(hr(r.t), r.mgdl)).toList();

    return LineChart(
      LineChartData(
        minX: 0, maxX: 24, minY: 40, maxY: 260,
        clipData: const FlClipData.all(),
        gridData: FlGridData(
          drawVerticalLine: true,
          horizontalInterval: 60,
          verticalInterval: 6,
          getDrawingHorizontalLine: (_) => const FlLine(color: HColors.line, strokeWidth: 0.5),
          getDrawingVerticalLine: (_) => const FlLine(color: HColors.line, strokeWidth: 0.5),
        ),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 6,
              reservedSize: 22,
              getTitlesWidget: (v, _) {
                if (v == 0 || v == 24) {
                  return const SizedBox.shrink(); // avoid edge overflow
                }
                return Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(_hourLabel(v),
                      style: HText.body(size: 10, w: FontWeight.w700, c: HColors.inkMuted)),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 60,
              reservedSize: 30,
              getTitlesWidget: (v, _) => Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text('${v.toInt()}',
                    style: HText.body(size: 10, w: FontWeight.w700, c: HColors.inkMuted)),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        rangeAnnotations: RangeAnnotations(horizontalRangeAnnotations: [
          HorizontalRangeAnnotation(
            y1: 70, y2: 180,
            color: const Color(0xFFECFDF5),
          ),
        ]),
        lineTouchData: LineTouchData(
          enabled: true,
          touchCallback: (evt, resp) {
            if (evt is FlTapUpEvent && resp?.lineBarSpots != null && resp!.lineBarSpots!.isNotEmpty) {
              final spot = resp.lineBarSpots!.first;
              final tapped = _annotationNear(spot.x, anchor);
              if (tapped != null && onTap != null) onTap!(tapped);
            }
          },
          touchTooltipData: LineTouchTooltipData(
            getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
              '${s.y.round()} mg/dL',
              HText.body(size: 11, w: FontWeight.w900, c: HColors.ink),
            )).toList(),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.25,
            barWidth: 2.4,
            color: HColors.brandBlue,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [
                  HColors.brandBlue.withOpacity(0.15),
                  HColors.brandBlue.withOpacity(0.02),
                ],
              ),
            ),
          ),
          ..._annotationLayers(anchor),
        ],
      ),
    );
  }

  CgmAnnotation? _annotationNear(double xHour, DateTime anchor) {
    if (day.annotations.isEmpty) return null;
    CgmAnnotation? best;
    double bestD = 99;
    for (final a in day.annotations) {
      final ah = a.t.difference(anchor).inMinutes / 60.0;
      final d = (ah - xHour).abs();
      if (d < 0.5 && d < bestD) { best = a; bestD = d; }
    }
    return best;
  }

  List<LineChartBarData> _annotationLayers(DateTime anchor) {
    const kindMeta = <String, ({Color color, String label})>{
      'meal':       (color: Color(0xFFF59E0B), label: 'Meal'),
      'activity':   (color: Color(0xFF10B981), label: 'Walk'),
      'hydration':  (color: Color(0xFF38BDF8), label: 'Water'),
      'medication': (color: Color(0xFF7C3AED), label: 'Meds'),
      'sleep':      (color: Color(0xFF818CF8), label: 'Sleep'),
    };
    final layers = <LineChartBarData>[];
    for (final entry in kindMeta.entries) {
      final kind = entry.key;
      final color = entry.value.color;
      final spots = day.annotations
          .where((a) => a.kind == kind)
          .map((a) {
            final h = a.t.difference(anchor).inMinutes / 60.0;
            final r = _nearestReading(a.t).mgdl;
            return FlSpot(h.clamp(0.5, 23.5), r);
          })
          .toList();
      if (spots.isEmpty) continue;
      layers.add(LineChartBarData(
        spots: spots,
        barWidth: 0,
        color: Colors.transparent,
        isCurved: false,
        dotData: FlDotData(
          show: true,
          getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
            radius: 6,
            color: color,
            strokeColor: Colors.white,
            strokeWidth: 2,
          ),
        ),
      ));
    }
    return layers;
  }

  CgmReading _nearestReading(DateTime t) {
    var best = day.readings.first;
    var bestDelta = t.difference(best.t).inMinutes.abs();
    for (final r in day.readings) {
      final d = t.difference(r.t).inMinutes.abs();
      if (d < bestDelta) { best = r; bestDelta = d; }
    }
    return best;
  }

  String _hourLabel(double h) {
    final hh = h.floor();
    if (hh == 0) return '12a';
    if (hh == 12) return '12p';
    if (hh < 12) return '${hh}a';
    return '${hh - 12}p';
  }
}

class _AnnotationLegend extends StatelessWidget {
  final DayStats day;
  const _AnnotationLegend({required this.day});

  @override
  Widget build(BuildContext context) {
    final kinds = <String>{};
    for (final a in day.annotations) kinds.add(a.kind);
    const meta = <String, ({Color color, IconData icon, String label})>{
      'meal':       (color: Color(0xFFF59E0B), icon: Icons.restaurant_rounded, label: 'Meal'),
      'activity':   (color: Color(0xFF10B981), icon: Icons.directions_walk_rounded, label: 'Walk'),
      'hydration':  (color: Color(0xFF38BDF8), icon: Icons.local_drink_rounded, label: 'Water'),
      'medication': (color: Color(0xFF7C3AED), icon: Icons.medication_outlined, label: 'Med'),
      'sleep':      (color: Color(0xFF818CF8), icon: Icons.nightlight_rounded, label: 'Sleep'),
    };
    final chips = <Widget>[];
    for (final k in meta.keys) {
      if (!kinds.contains(k)) continue;
      final m = meta[k]!;
      chips.add(Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 14, height: 14,
            decoration: BoxDecoration(shape: BoxShape.circle, color: m.color),
            child: Icon(m.icon, size: 8, color: Colors.white),
          ),
          const SizedBox(width: 4),
          Text(m.label,
              style: HText.body(size: 10, w: FontWeight.w700, c: HColors.inkMuted)),
        ],
      ));
    }
    return Wrap(
      spacing: 10, runSpacing: 4,
      children: [
        Text('Tap a dot to hear the story',
            style: HText.body(size: 10, w: FontWeight.w800, c: HColors.brandBlue)),
        ...chips,
      ],
    );
  }
}

class _AnnotationExplainer extends StatelessWidget {
  final CgmAnnotation annotation;
  final VoidCallback onDismiss;
  const _AnnotationExplainer({required this.annotation, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    const meta = <String, ({Color color, IconData icon, String label})>{
      'meal':       (color: Color(0xFFF59E0B), icon: Icons.restaurant_rounded, label: 'Meal'),
      'activity':   (color: Color(0xFF10B981), icon: Icons.directions_walk_rounded, label: 'Walk'),
      'hydration':  (color: Color(0xFF38BDF8), icon: Icons.local_drink_rounded, label: 'Water'),
      'medication': (color: Color(0xFF7C3AED), icon: Icons.medication_outlined, label: 'Med'),
      'sleep':      (color: Color(0xFF818CF8), icon: Icons.nightlight_rounded, label: 'Sleep'),
    };
    final m = meta[annotation.kind] ??
        (color: HColors.brandBlue, icon: Icons.info_outline, label: 'Event');
    final time = TimeOfDay.fromDateTime(annotation.t);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: m.color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: m.color.withOpacity(0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(shape: BoxShape.circle, color: m.color),
            child: Icon(m.icon, size: 14, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('${m.label} · ${time.format(context)}',
                        style: HText.body(size: 11, w: FontWeight.w900, c: m.color)),
                    const Spacer(),
                    GestureDetector(
                      onTap: onDismiss,
                      child: const Icon(Icons.close_rounded, size: 16, color: HColors.inkMuted),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(annotation.label,
                    style: HText.body(size: 13, w: FontWeight.w800, c: HColors.ink)),
                if (annotation.note != null && annotation.note!.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(annotation.note!,
                      style: HText.body(size: 11.5, w: FontWeight.w500, c: HColors.ink.withOpacity(0.72))),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
