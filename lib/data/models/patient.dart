import 'package:equatable/equatable.dart';

class Patient extends Equatable {
  final String id;
  final String name;
  final int age;
  final String sex;
  final double bmi;
  final double hba1c;
  final int weeksOnProgram;
  final String rss;
  final String tier;

  const Patient({
    required this.id,
    required this.name,
    required this.age,
    required this.sex,
    required this.bmi,
    required this.hba1c,
    required this.weeksOnProgram,
    required this.rss,
    required this.tier,
  });

  /// Tolerant of missing optional fields (tier defaults to a friendly label).
  factory Patient.fromJson(Map<String, dynamic> json) => Patient(
        id: (json['id'] as String?) ?? 'unknown',
        name: (json['name'] as String?) ?? 'Unknown',
        age: (json['age'] as num?)?.toInt() ?? 0,
        sex: (json['sex'] as String?) ?? '',
        bmi: (json['bmi'] as num?)?.toDouble() ?? 0.0,
        hba1c: (json['hba1c'] as num?)?.toDouble() ?? 0.0,
        weeksOnProgram: (json['weeksOnProgram'] as num?)?.toInt() ?? 0,
        rss: (json['rss'] as String?) ?? 'Low',
        tier: (json['tier'] as String?) ?? 'GLP-1 Direct',
      );

  @override
  List<Object?> get props =>
      [id, name, age, sex, bmi, hba1c, weeksOnProgram, rss, tier];
}
