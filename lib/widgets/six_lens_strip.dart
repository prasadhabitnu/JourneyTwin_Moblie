import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models/lens.dart';

/// Horizontal 6-tab lens selector. Below it, the insight panel for the
/// currently selected lens (headline + bullets).
class SixLensStrip extends StatefulWidget {
  final Map<CgmLens, LensInsight> insights;
  final ValueChanged<CgmLens>? onLensChanged;

  const SixLensStrip({super.key, required this.insights, this.onLensChanged});

  @override
  State<SixLensStrip> createState() => _SixLensStripState();
}

class _SixLensStripState extends State<SixLensStrip> {
  CgmLens _selected = CgmLens.defaultLens;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: CgmLens.values.map((l) {
              final active = l == _selected;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(
                  onTap: () {
                    setState(() => _selected = l);
                    widget.onLensChanged?.call(l);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: active
                          ? NuColors.violet600.withOpacity(0.35)
                          : Colors.white.withOpacity(0.05),
                      border: Border.all(
                        color: active
                            ? NuColors.violet400.withOpacity(0.55)
                            : Colors.white.withOpacity(0.08),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l.label,
                          style: NuText.body(
                            size: 11, w: FontWeight.w900,
                            c: active ? Colors.white : Colors.white.withOpacity(0.75),
                          ),
                        ),
                        Text(
                          l.question,
                          style: NuText.body(
                            size: 9, w: FontWeight.w500,
                            c: active ? NuColors.violet300 : Colors.white.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 10),
        _InsightPanel(insight: widget.insights[_selected]),
      ],
    );
  }
}

class _InsightPanel extends StatelessWidget {
  final LensInsight? insight;
  const _InsightPanel({required this.insight});

  @override
  Widget build(BuildContext context) {
    if (insight == null) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.white.withOpacity(0.04),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Text('No insight for this lens.', style: NuText.body(size: 12, c: Colors.white.withOpacity(0.7))),
      );
    }
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 220),
      switchInCurve: Curves.easeOutCubic,
      child: Container(
        key: ValueKey(insight!.lens),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [
              NuColors.violet900.withOpacity(0.4),
              NuColors.spaceIndigo.withOpacity(0.3),
            ],
          ),
          border: Border.all(color: NuColors.violet400.withOpacity(0.25)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(insight!.headline, style: NuText.body(size: 14, w: FontWeight.w900)),
            const SizedBox(height: 8),
            ...insight!.bullets.map((b) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 5, right: 8),
                        child: Container(
                          width: 5, height: 5,
                          decoration: const BoxDecoration(
                            color: NuColors.violet300,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(b, style: NuText.body(size: 12, w: FontWeight.w500, c: Colors.white.withOpacity(0.88))),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
