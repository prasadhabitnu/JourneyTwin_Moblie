import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';

/// Compact header block combining greeting + subtitle + mood check-in
/// arranged full-width so the greeting doesn't wrap.
class GreetingBlock extends StatelessWidget {
  final String name;
  final MoodValue? mood;
  final ValueChanged<MoodValue> onMood;
  const GreetingBlock({
    super.key,
    required this.name,
    required this.mood,
    required this.onMood,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  'Good morning, $name!',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: HText.body(size: 24, w: FontWeight.w900, c: HColors.ink),
                ),
              ),
              const SizedBox(width: 6),
              const Text('☀', style: TextStyle(fontSize: 22)),
            ],
          ),
          const SizedBox(height: 3),
          Text('Small steps today. Big wins tomorrow.',
              style: HText.body(size: 13, w: FontWeight.w500, c: HColors.inkMuted)),
          const SizedBox(height: 14),
          Row(
            children: [
              Text('How are you feeling?',
                  style: HText.body(size: 12, w: FontWeight.w700, c: HColors.inkMuted)),
              const SizedBox(width: 12),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: MoodValue.values
                      .map((m) => _MoodPill(
                            value: m,
                            active: m == mood,
                            onTap: () => onMood(m),
                          ))
                      .toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

enum MoodValue { good, okay, struggling }

extension MoodMeta on MoodValue {
  String get label {
    switch (this) {
      case MoodValue.good: return 'Good';
      case MoodValue.okay: return 'Okay';
      case MoodValue.struggling: return 'Struggling';
    }
  }
  String get emoji {
    switch (this) {
      case MoodValue.good: return '😊';
      case MoodValue.okay: return '😐';
      case MoodValue.struggling: return '😔';
    }
  }
  Color get tint {
    switch (this) {
      case MoodValue.good: return const Color(0xFFD1FAE5);
      case MoodValue.okay: return const Color(0xFFFEF3C7);
      case MoodValue.struggling: return const Color(0xFFFECACA);
    }
  }
  Color get border {
    switch (this) {
      case MoodValue.good: return const Color(0xFF10B981);
      case MoodValue.okay: return const Color(0xFFF59E0B);
      case MoodValue.struggling: return const Color(0xFFF87171);
    }
  }
}

class _MoodPill extends StatelessWidget {
  final MoodValue value;
  final bool active;
  final VoidCallback onTap;
  const _MoodPill({required this.value, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: value.tint,
              border: active ? Border.all(color: value.border, width: 2) : null,
            ),
            alignment: Alignment.center,
            child: Text(value.emoji, style: const TextStyle(fontSize: 18)),
          ),
          const SizedBox(width: 4),
          Text(value.label,
              style: HText.body(size: 10, w: FontWeight.w800, c: HColors.inkMuted)),
        ],
      ),
    );
  }
}
