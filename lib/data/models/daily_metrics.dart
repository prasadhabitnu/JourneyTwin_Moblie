import 'package:equatable/equatable.dart';

/// One row per calendar day of self-report + derived scores.
class DailyMetric extends Equatable {
  final DateTime date;
  final String label;      // e.g., "Jul 1"
  final double weight;     // lbs
  final double sleepHours;
  final int stress;        // 1..5
  final String mood;       // "good" | "okay" | "struggling"
  final int momentum;      // 0..100 composite score

  const DailyMetric({
    required this.date,
    required this.label,
    required this.weight,
    required this.sleepHours,
    required this.stress,
    required this.mood,
    required this.momentum,
  });

  factory DailyMetric.fromJson(Map<String, dynamic> j) => DailyMetric(
        date: DateTime.parse((j['date'] as String?) ?? DateTime.now().toIso8601String()),
        label: (j['label'] as String?) ?? '',
        weight: (j['weight'] as num?)?.toDouble() ?? 0,
        sleepHours: (j['sleepHours'] as num?)?.toDouble() ?? 0,
        stress: (j['stress'] as num?)?.toInt() ?? 3,
        mood: (j['mood'] as String?) ?? 'okay',
        momentum: (j['momentum'] as num?)?.toInt() ?? 50,
      );

  @override
  List<Object?> get props => [date, weight, sleepHours, stress, mood, momentum];
}
