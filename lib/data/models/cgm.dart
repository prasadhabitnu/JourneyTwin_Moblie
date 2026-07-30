import 'package:equatable/equatable.dart';

class CgmReading extends Equatable {
  final DateTime t;
  final double mgdl;
  const CgmReading({required this.t, required this.mgdl});

  factory CgmReading.fromJson(Map<String, dynamic> json) => CgmReading(
        t: DateTime.parse((json['t'] as String?) ?? DateTime.now().toIso8601String()),
        mgdl: (json['mgdl'] as num?)?.toDouble() ?? 0.0,
      );

  @override
  List<Object?> get props => [t, mgdl];
}

class CgmAnnotation extends Equatable {
  final DateTime t;
  final String kind;
  final String label;
  final String? note;
  const CgmAnnotation({required this.t, required this.kind, required this.label, this.note});

  factory CgmAnnotation.fromJson(Map<String, dynamic> json) => CgmAnnotation(
        t: DateTime.parse((json['t'] as String?) ?? DateTime.now().toIso8601String()),
        kind: (json['kind'] as String?) ?? 'meal',
        label: (json['label'] as String?) ?? '',
        note: json['note'] as String?,
      );

  @override
  List<Object?> get props => [t, kind, label, note];
}

class DayStats extends Equatable {
  final DateTime date;
  final double tir;
  final double timeAbove;
  final double timeBelow;
  final double gmi;
  final double cv;
  final double meanGlucose;
  final String label;
  final List<CgmReading> readings;
  final List<CgmAnnotation> annotations;

  const DayStats({
    required this.date,
    required this.tir,
    required this.timeAbove,
    required this.timeBelow,
    required this.gmi,
    required this.cv,
    required this.meanGlucose,
    required this.label,
    required this.readings,
    required this.annotations,
  });

  factory DayStats.fromJson(Map<String, dynamic> json) => DayStats(
        date: DateTime.parse((json['date'] as String?) ?? DateTime.now().toIso8601String()),
        tir: (json['tir'] as num?)?.toDouble() ?? 0.0,
        timeAbove: (json['timeAbove'] as num?)?.toDouble() ?? 0.0,
        timeBelow: (json['timeBelow'] as num?)?.toDouble() ?? 0.0,
        gmi: (json['gmi'] as num?)?.toDouble() ?? 0.0,
        cv: (json['cv'] as num?)?.toDouble() ?? 0.0,
        meanGlucose: (json['meanGlucose'] as num?)?.toDouble() ?? 0.0,
        label: (json['label'] as String?) ?? '',
        readings: ((json['readings'] as List<dynamic>?) ?? [])
            .map((e) => CgmReading.fromJson(e as Map<String, dynamic>))
            .toList(),
        annotations: ((json['annotations'] as List<dynamic>?) ?? [])
            .map((e) => CgmAnnotation.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  @override
  List<Object?> get props =>
      [date, tir, timeAbove, timeBelow, gmi, cv, meanGlucose, label];
}

class CgmStream extends Equatable {
  final String patientId;
  final List<DayStats> days;
  const CgmStream({required this.patientId, required this.days});

  factory CgmStream.fromJson(Map<String, dynamic> json) => CgmStream(
        patientId: (json['patientId'] as String?) ?? '',
        days: ((json['days'] as List<dynamic>?) ?? [])
            .map((e) => DayStats.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  @override
  List<Object?> get props => [patientId, days];
}
