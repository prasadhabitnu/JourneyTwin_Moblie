import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';

/// "Update Me" strip — six circular quick-log buttons.
class UpdateMeStrip extends StatelessWidget {
  final ValueChanged<String> onTap;
  const UpdateMeStrip({super.key, required this.onTap});

  static const _items = <_UpdateItem>[
    _UpdateItem(id: 'food',     label: 'Food',     icon: Icons.restaurant_outlined,    tint: Color(0xFFDFF3D2)),
    _UpdateItem(id: 'weight',   label: 'Weight',   icon: Icons.monitor_weight_outlined, tint: Color(0xFFFEF3C7)),
    _UpdateItem(id: 'activity', label: 'Activity', icon: Icons.directions_run_outlined, tint: Color(0xFFD9E1FF)),
    _UpdateItem(id: 'sleep',    label: 'Sleep',    icon: Icons.nightlight_outlined,     tint: Color(0xFFE0DDF7)),
    _UpdateItem(id: 'water',    label: 'Water',    icon: Icons.local_drink_outlined,    tint: Color(0xFFCFE8FA)),
    _UpdateItem(id: 'stress',   label: 'Stress',   icon: Icons.mood_bad_outlined,       tint: Color(0xFFFDD8E3)),
  ];

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
          Row(
            children: [
              Text('UPDATE ME',
                  style: HText.eyebrow(c: HColors.brandBlue)),
              const Spacer(),
              Text('Tap to log',
                  style: HText.body(size: 10, w: FontWeight.w700, c: HColors.inkMuted)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _items
                .map((it) => _button(it, onTap: () => onTap(it.id)))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _button(_UpdateItem it, {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: it.tint,
              shape: BoxShape.circle,
            ),
            child: Icon(it.icon, size: 20, color: HColors.ink),
          ),
          const SizedBox(height: 4),
          Text(it.label,
              style: HText.body(size: 11, w: FontWeight.w700, c: HColors.ink)),
        ],
      ),
    );
  }
}

class _UpdateItem {
  final String id;
  final String label;
  final IconData icon;
  final Color tint;
  const _UpdateItem({required this.id, required this.label, required this.icon, required this.tint});
}
