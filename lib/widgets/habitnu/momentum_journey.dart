import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/daily_metrics.dart';
import '../../data/models/social_and_predictions.dart';

/// The right-half chart shown when the Momentum segment is selected — a
/// 14-day trend line with a prediction shaded region.
class MomentumJourneyCard extends StatelessWidget {
  final List<DailyMetric> daily;
  final Prediction? prediction;
  const MomentumJourneyCard({super.key, required this.daily, required this.prediction});

  @override
  Widget build(BuildContext context) {
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
          Text('YOUR MOMENTUM JOURNEY',
              style: HText.eyebrow(c: HColors.brandBlue)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Nu predicts card
              Expanded(
                flex: 3,
                child: _NuPredicts(prediction: prediction),
              ),
              const SizedBox(width: 10),
              // Chart
              Expanded(
                flex: 7,
                child: SizedBox(
                  height: 170,
                  child: _MomentumChart(daily: daily, prediction: prediction),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Center(
            child: TextButton(
              onPressed: () {},
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('View full momentum story',
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
}

class _NuPredicts extends StatelessWidget {
  final Prediction? prediction;
  const _NuPredicts({required this.prediction});
  @override
  Widget build(BuildContext context) {
    final p = prediction;
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: HColors.brandBlue.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('NU PREDICTS',
              style: HText.eyebrow(c: HColors.brandBlue).copyWith(fontSize: 10)),
          const SizedBox(height: 6),
          Text(p?.note ?? 'Predictions unavailable',
              style: HText.body(size: 11, w: FontWeight.w600, c: HColors.ink)),
          const SizedBox(height: 8),
          Text('Momentum',
              style: HText.body(size: 10.5, w: FontWeight.w700, c: HColors.inkMuted)),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('${p?.momentumNow ?? '--'}',
                  style: HText.body(size: 20, w: FontWeight.w900, c: HColors.ink)),
              const SizedBox(width: 3),
              Icon(Icons.arrow_right_alt_rounded,
                  size: 14, color: HColors.inkMuted),
              const SizedBox(width: 3),
              Text('${p?.momentumIn7Days ?? '--'}',
                  style: HText.body(size: 20, w: FontWeight.w900, c: HColors.success)),
            ],
          ),
          Text('Next 7 days',
              style: HText.body(size: 10.5, w: FontWeight.w600, c: HColors.inkMuted)),
        ],
      ),
    );
  }
}

class _MomentumChart extends StatelessWidget {
  final List<DailyMetric> daily;
  final Prediction? prediction;
  const _MomentumChart({required this.daily, required this.prediction});

  @override
  Widget build(BuildContext context) {
    final n = daily.length;
    if (n == 0) return const SizedBox.shrink();

    final actual = <FlSpot>[];
    for (int i = 0; i < n; i++) {
      actual.add(FlSpot(i.toDouble(), daily[i].momentum.toDouble()));
    }
    final projected = <FlSpot>[];
    if (prediction != null) {
      projected.add(actual.last);
      final target = prediction!.momentumIn7Days.toDouble();
      projected.add(FlSpot(n.toDouble() + 6, target));
    }

    // Expected-range bands (a gentle envelope)
    final upper = <FlSpot>[];
    final lower = <FlSpot>[];
    for (int i = 0; i < n; i++) {
      final base = daily[i].momentum.toDouble();
      upper.add(FlSpot(i.toDouble(), (base + 12).clamp(0, 100)));
      lower.add(FlSpot(i.toDouble(), (base - 12).clamp(0, 100)));
    }

    return LineChart(
      LineChartData(
        minY: 0, maxY: 100,
        minX: 0, maxX: (n + 6).toDouble(),
        gridData: FlGridData(
          drawVerticalLine: true,
          horizontalInterval: 25,
          verticalInterval: 3.5,
          getDrawingHorizontalLine: (_) => const FlLine(color: HColors.line, strokeWidth: 0.5),
          getDrawingVerticalLine: (_) => const FlLine(color: HColors.line, strokeWidth: 0.5),
        ),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 3.5,
              reservedSize: 18,
              getTitlesWidget: (v, _) {
                final idx = v.round();
                String label;
                if (idx < n) {
                  label = daily[idx].label.replaceAll(RegExp(r'^\w+ '), '');
                } else if (idx == n + 6) {
                  label = 'Jun 29';
                } else {
                  return const SizedBox.shrink();
                }
                return Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(label,
                      style: HText.body(size: 8.5, w: FontWeight.w600, c: HColors.inkMuted)),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 25,
              reservedSize: 24,
              getTitlesWidget: (v, _) => Text('${v.toInt()}',
                  style: HText.body(size: 8.5, w: FontWeight.w600, c: HColors.inkMuted)),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineTouchData: const LineTouchData(enabled: false),
        rangeAnnotations: RangeAnnotations(verticalRangeAnnotations: [
          if (prediction != null)
            VerticalRangeAnnotation(
              x1: (n - 1).toDouble(),
              x2: (n + 6).toDouble(),
              color: HColors.brandBlue.withOpacity(0.06),
            ),
        ]),
        lineBarsData: [
          // upper band (dashed)
          LineChartBarData(
            spots: upper,
            isCurved: true, curveSmoothness: 0.25,
            barWidth: 1,
            color: HColors.success.withOpacity(0.6),
            dashArray: [4, 4],
            dotData: const FlDotData(show: false),
          ),
          // lower band
          LineChartBarData(
            spots: lower,
            isCurved: true, curveSmoothness: 0.25,
            barWidth: 1,
            color: HColors.success.withOpacity(0.6),
            dashArray: [4, 4],
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: false),
          ),
          // actual (solid)
          LineChartBarData(
            spots: actual,
            isCurved: true, curveSmoothness: 0.25,
            barWidth: 2.5,
            color: HColors.brandBlue,
            dotData: FlDotData(
              show: true,
              getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
                radius: 3,
                color: HColors.brandBlue,
                strokeColor: Colors.white,
                strokeWidth: 1,
              ),
            ),
          ),
          // projected (dashed)
          if (projected.length >= 2)
            LineChartBarData(
              spots: projected,
              isCurved: false,
              barWidth: 2.2,
              color: HColors.brandBlue,
              dashArray: [5, 4],
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
                  radius: 3,
                  color: spot.x == projected.last.x
                      ? HColors.brandBlue
                      : HColors.brandBlue.withOpacity(0.4),
                  strokeColor: Colors.white,
                  strokeWidth: 1,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
