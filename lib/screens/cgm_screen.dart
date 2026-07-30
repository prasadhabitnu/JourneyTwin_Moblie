import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../data/repository/repository.dart';
import '../data/models/cgm.dart';
import '../data/models/agp.dart';
import '../data/models/lens.dart';
import '../voice/dialog_manager.dart';
import '../widgets/nu_frame.dart';
import '../widgets/tir_ring.dart';
import '../widgets/cgm_timeline.dart';
import '../widgets/agp_overlay.dart';
import '../widgets/six_lens_strip.dart';
import '../widgets/day_selector.dart';

/// Full CGM Insights screen.
///
/// Layout (top to bottom):
///   1. Day selector strip (14 days)
///   2. TIR ring hero + numeric side panel
///   3. Six-lens strip
///   4. 24-hour timeline for the selected day
///   5. AGP overlay (14-day)
class CgmScreen extends StatefulWidget {
  const CgmScreen({super.key});

  @override
  State<CgmScreen> createState() => _CgmScreenState();
}

class _CgmScreenState extends State<CgmScreen> {
  int _dayIdx = 13; // Today = last day

  @override
  Widget build(BuildContext context) {
    final repo = context.read<NuRepository>();
    return NuFrame(
      title: 'CGM Insights',
      showBack: true,
      dialogScope: 'cgm',
      dialogTree: kCgmDialog,
      child: FutureBuilder<_CgmBundle>(
        future: _load(repo),
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator(color: NuColors.violet400));
          }
          final b = snap.data!;
          if (b.stream.days.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  'No CGM data bundled yet.\nRun:  npm run export-mock-data',
                  textAlign: TextAlign.center,
                  style: NuText.body(c: Colors.white.withOpacity(0.7)),
                ),
              ),
            );
          }
          final idx = _dayIdx.clamp(0, b.stream.days.length - 1);
          final day = b.stream.days[idx];

          return ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 4),
              DaySelector(
                days: b.stream.days,
                selectedIndex: idx,
                onSelect: (i) => setState(() => _dayIdx = i),
              ),
              const SizedBox(height: 16),
              _HeroRow(day: day),
              const SizedBox(height: 20),
              Text('Nu\'s six-lens read', style: NuText.eyebrow()),
              const SizedBox(height: 8),
              SixLensStrip(insights: b.lenses),
              const SizedBox(height: 22),
              _ChartCard(
                title: '24-hour glucose · ${day.label}',
                subtitle: _dayNarrative(day),
                child: CgmTimeline(day: day),
              ),
              const SizedBox(height: 12),
              _AnnotationLegend(),
              const SizedBox(height: 22),
              _ChartCard(
                title: '14-day AGP overlay',
                subtitle: 'p10 · p25 · median · p75 · p90 across every 15-min bin of the day',
                child: AgpOverlay(bins: b.agp),
              ),
              const SizedBox(height: 20),
              _VoiceHint(),
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }

  Future<_CgmBundle> _load(NuRepository repo) async {
    final results = await Future.wait([
      repo.cgmStream('P100967'),
      repo.agp('P100967'),
      repo.lensInsights('P100967'),
    ]);
    return _CgmBundle(
      stream: results[0] as CgmStream,
      agp: results[1] as List<AgpBin>,
      lenses: results[2] as Map<CgmLens, LensInsight>,
    );
  }

  String _dayNarrative(DayStats d) {
    final pct = (d.tir * 100).round();
    if (pct >= 90) return 'A steady, in-range day. Nu\'s picks worked.';
    if (pct >= 80) return 'Good day overall. One post-meal wobble to note.';
    if (pct >= 65) return 'Mixed. Meals and timing pushed you high.';
    return 'A rocky day. Multiple hours above target.';
  }
}

class _CgmBundle {
  final CgmStream stream;
  final List<AgpBin> agp;
  final Map<CgmLens, LensInsight> lenses;
  _CgmBundle({required this.stream, required this.agp, required this.lenses});
}

class _HeroRow extends StatelessWidget {
  final DayStats day;
  const _HeroRow({required this.day});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        TirRing(
          tir: day.tir,
          timeAbove: day.timeAbove,
          timeBelow: day.timeBelow,
          size: 156,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _stat('Mean glucose', '${day.meanGlucose.toStringAsFixed(0)} mg/dL', NuColors.violet300),
              const SizedBox(height: 8),
              _stat('GMI (est. HbA1c)', '${day.gmi.toStringAsFixed(1)}%', NuColors.sky400),
              const SizedBox(height: 8),
              _stat('Variability (CV)', '${day.cv.toStringAsFixed(1)}%', NuColors.amber400),
              const SizedBox(height: 8),
              _stat('Above / Below', '${(day.timeAbove * 100).round()}% / ${(day.timeBelow * 100).round()}%', NuColors.rose400),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: NuText.eyebrow(c: Colors.white.withOpacity(0.55))),
        Text(value, style: NuText.body(size: 15, w: FontWeight.w900, c: color)),
      ],
    );
  }
}

class _ChartCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;
  const _ChartCard({required this.title, required this.subtitle, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withOpacity(0.04),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: NuText.body(size: 13, w: FontWeight.w900)),
          const SizedBox(height: 2),
          Text(subtitle, style: NuText.body(size: 11, w: FontWeight.w500, c: Colors.white.withOpacity(0.6))),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _AnnotationLegend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = <List<Object>>[
      ['Meals',       NuColors.amber400],
      ['Activity',    NuColors.emerald400],
      ['Hydration',   NuColors.sky400],
      ['Meds',        NuColors.violet400],
      ['Sleep',       const Color(0xFF818CF8)],
    ];
    return Wrap(
      spacing: 12, runSpacing: 6,
      children: items.map((it) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: it[1] as Color)),
          const SizedBox(width: 5),
          Text(it[0] as String, style: NuText.body(size: 10, w: FontWeight.w600, c: Colors.white.withOpacity(0.75))),
        ],
      )).toList(),
    );
  }
}

class _VoiceHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: NuColors.violet900.withOpacity(0.30),
        border: Border.all(color: NuColors.violet400.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ask Nu about your CGM', style: NuText.eyebrow()),
          const SizedBox(height: 8),
          _hintRow('"Whatsup Nu, why did my TIR drop?"'),
          const SizedBox(height: 4),
          _hintRow('"Whatsup Nu, explain AGP"'),
          const SizedBox(height: 4),
          _hintRow('"Whatsup Nu, summary"'),
        ],
      ),
    );
  }

  Widget _hintRow(String text) => Text(text, style: NuText.body(size: 12, w: FontWeight.w600, c: Colors.white.withOpacity(0.85)));
}
