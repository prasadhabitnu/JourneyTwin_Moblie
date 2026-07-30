import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models/cgm.dart';

/// 24-hour glucose curve for a single day with meal/activity/hydration/
/// medication/sleep annotations overlaid as colored dots.
///
/// X-axis: hours 0..24. Y-axis: mg/dL, range 40..280 (auto-fit to data).
/// The band 70–180 is highlighted as the target range.
class CgmTimeline extends StatelessWidget {
  final DayStats day;
  final double height;
  final DateTime? highlightAt;

  const CgmTimeline({
    super.key,
    required this.day,
    this.height = 220,
    this.highlightAt,
  });

  @override
  Widget build(BuildContext context) {
    if (day.readings.isEmpty) {
      return SizedBox(height: height, child: Center(child: Text('No readings', style: NuText.body(c: Colors.white54))));
    }

    // Anchor to the day's midnight so all readings map to 0..24.
    final anchor = DateTime(day.readings.first.t.year, day.readings.first.t.month, day.readings.first.t.day);
    double hour(DateTime t) => t.difference(anchor).inMinutes / 60.0;

    final spots = day.readings.map((r) => FlSpot(hour(r.t), r.mgdl)).toList();

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          minX: 0, maxX: 24, minY: 40, maxY: 280,
          gridData: FlGridData(
            drawVerticalLine: true,
            horizontalInterval: 60,
            verticalInterval: 6,
            getDrawingHorizontalLine: (v) => FlLine(color: Colors.white.withOpacity(0.06), strokeWidth: 1),
            getDrawingVerticalLine: (v) => FlLine(color: Colors.white.withOpacity(0.06), strokeWidth: 1),
          ),
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true, interval: 6,
                getTitlesWidget: (v, _) => Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(_hourLabel(v), style: NuText.body(size: 10, w: FontWeight.w600, c: Colors.white.withOpacity(0.6))),
                ),
                reservedSize: 22,
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true, interval: 60,
                getTitlesWidget: (v, _) => Text('${v.toInt()}',
                    style: NuText.body(size: 10, w: FontWeight.w600, c: Colors.white.withOpacity(0.55))),
                reservedSize: 26,
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          rangeAnnotations: RangeAnnotations(
            horizontalRangeAnnotations: [
              HorizontalRangeAnnotation(
                y1: 70, y2: 180,
                color: NuColors.emerald500.withOpacity(0.10),
              ),
            ],
          ),
          extraLinesData: ExtraLinesData(
            horizontalLines: [
              HorizontalLine(
                y: 70,
                color: NuColors.emerald400.withOpacity(0.45),
                strokeWidth: 1, dashArray: [5, 4],
              ),
              HorizontalLine(
                y: 180,
                color: NuColors.emerald400.withOpacity(0.45),
                strokeWidth: 1, dashArray: [5, 4],
              ),
            ],
          ),
          lineTouchData: LineTouchData(
            handleBuiltInTouches: true,
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
                '${s.y.toInt()} mg/dL\n${_hourLabel(s.x)}',
                NuText.body(size: 11, w: FontWeight.w800),
              )).toList(),
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true, curveSmoothness: 0.28,
              barWidth: 2.2,
              color: NuColors.violet300,
              gradient: const LinearGradient(
                colors: [NuColors.violet300, NuColors.violet600],
              ),
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [
                    NuColors.violet600.withOpacity(0.25),
                    NuColors.violet600.withOpacity(0.02),
                  ],
                ),
              ),
            ),
            // Annotation overlay — one "bar" per kind so we get colored dots at events.
            ..._annotationLayers(anchor),
          ],
        ),
      ),
    );
  }

  List<LineChartBarData> _annotationLayers(DateTime anchor) {
    // Colors per annotation kind.
    const colors = <String, Color>{
      'meal':       NuColors.amber400,
      'activity':   NuColors.emerald400,
      'hydration':  NuColors.sky400,
      'medication': NuColors.violet400,
      'sleep':      Color(0xFF818CF8),
    };

    // Build one spot per annotation, sampling nearest reading for the y-value.
    return colors.entries.map((entry) {
      final kind = entry.key;
      final color = entry.value;
      final spots = day.annotations
          .where((a) => a.kind == kind)
          .map((a) {
            final hr = a.t.difference(anchor).inMinutes / 60.0;
            final nearest = _nearestReading(a.t);
            return FlSpot(hr, nearest.mgdl);
          })
          .toList();
      if (spots.isEmpty) return null;
      return LineChartBarData(
        spots: spots,
        barWidth: 0, isCurved: false, color: Colors.transparent,
        dotData: FlDotData(
          show: true,
          getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
            radius: 6, color: color, strokeColor: Colors.white, strokeWidth: 1.6,
          ),
        ),
      );
    }).whereType<LineChartBarData>().toList();
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
