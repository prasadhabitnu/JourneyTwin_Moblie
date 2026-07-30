import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models/cgm.dart';

/// Horizontal 14-day chip strip. Tap to select. Tint reflects that day's TIR.
class DaySelector extends StatefulWidget {
  final List<DayStats> days;
  final int selectedIndex;
  final ValueChanged<int> onSelect;

  const DaySelector({
    super.key,
    required this.days,
    required this.selectedIndex,
    required this.onSelect,
  });

  @override
  State<DaySelector> createState() => _DaySelectorState();
}

class _DaySelectorState extends State<DaySelector> {
  late final ScrollController _sc;

  @override
  void initState() {
    super.initState();
    _sc = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Scroll to selected item on mount.
      if (_sc.hasClients) {
        _sc.animateTo(widget.selectedIndex * 66.0,
            duration: const Duration(milliseconds: 300), curve: Curves.easeOutCubic);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: ListView.builder(
        controller: _sc,
        scrollDirection: Axis.horizontal,
        itemCount: widget.days.length,
        itemBuilder: (context, i) {
          final d = widget.days[i];
          final selected = i == widget.selectedIndex;
          final pct = (d.tir * 100).round();
          final tint = pct >= 80 ? NuColors.emerald500 : pct >= 65 ? NuColors.amber400 : NuColors.rose400;
          return GestureDetector(
            onTap: () => widget.onSelect(i),
            child: Container(
              width: 60,
              margin: const EdgeInsets.symmetric(horizontal: 3, vertical: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                gradient: selected
                    ? LinearGradient(
                        begin: Alignment.topCenter, end: Alignment.bottomCenter,
                        colors: [tint.withOpacity(0.35), tint.withOpacity(0.10)],
                      )
                    : null,
                color: selected ? null : Colors.white.withOpacity(0.04),
                border: Border.all(
                  color: selected ? tint : Colors.white.withOpacity(0.08),
                  width: selected ? 1.5 : 1,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_short(d.label), style: NuText.body(size: 10, w: FontWeight.w600, c: Colors.white.withOpacity(0.65))),
                  const SizedBox(height: 2),
                  Text('$pct%', style: NuText.body(size: 14, w: FontWeight.w900, c: tint)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _short(String label) {
    // "Wed, Jul 1" → "Jul 1"
    final comma = label.indexOf(',');
    if (comma < 0) return label;
    return label.substring(comma + 1).trim();
  }
}
