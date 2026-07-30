import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../data/models/success_profile.dart';

/// Horizontally scrollable card list of the user's Success Profile archetypes.
/// Top profile (index 0) gets the gold hero treatment; others get muted gradients.
class SuccessProfileCarousel extends StatefulWidget {
  final List<SuccessProfile> profiles;
  const SuccessProfileCarousel({super.key, required this.profiles});

  @override
  State<SuccessProfileCarousel> createState() => _SuccessProfileCarouselState();
}

class _SuccessProfileCarouselState extends State<SuccessProfileCarousel> {
  int _index = 0;
  final _controller = PageController(viewportFraction: 0.92);

  @override
  Widget build(BuildContext context) {
    if (widget.profiles.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 280,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _index = i),
            itemCount: widget.profiles.length,
            itemBuilder: (context, i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _ProfileCard(profile: widget.profiles[i], isHero: i == 0),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(widget.profiles.length, (i) {
              final active = i == _index;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 18 : 6, height: 6,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(3),
                  color: active ? NuColors.gold : Colors.white.withOpacity(0.25),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final SuccessProfile profile;
  final bool isHero;
  const _ProfileCard({required this.profile, required this.isHero});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: isHero
            ? NuGradients.successProfile
            : LinearGradient(
                begin: Alignment.topLeft, end: Alignment.bottomRight,
                colors: [
                  NuColors.violet900.withOpacity(0.45),
                  NuColors.spaceIndigo.withOpacity(0.45),
                ],
              ),
        border: isHero ? null : Border.all(color: NuColors.violet400.withOpacity(0.35)),
        boxShadow: [
          if (isHero)
            BoxShadow(color: NuColors.gold.withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(profile.emoji, style: const TextStyle(fontSize: 30)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${isHero ? "Top match" : "Alternate"} · ${profile.matchStrength}% TIR',
                      style: NuText.eyebrow(c: isHero ? Colors.white.withOpacity(0.9) : NuColors.violet300),
                    ),
                    Text(profile.name, style: NuText.body(size: 18, w: FontWeight.w900)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(profile.tagline, style: NuText.body(size: 12, w: FontWeight.w600, c: Colors.white.withOpacity(0.9))),
          const SizedBox(height: 12),
          Text('The recipe', style: NuText.eyebrow(c: Colors.white.withOpacity(0.8))),
          const SizedBox(height: 4),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: profile.recipe
                    .map((r) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.check_circle_rounded, color: Colors.white.withOpacity(0.85), size: 14),
                              const SizedBox(width: 8),
                              Expanded(child: Text(r, style: NuText.body(size: 12, w: FontWeight.w500))),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
