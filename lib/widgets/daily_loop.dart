import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Daily Loop — the 5-stage coaching arc from wake to sleep.
/// Each stage is a small card. Active stage (based on time of day) glows.
class DailyLoop extends StatelessWidget {
  final int? activeStageIndex; // 0..4, defaults to computed by wall clock
  const DailyLoop({super.key, this.activeStageIndex});

  static const _stages = [
    _Stage(icon: Icons.wb_sunny_rounded, name: 'Morning brief',    time: '7:00 AM',  detail: 'Yesterday: 88% TIR. Today: Long Walker.',    color: NuColors.amber400),
    _Stage(icon: Icons.restaurant_rounded, name: 'Midday check',   time: '12:30 PM', detail: 'Lunch curve looks in range. Nice.',            color: NuColors.emerald500),
    _Stage(icon: Icons.directions_walk_rounded, name: 'Afternoon nudge', time: '3:00 PM', detail: 'Water — you\'re 3 glasses short of target.', color: NuColors.sky400),
    _Stage(icon: Icons.nightlight_round, name: 'Evening recap',    time: '7:45 PM',  detail: 'Post-dinner walk unlocks Long Walker profile.', color: NuColors.violet400),
    _Stage(icon: Icons.bedtime_rounded,  name: 'Tomorrow setup',   time: '10:30 PM', detail: 'Cooking rice? Half-portion + walk plan is ready.', color: NuColors.rose400),
  ];

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final auto = _autoStage(now);
    final active = activeStageIndex ?? auto;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Daily Loop', style: NuText.eyebrow()),
        const SizedBox(height: 8),
        ..._stages.asMap().entries.map((e) {
          return _StageRow(
            stage: e.value,
            isActive: e.key == active,
            isPast: e.key < active,
            isFirst: e.key == 0,
            isLast: e.key == _stages.length - 1,
          );
        }),
      ],
    );
  }

  int _autoStage(DateTime now) {
    final h = now.hour + now.minute / 60.0;
    if (h < 10) return 0;
    if (h < 13.5) return 1;
    if (h < 18) return 2;
    if (h < 21.5) return 3;
    return 4;
  }
}

class _Stage {
  final IconData icon;
  final String name;
  final String time;
  final String detail;
  final Color color;
  const _Stage({required this.icon, required this.name, required this.time, required this.detail, required this.color});
}

class _StageRow extends StatelessWidget {
  final _Stage stage;
  final bool isActive;
  final bool isPast;
  final bool isFirst;
  final bool isLast;

  const _StageRow({
    required this.stage,
    required this.isActive,
    required this.isPast,
    required this.isFirst,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final tint = isActive ? stage.color : Colors.white.withOpacity(isPast ? 0.35 : 0.25);
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline gutter
          SizedBox(
            width: 34,
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    width: 2,
                    color: isFirst ? Colors.transparent : Colors.white.withOpacity(0.14),
                  ),
                ),
                Container(
                  width: 28, height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive ? stage.color.withOpacity(0.3) : Colors.white.withOpacity(0.06),
                    border: Border.all(color: tint, width: isActive ? 2 : 1),
                    boxShadow: isActive
                        ? [BoxShadow(color: stage.color.withOpacity(0.5), blurRadius: 14, spreadRadius: 1)]
                        : null,
                  ),
                  child: Icon(stage.icon, color: tint, size: 14),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    color: isLast ? Colors.transparent : Colors.white.withOpacity(0.14),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Body
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: isActive
                      ? stage.color.withOpacity(0.10)
                      : Colors.white.withOpacity(0.03),
                  border: Border.all(
                    color: isActive ? stage.color.withOpacity(0.45) : Colors.white.withOpacity(0.06),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(stage.name, style: NuText.body(size: 13, w: FontWeight.w800, c: isActive ? Colors.white : Colors.white.withOpacity(0.75))),
                        const Spacer(),
                        Text(stage.time, style: NuText.body(size: 10, w: FontWeight.w600, c: Colors.white.withOpacity(0.5))),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(stage.detail, style: NuText.body(size: 11, w: FontWeight.w500, c: Colors.white.withOpacity(0.75))),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
