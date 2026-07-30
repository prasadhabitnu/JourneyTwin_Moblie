import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../theme/app_theme.dart';
import '../voice/planets.dart';
import '../data/repository/repository.dart';
import '../data/models/patient.dart';
import '../widgets/nu_frame.dart';
import '../ui_mode.dart';
import '../habitnu_app.dart';

/// Nu's Universe - planetary launcher home screen.
/// Tap a planet to open it, or use voice.
class UniverseScreen extends StatelessWidget {
  const UniverseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = context.read<NuRepository>();
    return NuFrame(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            _Header(repo: repo),
            const SizedBox(height: 28),
            const _NuHero(),
            const SizedBox(height: 32),
            _PlanetOrbit(),
            const SizedBox(height: 24),
            const _Hint(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final NuRepository repo;
  const _Header({required this.repo});

  static const _buildStamp = 'v1.2.0 · demo-ready';

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Patient>(
      future: repo.currentPatient(),
      builder: (context, snap) {
        final p = snap.data;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text("Nu's Universe",
                    style: NuText.body(size: 24, w: FontWeight.w900))),
                _ReturnToHabitnuChip(),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    color: NuColors.violet900.withOpacity(0.4),
                    border: Border.all(color: NuColors.violet400.withOpacity(0.4)),
                  ),
                  child: Text(_buildStamp,
                      style: NuText.body(size: 9, w: FontWeight.w700, c: NuColors.violet300)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              p == null
                  ? 'Loading your world...'
                  : 'Hi ${p.name.split(" ").first}. Week ${p.weeksOnProgram} on program.',
              style: NuText.body(size: 13, w: FontWeight.w500, c: Colors.white.withOpacity(0.7)),
            ),
          ],
        );
      },
    );
  }
}

class _NuHero extends StatelessWidget {
  const _NuHero();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 120, height: 120,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [NuColors.emerald500.withOpacity(0.9), NuColors.violet900.withOpacity(0.6)],
          ),
          boxShadow: [
            BoxShadow(color: NuColors.emerald500.withOpacity(0.5), blurRadius: 40, spreadRadius: 4),
          ],
        ),
        child: const Center(
          child: Text('🌱', style: TextStyle(fontSize: 60)),
        ),
      ),
    );
  }
}

class _PlanetOrbit extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.4,
      ),
      itemCount: kPlanets.length,
      itemBuilder: (context, i) => _PlanetTile(planet: kPlanets[i]),
    );
  }
}

class _PlanetTile extends StatelessWidget {
  final Planet planet;
  const _PlanetTile({required this.planet});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed(planet.route),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [
              planet.toneColor.withOpacity(0.28),
              planet.toneColor.withOpacity(0.10),
              Colors.transparent,
            ],
          ),
          border: Border.all(color: planet.toneColor.withOpacity(0.35), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(planet.emoji, style: const TextStyle(fontSize: 26)),
                const Spacer(),
                if (!planet.built)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: Colors.white.withOpacity(0.08),
                    ),
                    child: Text('v2',
                        style: NuText.body(size: 8, w: FontWeight.w900, c: Colors.white.withOpacity(0.55))),
                  ),
              ],
            ),
            const Spacer(),
            Text(planet.name, style: NuText.body(size: 15, w: FontWeight.w900)),
            const SizedBox(height: 2),
            Text(planet.status, style: NuText.body(size: 11, w: FontWeight.w600, c: planet.toneColor)),
          ],
        ),
      ),
    );
  }
}

class _Hint extends StatelessWidget {
  const _Hint();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: NuColors.violet900.withOpacity(0.3),
        border: Border.all(color: NuColors.violet400.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(Icons.tips_and_updates, color: NuColors.violet300, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: NuText.body(size: 12, w: FontWeight.w500, c: Colors.white.withOpacity(0.85)),
                children: const [
                  TextSpan(text: 'Say '),
                  TextSpan(
                      text: '"Whatsup Nu, open CGM"',
                      style: TextStyle(color: NuColors.violet300, fontWeight: FontWeight.w900)),
                  TextSpan(text: ' or tap a planet.'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Bright chip in the Universe header. Taps back to the Habitnu light shell
/// and saves the preference so subsequent launches land there.
class _ReturnToHabitnuChip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        await UiModeStore.save(UiMode.habitnu);
        if (!context.mounted) return;
        SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          systemNavigationBarColor: Color(0xFFFFFFFF),
          systemNavigationBarIconBrightness: Brightness.dark,
        ));
        Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HabitnuApp()),
          (r) => false,
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(6),
          gradient: const LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [Color(0xFFF6D77E), Color(0xFFC89A3B)],
          ),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.arrow_back_rounded, size: 11, color: Color(0xFF0F172A)),
            SizedBox(width: 3),
            Text('Habitnu v2',
                style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A))),
          ],
        ),
      ),
    );
  }
}
