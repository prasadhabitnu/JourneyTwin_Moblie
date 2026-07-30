import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/daily_metrics.dart';

/// Twin bottom row — Momentum mini-chart + Weight gauge.
class MomentumWeightRow extends StatelessWidget {
  final List<DailyMetric> daily;
  final double goalWeight;
  const MomentumWeightRow({
    super.key,
    required this.daily,
    this.goalWeight = 170,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(child: _MomentumCard(daily: daily)),
          const SizedBox(width: 12),
          Expanded(child: _WeightCard(daily: daily, goal: goalWeight)),
        ],
      ),
    );
  }
}

class _MomentumCard extends StatelessWidget {
  final List<DailyMetric> daily;
  const _MomentumCard({required this.daily});

  @override
  Widget build(BuildContext context) {
    final spots = <FlSpot>[];
    for (int i = 0; i < daily.length; i++) {
      spots.add(FlSpot(i.toDouble(), daily[i].momentum.toDouble()));
    }
    return Container(
      padding: const EdgeInsets.all(12),
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
              Text('MOMENTUM',
                  style: HText.eyebrow(c: HColors.brandBlue)),
              const SizedBox(width: 3),
              Icon(Icons.trending_up_rounded, size: 12, color: HColors.brandBlue),
            ],
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 60,
            child: spots.isEmpty
                ? const SizedBox.shrink()
                : LineChart(
                    LineChartData(
                      minY: 40, maxY: 100,
                      titlesData: const FlTitlesData(show: false),
                      gridData: const FlGridData(show: false),
                      borderData: FlBorderData(show: false),
                      lineTouchData: const LineTouchData(enabled: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: spots,
                          isCurved: true, curveSmoothness: 0.25,
                          barWidth: 2.2,
                          color: HColors.brandBlue,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, _, __, ___) => FlDotCirclePainter(
                              radius: 2.5,
                              color: HColors.brandBlue,
                              strokeWidth: 0,
                            ),
                          ),
                          belowBarData: BarAreaData(
                            show: true,
                            gradient: LinearGradient(
                              begin: Alignment.topCenter, end: Alignment.bottomCenter,
                              colors: [
                                HColors.brandBlue.withOpacity(0.20),
                                HColors.brandBlue.withOpacity(0.02),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('4',
                  style: HText.body(size: 22, w: FontWeight.w900, c: HColors.ink)),
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Text('/5',
                    style: HText.body(size: 12, w: FontWeight.w800, c: HColors.inkMuted)),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text('Great progress\nthis week!',
                    style: HText.body(size: 10.5, w: FontWeight.w600, c: HColors.ink)),
              ),
            ],
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: const Size(0, 26),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap),
            child: Row(
              children: [
                Text('View details',
                    style: HText.body(size: 11, w: FontWeight.w800, c: HColors.brandBlue)),
                Icon(Icons.chevron_right_rounded, size: 14, color: HColors.brandBlue),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WeightCard extends StatelessWidget {
  final List<DailyMetric> daily;
  final double goal;
  const _WeightCard({required this.daily, required this.goal});

  @override
  Widget build(BuildContext context) {
    final start = daily.isNotEmpty ? daily.first.weight : 185.0;
    final current = daily.isNotEmpty ? daily.last.weight : 178.0;
    final lostPct = start == 0 ? 0 : ((start - current) / start) * 100;
    final leftToGoal = (current - goal).clamp(0, 999).round();

    return Container(
      padding: const EdgeInsets.all(12),
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
              Text('WEIGHT',
                  style: HText.eyebrow(c: HColors.brandBlue)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 60, height: 60,
                child: CustomPaint(
                  painter: _WeightGaugePainter(
                    startWeight: start, current: current, goal: goal,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${current.toStringAsFixed(0)}',
                        style: HText.body(size: 22, w: FontWeight.w900, c: HColors.ink)),
                    Text('lbs',
                        style: HText.body(size: 10, w: FontWeight.w700, c: HColors.inkMuted)),
                    Text('Goal: ${goal.toStringAsFixed(0)} lbs',
                        style: HText.body(size: 10, w: FontWeight.w600, c: HColors.inkMuted)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.star_rounded, size: 14, color: HColors.warning),
              const SizedBox(width: 4),
              Expanded(
                child: Text('$leftToGoal lbs left to goal',
                    style: HText.body(size: 11, w: FontWeight.w800, c: HColors.ink)),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Icon(Icons.arrow_downward_rounded, size: 12, color: HColors.success),
              const SizedBox(width: 3),
              Text('${lostPct.toStringAsFixed(0)}% total',
                  style: HText.body(size: 11, w: FontWeight.w800, c: HColors.success)),
              const SizedBox(width: 4),
              Expanded(
                child: Text('body weight lost',
                    overflow: TextOverflow.ellipsis,
                    style: HText.body(size: 10.5, w: FontWeight.w600, c: HColors.inkMuted)),
              ),
            ],
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 26),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Row(
              children: [
                Text('View trend',
                    style: HText.body(size: 11, w: FontWeight.w800, c: HColors.brandBlue)),
                Icon(Icons.chevron_right_rounded, size: 14, color: HColors.brandBlue),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WeightGaugePainter extends CustomPainter {
  final double startWeight;
  final double current;
  final double goal;
  _WeightGaugePainter({required this.startWeight, required this.current, required this.goal});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromCircle(
        center: size.center(Offset.zero), radius: size.width / 2 - 6);
    final start = pi; // west
    final sweep = pi; // west -> east half-circle

    // Track
    final track = Paint()
      ..color = HColors.line
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(rect, start, sweep, false, track);

    // Progress: fraction of the (startWeight -> goal) journey completed.
    final total = (startWeight - goal).abs();
    final progress = total == 0 ? 0.0 :
        ((startWeight - current) / total).clamp(0.0, 1.0);
    final prog = Paint()
      ..color = HColors.success
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(rect, start, sweep * progress, false, prog);
  }

  @override
  bool shouldRepaint(covariant _WeightGaugePainter old) =>
      old.current != current || old.goal != goal || old.startWeight != startWeight;
}
