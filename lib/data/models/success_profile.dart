import 'package:equatable/equatable.dart';

class SuccessProfile extends Equatable {
  final String id;
  final String name;
  final String tagline;
  final String emoji;
  final int matchStrength;
  final List<String> recipe;
  final List<String> matchingDays;
  final List<String> nuEnhancements;

  const SuccessProfile({
    required this.id,
    required this.name,
    required this.tagline,
    required this.emoji,
    required this.matchStrength,
    required this.recipe,
    required this.matchingDays,
    required this.nuEnhancements,
  });

  factory SuccessProfile.fromJson(Map<String, dynamic> json) => SuccessProfile(
        id: (json['id'] as String?) ?? '',
        name: (json['name'] as String?) ?? '',
        tagline: (json['tagline'] as String?) ?? '',
        emoji: (json['emoji'] as String?) ?? '✨',
        matchStrength: (json['matchStrength'] as num?)?.toInt() ?? 0,
        recipe: ((json['recipe'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
        matchingDays: ((json['matchingDays'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
        nuEnhancements: ((json['nuEnhancements'] as List<dynamic>?) ?? []).map((e) => e.toString()).toList(),
      );

  @override
  List<Object?> get props => [id, name, matchStrength];
}
