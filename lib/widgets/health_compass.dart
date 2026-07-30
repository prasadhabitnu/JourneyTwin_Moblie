import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Health Compass — 4-quadrant "how am I trending" tile.
/// Body, Mind, Habit, Persistence. Each has a value + trend arrow.
class HealthCompass extends StatelessWidget {
  const HealthCompass({super.key});

  static const _quadrants = [
    _Quad(icon: Icons.monitor_heart_rounded, label: 'Body',       value: '−7.2 kg', trend: '↑ 2.1', color: NuColors.rose400),
    _Quad(icon: Icons.psychology_rounded,    label: 'Mind',       value: 'Steady',  trend: '↑ 4d',  color: NuColors.violet400),
    _Quad(icon: Icons.local_fire_department_rounded, label: 'Habit', value: '13 d', trend: 'streak', color: NuColors.amber400),
    _Quad(icon: Icons.trending_up_rounded,   label: 'Persistence', value: '87%',    trend: '↑ 5 pts', color: NuColors.emerald500),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1E3A8A).withOpacity(0.45),
            NuColors.spaceIndigo.withOpacity(0.4),
          ],
        ),
        border: Border.all(color: const Color(0xFF60A5FA).withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Health Compass', style: NuText.eyebrow(c: const Color(0xFF93C5FD))),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 8, crossAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            children: _quadrants.map((q) => _QuadTile(q: q)).toList(),
          ),
        ],
      ),
    );
  }
}

class _Quad {
  final IconData icon;
  final String label;
  final String value;
  final String trend;
  final Color color;
  const _Quad({required this.icon, required this.label, required this.value, required this.trend, required this.color});
}

class _QuadTile extends StatelessWidget {
  final _Quad q;
  const _QuadTile({required this.q});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Colors.white.withOpacity(0.05),
        border: Border.all(color: q.color.withOpacity(0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: q.color.withOpacity(0.20),
            ),
            child: Icon(q.icon, color: q.color, size: 15),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(q.label, style: NuText.body(size: 9, w: FontWeight.w900, c: q.color)),
                Text(q.value, style: NuText.body(size: 13, w: FontWeight.w900)),
                Text(q.trend, style: NuText.body(size: 9, w: FontWeight.w600, c: Colors.white.withOpacity(0.55))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
