import 'package:equatable/equatable.dart';

/// Six-lens paradigm: Default / Notices / Remembers / Predicts / Recommends / Recovery.
enum CgmLens { defaultLens, notices, remembers, predicts, recommends, recovery }

extension CgmLensJson on CgmLens {
  static CgmLens fromKey(String key) {
    switch (key) {
      case 'default':    return CgmLens.defaultLens;
      case 'notices':    return CgmLens.notices;
      case 'remembers':  return CgmLens.remembers;
      case 'predicts':   return CgmLens.predicts;
      case 'recommends': return CgmLens.recommends;
      case 'recovery':   return CgmLens.recovery;
      default:           return CgmLens.defaultLens;
    }
  }

  String get key {
    switch (this) {
      case CgmLens.defaultLens: return 'default';
      case CgmLens.notices:     return 'notices';
      case CgmLens.remembers:   return 'remembers';
      case CgmLens.predicts:    return 'predicts';
      case CgmLens.recommends:  return 'recommends';
      case CgmLens.recovery:    return 'recovery';
    }
  }

  String get label {
    switch (this) {
      case CgmLens.defaultLens: return 'Default';
      case CgmLens.notices:     return 'Notices';
      case CgmLens.remembers:   return 'Remembers';
      case CgmLens.predicts:    return 'Predicts';
      case CgmLens.recommends:  return 'Recommends';
      case CgmLens.recovery:    return 'Recovery';
    }
  }

  String get question {
    switch (this) {
      case CgmLens.defaultLens: return 'How am I doing?';
      case CgmLens.notices:     return 'What changed?';
      case CgmLens.remembers:   return 'What worked before?';
      case CgmLens.predicts:    return "What's next?";
      case CgmLens.recommends:  return 'What should I do?';
      case CgmLens.recovery:    return 'How do I bounce back?';
    }
  }
}

class LensInsight extends Equatable {
  final CgmLens lens;
  final String headline;
  final List<String> bullets;

  const LensInsight({
    required this.lens,
    required this.headline,
    required this.bullets,
  });

  factory LensInsight.fromJson(Map<String, dynamic> json) => LensInsight(
        lens: CgmLensJson.fromKey((json['lens'] as String?) ?? 'default'),
        headline: (json['headline'] as String?) ?? '',
        bullets: ((json['bullets'] as List<dynamic>?) ?? [])
            .map((e) => e.toString())
            .toList(),
      );

  @override
  List<Object?> get props => [lens, headline, bullets];
}
