import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../voice/planets.dart';
import '../widgets/nu_frame.dart';

/// Shown for planets not yet built in this POC. Explains what will live
/// here in v2 so reviewers see the vision without a broken tap.
class StubScreen extends StatelessWidget {
  final Planet planet;
  const StubScreen({super.key, required this.planet});

  @override
  Widget build(BuildContext context) {
    return NuFrame(
      title: planet.name,
      showBack: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 30),
            Text(planet.emoji, style: const TextStyle(fontSize: 80)),
            const SizedBox(height: 18),
            Text(planet.name, style: NuText.body(size: 30, w: FontWeight.w900)),
            const SizedBox(height: 10),
            Text(
              'This planet is coming in v2.',
              style: NuText.body(size: 15, w: FontWeight.w600, c: planet.toneColor),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: Colors.white.withOpacity(0.05),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('What lives here', style: NuText.eyebrow()),
                  const SizedBox(height: 10),
                  Text(_summaryFor(planet.slug), style: NuText.body(size: 13, c: Colors.white.withOpacity(0.85))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _summaryFor(String slug) {
    switch (slug) {
      case 'journey':
        return 'Your 13-week timeline — every session, every milestone, every graph. Voice-navigate to any week. Ask Nu what shifted between week 4 and week 9.';
      case 'coach':
        return 'Direct line to your coach. Voice or text. Session notes on demand. Nu turns your last conversation into next steps you can act on.';
      case 'care-circle':
        return 'The 3 people you\'ve invited to walk with you. Share wins, ask for support, and let them cheer the graph. Nu keeps them in the loop without leaking anything private.';
      case 'learn':
        return 'Tiny lessons — 90-second audio explainers, single-swipe reads. Curated to what you\'re dealing with right now.';
      case 'rewards':
        return 'Health Credits, badges, tier progress. Real perks — pharmacy discounts, credits toward CGM sensor replacements, wellness gift cards. Nu\'s Universe rewards persistence.';
      case 'progress':
        return 'The long view. Month-over-month TIR, weight, mood. Where you\'ve been. Where you\'re heading.';
      default:
        return 'Content will appear here in v2.';
    }
  }
}
