import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../data/repository/repository.dart';
import '../data/models/success_profile.dart';
import '../voice/dialog_manager.dart';
import '../widgets/nu_frame.dart';
import '../widgets/success_profile_carousel.dart';
import '../widgets/daily_loop.dart';
import '../widgets/health_compass.dart';

/// Full Today screen.
///
/// Layout:
///   1. Greeting + week context
///   2. Success Profile carousel (5 archetypes; top = hero gold)
///   3. Health Compass (4 quadrants)
///   4. Daily Loop (5 stages)
///   5. Voice hint
class TodayScreen extends StatelessWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = context.read<NuRepository>();
    return NuFrame(
      title: 'Today',
      showBack: true,
      dialogScope: 'today',
      dialogTree: kTodayDialog,
      child: FutureBuilder<List<SuccessProfile>>(
        future: repo.successProfiles('P100967'),
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator(color: NuColors.violet400));
          }
          final profiles = snap.data!;
          return ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 8),
              _Greeting(),
              const SizedBox(height: 14),
              Text('Your playbook', style: NuText.eyebrow()),
              const SizedBox(height: 6),
              if (profiles.isNotEmpty) SuccessProfileCarousel(profiles: profiles)
              else _EmptyProfileNote(),
              const SizedBox(height: 24),
              const HealthCompass(),
              const SizedBox(height: 24),
              const DailyLoop(),
              const SizedBox(height: 20),
              _VoiceHint(),
              const SizedBox(height: 20),
            ],
          );
        },
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [NuColors.violet900.withOpacity(0.35), NuColors.spaceIndigo.withOpacity(0.35)],
        ),
        border: Border.all(color: NuColors.violet400.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Good morning · Wednesday', style: NuText.eyebrow()),
          const SizedBox(height: 4),
          Text("You're on a 13-day habit streak.", style: NuText.body(size: 15, w: FontWeight.w800)),
          const SizedBox(height: 2),
          Text('Yesterday: 88% Time in Range · +5 pts vs. last week.',
              style: NuText.body(size: 12, w: FontWeight.w500, c: Colors.white.withOpacity(0.7))),
        ],
      ),
    );
  }
}

class _EmptyProfileNote extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: Colors.white.withOpacity(0.04),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Text(
        'Success Profiles unlock after Nu sees enough good-day density in your data. Check back in a few days.',
        style: NuText.body(c: Colors.white.withOpacity(0.7), size: 13),
      ),
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
          Text('Ask Nu', style: NuText.eyebrow()),
          const SizedBox(height: 8),
          _hintRow('"Whatsup Nu, why is Long Walker my playbook today?"'),
          const SizedBox(height: 4),
          _hintRow('"Whatsup Nu, summary"'),
        ],
      ),
    );
  }

  Widget _hintRow(String text) => Text(text, style: NuText.body(size: 12, w: FontWeight.w600, c: Colors.white.withOpacity(0.85)));
}
