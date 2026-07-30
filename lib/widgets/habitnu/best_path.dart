import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import 'gold_card.dart';

/// Today's Best Path — hero card with gold glossy border, then checklist,
/// then CTA row and "why this plan" explainer.
class BestPathCard extends StatefulWidget {
  final String pathName;
  final String focusLine;
  final List<BestPathItem> items;
  final String whyExplanation;
  final IconData headerIcon;
  final VoidCallback? onChangePath;

  const BestPathCard({
    super.key,
    required this.pathName,
    required this.focusLine,
    required this.items,
    required this.whyExplanation,
    this.headerIcon = Icons.directions_run_rounded,
    this.onChangePath,
  });

  @override
  State<BestPathCard> createState() => _BestPathCardState();
}

class _BestPathCardState extends State<BestPathCard> {
  bool _committed = false;
  final Set<int> _checked = {};

  @override
  Widget build(BuildContext context) {
    return GoldCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Eyebrow row — no more collision, single line each.
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("TODAY'S BEST PATH",
                  style: HText.eyebrow(c: HColors.brandBlue).copyWith(fontSize: 10)),
              Text('THE PLAN',
                  style: HText.eyebrow(c: HColors.brandBlue).copyWith(fontSize: 10)),
            ],
          ),
          const SizedBox(height: 8),
          // Title row: icon + name
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: HColors.brandBlue.withOpacity(0.10),
                ),
                alignment: Alignment.center,
                child: Icon(widget.headerIcon, size: 24, color: HColors.brandBlue),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(widget.pathName,
                        style: HText.body(size: 22, w: FontWeight.w900, c: HColors.ink)),
                    const SizedBox(height: 2),
                    Text(widget.focusLine,
                        style: HText.body(
                            size: 12, w: FontWeight.w500, c: HColors.inkMuted)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Checklist
          ...List.generate(widget.items.length, (i) {
            final it = widget.items[i];
            final on = _checked.contains(i);
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(it.icon, size: 20, color: HColors.ink.withOpacity(0.78)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(it.label,
                        style: HText.body(size: 13.5, w: FontWeight.w600, c: HColors.ink)),
                  ),
                  GestureDetector(
                    onTap: () => setState(() =>
                        on ? _checked.remove(i) : _checked.add(i)),
                    child: Container(
                      width: 22, height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: on ? HColors.success : HColors.line,
                            width: 2),
                        color: on ? HColors.success : Colors.transparent,
                      ),
                      child: on
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : null,
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 14),
          // CTA row + why on right
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _CommitButton(
                      committed: _committed,
                      onCommit: () => setState(() => _committed = true),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: widget.onChangePath,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        side: const BorderSide(color: HColors.line),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('Change Path',
                          style: HText.body(size: 13, w: FontWeight.w800, c: HColors.ink)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 4,
                child: Container(
                  padding: const EdgeInsets.all(11),
                  decoration: BoxDecoration(
                    color: HColors.brandBlue.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: HColors.brandBlue.withOpacity(0.12)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.star_border_rounded,
                              size: 15, color: HColors.brandBlue),
                          const SizedBox(width: 4),
                          Text('Why this plan?',
                              style: HText.body(
                                  size: 12, w: FontWeight.w900, c: HColors.brandBlue)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(widget.whyExplanation,
                          style: HText.body(
                              size: 11.5, w: FontWeight.w500, c: HColors.ink.withOpacity(0.78))),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class BestPathItem {
  final String label;
  final IconData icon;
  const BestPathItem({required this.label, required this.icon});
}

class _CommitButton extends StatelessWidget {
  final bool committed;
  final VoidCallback onCommit;
  const _CommitButton({required this.committed, required this.onCommit});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: committed
              ? const [Color(0xFF10B981), Color(0xFF059669)]
              : const [Color(0xFF6366F1), Color(0xFF2F30E5)],
        ),
        boxShadow: [
          BoxShadow(
            color: (committed ? const Color(0xFF059669) : HColors.brandBlue)
                .withOpacity(0.35),
            blurRadius: 10, offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: committed ? null : onCommit,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 11),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(committed ? Icons.check_circle_rounded : Icons.check_rounded,
                    size: 18, color: Colors.white),
                const SizedBox(width: 6),
                Text(committed ? 'Committed' : "I'm In",
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Ribbon shown right below the Best Path card summarizing today's commitment.
class CommitmentRibbon extends StatelessWidget {
  final String commitment;
  final String targetTime;
  const CommitmentRibbon({
    super.key,
    required this.commitment,
    required this.targetTime,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: HColors.success.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Icon(Icons.track_changes_rounded, size: 16, color: HColors.success),
          const SizedBox(width: 6),
          Text("TODAY'S COMMITMENT",
              style: HText.eyebrow(c: HColors.success).copyWith(fontSize: 10)),
          const SizedBox(width: 10),
          Icon(Icons.check_circle_rounded, size: 14, color: HColors.success),
          const SizedBox(width: 4),
          Expanded(
            child: Text(commitment,
                style: HText.body(size: 12, w: FontWeight.w700, c: HColors.ink),
                overflow: TextOverflow.ellipsis),
          ),
          Icon(Icons.access_time_rounded, size: 14, color: HColors.inkMuted),
          const SizedBox(width: 3),
          Text(targetTime,
              style: HText.body(size: 12, w: FontWeight.w800, c: HColors.ink)),
        ],
      ),
    );
  }
}
