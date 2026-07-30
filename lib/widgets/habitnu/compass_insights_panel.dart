import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/compass.dart';

/// The right-hand panel next to the Health Compass. Swaps content based on
/// which segment is selected.
class CompassInsightsPanel extends StatelessWidget {
  final HCompass segment;
  final CompassInsight? insight;
  final ValueChanged<String> onAction;
  const CompassInsightsPanel({
    super.key,
    required this.segment,
    required this.insight,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final title = '${segment.label.toUpperCase()} INSIGHTS';
    final noticed = insight?.noticed ?? const <String>[];
    final recommends = insight?.recommends ?? const <String>[];
    final actions = insight?.actions ?? const <String>[];

    return Container(
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
              Text(title,
                  style: HText.eyebrow(c: HColors.brandBlue)),
              const Spacer(),
              Icon(Icons.info_outline_rounded,
                  size: 15, color: HColors.inkMuted),
            ],
          ),
          const SizedBox(height: 12),
          _NoticedBlock(items: noticed),
          const SizedBox(height: 12),
          const Divider(height: 1, color: HColors.line),
          const SizedBox(height: 12),
          _RecommendsBlock(items: recommends),
          const SizedBox(height: 12),
          _ActionGrid(actions: actions, onAction: onAction),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 30),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Row(
              children: [
                Text('View all ${segment.label.toLowerCase()} insights',
                    style: HText.body(size: 12, w: FontWeight.w800, c: HColors.brandBlue)),
                Icon(Icons.chevron_right_rounded,
                    size: 16, color: HColors.brandBlue),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NoticedBlock extends StatelessWidget {
  final List<String> items;
  const _NoticedBlock({required this.items});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.remove_red_eye_outlined,
                size: 15, color: HColors.brandBlue),
            const SizedBox(width: 5),
            Text('NU NOTICED',
                style: HText.eyebrow(c: HColors.brandBlue).copyWith(fontSize: 11)),
          ],
        ),
        const SizedBox(height: 8),
        ...items.map((s) => _bulletRow(s)),
      ],
    );
  }
}

class _RecommendsBlock extends StatelessWidget {
  final List<String> items;
  const _RecommendsBlock({required this.items});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('💡', style: TextStyle(fontSize: 14)),
            const SizedBox(width: 4),
            Text('NU RECOMMENDS',
                style: HText.eyebrow(c: HColors.danger).copyWith(fontSize: 11)),
          ],
        ),
        const SizedBox(height: 8),
        ...items.map((s) => _bulletRow(s)),
      ],
    );
  }
}

Widget _bulletRow(String s) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 6, right: 8),
            child: Container(
              width: 4, height: 4,
              decoration: const BoxDecoration(
                color: HColors.ink,
                shape: BoxShape.circle,
              ),
            ),
          ),
          Expanded(
            child: Text(s,
                style: HText.body(size: 12, w: FontWeight.w500, c: HColors.ink)),
          ),
        ],
      ),
    );

class _ActionGrid extends StatelessWidget {
  final List<String> actions;
  final ValueChanged<String> onAction;
  const _ActionGrid({required this.actions, required this.onAction});

  static const _meta = <String, ({String label, IconData icon})>{
    'snap-meal':      (label: 'Snap Meal',    icon: Icons.photo_camera_outlined),
    'log-meal':       (label: 'Log Meal',     icon: Icons.restaurant_outlined),
    'ask-nu':         (label: 'Ask Nu',       icon: Icons.mic_none_rounded),
    'why-this-helps': (label: 'Why this helps?', icon: Icons.menu_book_outlined),
    'log-activity':   (label: 'Log Activity', icon: Icons.directions_run_outlined),
    'set-reminder':   (label: 'Set Reminder', icon: Icons.notifications_active_outlined),
    'log-sleep':      (label: 'Log Sleep',    icon: Icons.nightlight_outlined),
    'log-stress':     (label: 'Log Stress',   icon: Icons.spa_outlined),
    'start-breath':   (label: 'Breathe',      icon: Icons.air_rounded),
    'log-water':      (label: 'Log Water',    icon: Icons.local_drink_outlined),
    'log-mood':       (label: 'Log Mood',     icon: Icons.mood_outlined),
    'start-journal':  (label: 'Journal',      icon: Icons.edit_note_rounded),
    'log-weight':     (label: 'Log Weight',   icon: Icons.monitor_weight_outlined),
    'view-trend':     (label: 'View Trend',   icon: Icons.trending_up_rounded),
  };

  @override
  Widget build(BuildContext context) {
    final chunks = <List<String>>[];
    for (int i = 0; i < actions.length; i += 2) {
      chunks.add(actions.sublist(i, (i + 2).clamp(0, actions.length)));
    }
    return Column(
      children: chunks.map((row) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Row(
            children: [
              for (int i = 0; i < row.length; i++) ...[
                if (i > 0) const SizedBox(width: 8),
                Expanded(child: _pill(row[i])),
              ],
              if (row.length == 1) ...[
                const SizedBox(width: 8),
                const Expanded(child: SizedBox.shrink()),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _pill(String key) {
    final meta = _meta[key] ?? (label: key, icon: Icons.help_outline);
    return GestureDetector(
      onTap: () => onAction(key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        decoration: BoxDecoration(
          color: HColors.surfaceMuted,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: HColors.line),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(meta.icon, size: 14, color: HColors.ink),
            const SizedBox(width: 5),
            Flexible(
              child: Text(meta.label,
                  overflow: TextOverflow.ellipsis,
                  style: HText.body(size: 11, w: FontWeight.w700, c: HColors.ink)),
            ),
          ],
        ),
      ),
    );
  }
}
