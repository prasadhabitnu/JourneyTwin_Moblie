import 'package:equatable/equatable.dart';

/// A single 15-minute bin of the 14-day Ambulatory Glucose Profile overlay.
class AgpBin extends Equatable {
  final double hour;
  final double p10;
  final double p25;
  final double p50;
  final double p75;
  final double p90;

  const AgpBin({
    required this.hour,
    required this.p10,
    required this.p25,
    required this.p50,
    required this.p75,
    required this.p90,
  });

  factory AgpBin.fromJson(Map<String, dynamic> json) => AgpBin(
        hour: (json['hour'] as num?)?.toDouble() ?? 0.0,
        p10: (json['p10'] as num?)?.toDouble() ?? 0.0,
        p25: (json['p25'] as num?)?.toDouble() ?? 0.0,
        p50: (json['p50'] as num?)?.toDouble() ?? 0.0,
        p75: (json['p75'] as num?)?.toDouble() ?? 0.0,
        p90: (json['p90'] as num?)?.toDouble() ?? 0.0,
      );

  @override
  List<Object?> get props => [hour, p10, p25, p50, p75, p90];
}
