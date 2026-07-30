import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import 'best_path.dart';

/// A "playbook" the user can switch to via the Change Path bottom sheet.
class PathOption {
  final String id;
  final String name;
  final String focusLine;
  final String whyExplanation;
  final IconData headerIcon;
  final List<BestPathItem> items;
  final int matchStrength; // 0..100

  const PathOption({
    required this.id,
    required this.name,
    required this.focusLine,
    required this.whyExplanation,
    required this.headerIcon,
    required this.items,
    required this.matchStrength,
  });
}

/// Sally's five available playbooks — mirrors the Nu Success Profiles.
final List<PathOption> kPathOptions = [
  PathOption(
    id: 'long-walker',
    name: 'The Long Walker',
    focusLine: 'Focus: protect your glucose after meals.',
    whyExplanation:
        'Days with walks after dinner and protein-first meals show your best glucose recovery.',
    headerIcon: Icons.directions_run_rounded,
    matchStrength: 100,
    items: const [
      BestPathItem(label: 'Walk 20 min after dinner',  icon: Icons.directions_walk_rounded),
      BestPathItem(label: 'Protein-first meals',        icon: Icons.restaurant_rounded),
      BestPathItem(label: 'Drink 8 glasses of water',   icon: Icons.local_drink_rounded),
      BestPathItem(label: 'Aim for 7+ hours of sleep',  icon: Icons.nightlight_rounded),
    ],
  ),
  PathOption(
    id: 'splitter',
    name: 'The Splitter',
    focusLine: 'Focus: two short walks a day beat one long one.',
    whyExplanation:
        'Your lunch spikes drop 40% when you take a 10-minute walk right after eating.',
    headerIcon: Icons.timer_outlined,
    matchStrength: 92,
    items: const [
      BestPathItem(label: 'Post-lunch 10-min walk',      icon: Icons.directions_walk_rounded),
      BestPathItem(label: 'Post-dinner 25-min walk',     icon: Icons.directions_run_rounded),
      BestPathItem(label: 'Portion-controlled carbs',    icon: Icons.pie_chart_outline_rounded),
      BestPathItem(label: 'Log both walks',              icon: Icons.check_circle_outline_rounded),
    ],
  ),
  PathOption(
    id: 'fiber-forward',
    name: 'The Fiber-Forward',
    focusLine: 'Focus: veggies + fiber pace your glucose curve.',
    whyExplanation:
        'On high-fiber days, your glucose swings are 30% smaller across the whole afternoon.',
    headerIcon: Icons.eco_rounded,
    matchStrength: 88,
    items: const [
      BestPathItem(label: 'Half plate of veggies',       icon: Icons.local_florist_rounded),
      BestPathItem(label: '30+ grams fiber daily',        icon: Icons.grass_rounded),
      BestPathItem(label: 'Eat veggies before starches',  icon: Icons.trending_flat_rounded),
      BestPathItem(label: 'Whole grains only',            icon: Icons.spa_rounded),
    ],
  ),
  PathOption(
    id: 'protein-anchored',
    name: 'The Protein-Anchored',
    focusLine: 'Focus: 25-30g protein per meal keeps you steady.',
    whyExplanation:
        'Protein-first breakfasts correlate with 15% flatter morning glucose curves.',
    headerIcon: Icons.restaurant_menu_rounded,
    matchStrength: 85,
    items: const [
      BestPathItem(label: '25-30g protein per meal',     icon: Icons.set_meal_rounded),
      BestPathItem(label: 'Protein at breakfast',         icon: Icons.egg_alt_rounded),
      BestPathItem(label: 'Lean sources: chicken, fish',  icon: Icons.food_bank_rounded),
      BestPathItem(label: 'Legumes for plant-forward',    icon: Icons.grass_rounded),
    ],
  ),
  PathOption(
    id: 'hydration-champion',
    name: 'The Hydration Champion',
    focusLine: 'Focus: 8+ glasses a day flattens your curve.',
    whyExplanation:
        'Well-hydrated days show 15% lower glucose variability across every meal.',
    headerIcon: Icons.water_drop_rounded,
    matchStrength: 82,
    items: const [
      BestPathItem(label: '8+ glasses of water',          icon: Icons.local_drink_rounded),
      BestPathItem(label: '2 glasses before lunch',       icon: Icons.wb_sunny_outlined),
      BestPathItem(label: 'Herbal tea counts',            icon: Icons.emoji_food_beverage_rounded),
      BestPathItem(label: 'Log every glass',              icon: Icons.check_circle_outline_rounded),
    ],
  ),
];

Future<PathOption?> showChangePathSheet(BuildContext context, String currentId) async {
  return showModalBottomSheet<PathOption>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      return DraggableScrollableSheet(
        initialChildSize: 0.72,
        minChildSize: 0.5,
        maxChildSize: 0.92,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: HColors.bg,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 8, bottom: 4),
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: HColors.line,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Choose your path',
                                style: HText.body(size: 20, w: FontWeight.w900, c: HColors.ink)),
                            const SizedBox(height: 3),
                            Text('Nu ranked these by fit to your last 14 days.',
                                style: HText.body(size: 12, w: FontWeight.w500, c: HColors.inkMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    controller: scrollController,
                    padding: const EdgeInsets.only(bottom: 24),
                    itemCount: kPathOptions.length,
                    itemBuilder: (context, i) {
                      final p = kPathOptions[i];
                      return _PathRow(
                        option: p,
                        selected: p.id == currentId,
                        onTap: () => Navigator.of(ctx).pop(p),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

class _PathRow extends StatelessWidget {
  final PathOption option;
  final bool selected;
  final VoidCallback onTap;
  const _PathRow({required this.option, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      child: Material(
        color: HColors.surface,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: selected ? HColors.brandBlue : HColors.line,
                width: selected ? 2 : 1,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42, height: 42,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: HColors.brandBlue.withOpacity(0.10),
                  ),
                  child: Icon(option.headerIcon,
                      color: HColors.brandBlue, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(option.name,
                                style: HText.body(size: 15, w: FontWeight.w900, c: HColors.ink)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: _matchTint(option.matchStrength).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: _matchTint(option.matchStrength).withOpacity(0.5)),
                            ),
                            child: Text('${option.matchStrength}% match',
                                style: HText.body(size: 10, w: FontWeight.w900, c: _matchTint(option.matchStrength))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(option.focusLine,
                          style: HText.body(size: 12, w: FontWeight.w500, c: HColors.inkMuted)),
                      const SizedBox(height: 6),
                      Text(option.whyExplanation,
                          style: HText.body(size: 11, w: FontWeight.w500, c: HColors.ink.withOpacity(0.72))),
                      if (selected) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.check_circle_rounded,
                                size: 14, color: HColors.brandBlue),
                            const SizedBox(width: 4),
                            Text('Current path',
                                style: HText.body(size: 11, w: FontWeight.w900, c: HColors.brandBlue)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _matchTint(int m) {
    if (m >= 90) return HColors.success;
    if (m >= 80) return HColors.warning;
    return HColors.danger;
  }
}
