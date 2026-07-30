import 'package:equatable/equatable.dart';

import '../../theme/habitnu_theme.dart';

/// 0..100 score per Health Compass segment.
class CompassScores extends Equatable {
  final Map<HCompass, int> scores;
  const CompassScores({required this.scores});

  factory CompassScores.fromJson(Map<String, dynamic> j) {
    final m = <HCompass, int>{};
    for (final seg in HCompass.values) {
      final v = j[seg.key];
      m[seg] = v is num ? v.toInt() : 50;
    }
    return CompassScores(scores: m);
  }

  int operator [](HCompass s) => scores[s] ?? 50;

  @override
  List<Object?> get props => [scores];
}

/// Curated Nu Noticed / Recommends content per compass segment.
class CompassInsight extends Equatable {
  final List<String> noticed;
  final List<String> recommends;
  final List<String> actions;

  const CompassInsight({
    required this.noticed,
    required this.recommends,
    required this.actions,
  });

  factory CompassInsight.fromJson(Map<String, dynamic> j) => CompassInsight(
        noticed:    ((j['noticed']    as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
        recommends: ((j['recommends'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
        actions:    ((j['actions']    as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
      );

  @override
  List<Object?> get props => [noticed, recommends, actions];
}

class CompassInsights {
  final Map<HCompass, CompassInsight> perSegment;
  const CompassInsights({required this.perSegment});

  factory CompassInsights.fromJson(Map<String, dynamic> j) {
    final m = <HCompass, CompassInsight>{};
    for (final seg in HCompass.values) {
      final v = j[seg.key];
      if (v is Map<String, dynamic>) m[seg] = CompassInsight.fromJson(v);
    }
    return CompassInsights(perSegment: m);
  }

  CompassInsight? get(HCompass s) => perSegment[s];
}
