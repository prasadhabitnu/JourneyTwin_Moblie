import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models/agp.dart';

/// Ambulatory Glucose Profile — 14-day overlay showing p10/p25/p50/p75/p90
/// bands for each 15-minute bin of a 24-hour day. Reveals when highs/lows
/// tend to happen across the whole two-week window.
class AgpOverlay extends StatelessWidget {
  final List<AgpBin> bins;
  final double height;

  const AgpOverlay({super.key, required this.bins, this.height = 200});

  @override
  Widget build(BuildContext context) {
    if (bins.isEmpty) {
      return SizedBox(height: height, child: Center(child: Text('No AGP data', style: NuText.body(c: Colors.white54))));
    }

    List<FlSpot> _spots(double Function(AgpBin) sel) =>
        bins.map((b) => FlSpot(b.hour, sel(b))).toList();

    final p10 = _spots((b) => b.p10);
    final p25 = _spots((b) => b.p25);
    final p50 = _spots((b) => b.p50);
    final p75 = _spots((b) => b.p75);
    final p90 = _spots((b) => b.p90);

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          minX: 0, maxX: 24, minY: 40, maxY: 260,
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
                color: NuColors.emerald500.withOpacity(0.08),
              ),
            ],
          ),
          lineTouchData: const LineTouchData(enabled: false),
          lineBarsData: [
            // p90 outline (upper)
            _line(p90, NuColors.violet400.withOpacity(0.25), 1),
            // p75 outline
            _line(p75, NuColors.violet400.withOpacity(0.5), 1.2),
            // p50 median — highlighted
            _line(p50, NuColors.violet300, 2.5, filled: true),
            // p25 outline
            _line(p25, NuColors.violet400.withOpacity(0.5), 1.2),
            // p10 outline (lower)
            _line(p10, NuColors.violet400.withOpacity(0.25), 1),
          ],
        ),
      ),
    );
  }

  static LineChartBarData _line(List<FlSpot> spots, Color color, double width, {bool filled = false}) {
    return LineChartBarData(
      spots: spots,
      isCurved: true, curveSmoothness: 0.28,
      barWidth: width,
      color: color,
      dotData: const FlDotData(show: false),
      belowBarData: filled
          ? BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [color.withOpacity(0.25), color.withOpacity(0.02)],
              ),
            )
          : BarAreaData(show: false),
    );
  }

  static String _hourLabel(double h) {
    final hh = h.floor();
    if (hh == 0) return '12a';
    if (hh == 12) return '12p';
    if (hh < 12) return '${hh}a';
    return '${hh - 12}p';
  }
}
