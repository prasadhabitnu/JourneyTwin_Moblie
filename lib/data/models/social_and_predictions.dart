import 'package:equatable/equatable.dart';

/// "People Like Me" cohort card content.
class Cohort extends Equatable {
  final String cohortLabel;
  final String ageRange;
  final List<String> similarity;
  final List<String> whatWorked;
  final int spikeReductionPct;   // negative = improvement
  final int weightLossLbs;       // negative = loss
  final int tirImprovementPts;   // positive = better

  const Cohort({
    required this.cohortLabel,
    required this.ageRange,
    required this.similarity,
    required this.whatWorked,
    required this.spikeReductionPct,
    required this.weightLossLbs,
    required this.tirImprovementPts,
  });

  factory Cohort.fromJson(Map<String, dynamic> j) {
    final results = (j['results30d'] as Map<String, dynamic>?) ?? const {};
    return Cohort(
      cohortLabel: (j['cohortLabel'] as String?) ?? '',
      ageRange: (j['ageRange'] as String?) ?? '',
      similarity: ((j['similarity'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
      whatWorked: ((j['whatWorked'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
      spikeReductionPct: (results['spikeReduction'] as num?)?.toInt() ?? 0,
      weightLossLbs:     (results['weightLoss']     as num?)?.toInt() ?? 0,
      tirImprovementPts: (results['tirImprovement'] as num?)?.toInt() ?? 0,
    );
  }

  @override
  List<Object?> get props => [cohortLabel, spikeReductionPct, weightLossLbs, tirImprovementPts];
}

/// 7-day Momentum + weight forecast if the user stays on plan.
class Prediction extends Equatable {
  final String plan;
  final int momentumNow;
  final int momentumIn7Days;
  final double weightNow;
  final double weightIn7Days;
  final double confidence;
  final String note;

  const Prediction({
    required this.plan,
    required this.momentumNow,
    required this.momentumIn7Days,
    required this.weightNow,
    required this.weightIn7Days,
    required this.confidence,
    required this.note,
  });

  factory Prediction.fromJson(Map<String, dynamic> j) => Prediction(
        plan: (j['plan'] as String?) ?? '',
        momentumNow: (j['momentumNow'] as num?)?.toInt() ?? 0,
        momentumIn7Days: (j['momentumIn7Days'] as num?)?.toInt() ?? 0,
        weightNow: (j['weightNow'] as num?)?.toDouble() ?? 0,
        weightIn7Days: (j['weightIn7Days'] as num?)?.toDouble() ?? 0,
        confidence: (j['confidence'] as num?)?.toDouble() ?? 0.5,
        note: (j['note'] as String?) ?? '',
      );

  @override
  List<Object?> get props => [plan, momentumNow, momentumIn7Days];
}
