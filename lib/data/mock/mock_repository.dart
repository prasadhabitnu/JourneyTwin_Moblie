import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;

import '../repository/repository.dart';
import '../models/patient.dart';
import '../models/cgm.dart';
import '../models/success_profile.dart';
import '../models/agp.dart';
import '../models/lens.dart';
import '../models/daily_metrics.dart';
import '../models/compass.dart';
import '../models/social_and_predictions.dart';

/// Loads all mock data from bundled JSON produced by
/// glp1-dashboard/scripts/export-mock-data.ts.
class MockRepository implements NuRepository {
  Map<String, Patient> _patients = {};
  Map<String, CgmStream> _streams = {};
  Map<String, List<SuccessProfile>> _profiles = {};
  Map<String, List<AgpBin>> _agp = {};
  Map<String, Map<CgmLens, LensInsight>> _lenses = {};
  Map<String, List<DailyMetric>> _daily = {};
  Map<String, CompassScores> _compassScores = {};
  Map<String, CompassInsights> _compassInsights = {};
  Map<String, Cohort> _cohorts = {};
  Map<String, Prediction> _predictions = {};
  final String _demoHeroId = 'P100967';

  @override
  Future<void> warmup() async {
    final res = await Future.wait([
      _load('assets/data/patients.json'),
      _load('assets/data/cgm_streams.json'),
      _load('assets/data/success_profiles.json'),
      _load('assets/data/agp.json'),
      _load('assets/data/lens_insights.json'),
      _load('assets/data/daily_metrics.json'),
      _load('assets/data/compass_scores.json'),
      _load('assets/data/compass_insights.json'),
      _load('assets/data/people_like_me.json'),
      _load('assets/data/predictions.json'),
    ]);

    // 0 - patients
    final patientsJson = res[0] as List<dynamic>;
    _patients = {
      for (final p in patientsJson)
        (p as Map<String, dynamic>)['id'] as String: Patient.fromJson(p),
    };

    // 1 - streams
    final streamsJson = res[1] as Map<String, dynamic>;
    _streams = streamsJson.map(
      (k, v) => MapEntry(k, CgmStream.fromJson(v as Map<String, dynamic>)),
    );

    // 2 - profiles
    final profilesJson = res[2] as Map<String, dynamic>;
    _profiles = profilesJson.map(
      (k, v) => MapEntry(
        k,
        (v as List<dynamic>)
            .map((e) => SuccessProfile.fromJson(e as Map<String, dynamic>))
            .toList(),
      ),
    );

    // 3 - AGP
    final agpJson = res[3] as Map<String, dynamic>;
    _agp = agpJson.map(
      (k, v) => MapEntry(
        k,
        (v as List<dynamic>)
            .map((e) => AgpBin.fromJson(e as Map<String, dynamic>))
            .toList(),
      ),
    );

    // 4 - lens insights
    final lensesJson = res[4] as Map<String, dynamic>;
    _lenses = lensesJson.map((pid, v) {
      final perLens = (v as Map<String, dynamic>).map((k, insight) {
        return MapEntry(
          CgmLensJson.fromKey(k),
          LensInsight.fromJson(insight as Map<String, dynamic>),
        );
      });
      return MapEntry(pid, perLens);
    });

    // 5 - daily metrics
    final dailyJson = res[5] as Map<String, dynamic>;
    _daily = dailyJson.map(
      (k, v) => MapEntry(
        k,
        (v as List<dynamic>)
            .map((e) => DailyMetric.fromJson(e as Map<String, dynamic>))
            .toList(),
      ),
    );

    // 6 - compass scores
    final scoresJson = res[6] as Map<String, dynamic>;
    _compassScores = scoresJson.map(
      (k, v) => MapEntry(k, CompassScores.fromJson(v as Map<String, dynamic>)),
    );

    // 7 - compass insights
    final insJson = res[7] as Map<String, dynamic>;
    _compassInsights = insJson.map(
      (k, v) => MapEntry(k, CompassInsights.fromJson(v as Map<String, dynamic>)),
    );

    // 8 - cohorts
    final cohJson = res[8] as Map<String, dynamic>;
    _cohorts = cohJson.map(
      (k, v) => MapEntry(k, Cohort.fromJson(v as Map<String, dynamic>)),
    );

    // 9 - predictions
    final predJson = res[9] as Map<String, dynamic>;
    _predictions = predJson.map(
      (k, v) => MapEntry(k, Prediction.fromJson(v as Map<String, dynamic>)),
    );
  }

  Future<dynamic> _load(String path) async {
    try {
      final raw = await rootBundle.loadString(path);
      return jsonDecode(raw);
    } catch (_) {
      if (path.endsWith('patients.json')) return <dynamic>[];
      return <String, dynamic>{};
    }
  }

  @override
  Future<Patient> currentPatient() async =>
      _patients[_demoHeroId] ?? _fallbackPatient();

  @override
  Future<List<Patient>> allPatients() async =>
      _patients.isEmpty ? [_fallbackPatient()] : _patients.values.toList();

  @override
  Future<CgmStream> cgmStream(String patientId) async =>
      _streams[patientId] ?? CgmStream(patientId: patientId, days: []);

  @override
  Future<List<SuccessProfile>> successProfiles(String patientId) async =>
      _profiles[patientId] ?? [];

  @override
  Future<List<AgpBin>> agp(String patientId) async => _agp[patientId] ?? [];

  @override
  Future<Map<CgmLens, LensInsight>> lensInsights(String patientId) async =>
      _lenses[patientId] ?? {};

  @override
  Future<List<DailyMetric>> dailyMetrics(String patientId) async =>
      _daily[patientId] ?? [];

  @override
  Future<CompassScores> compassScores(String patientId) async =>
      _compassScores[patientId] ??
      const CompassScores(scores: {});

  @override
  Future<CompassInsights> compassInsights(String patientId) async =>
      _compassInsights[patientId] ??
      const CompassInsights(perSegment: {});

  @override
  Future<Cohort?> cohort(String patientId) async => _cohorts[patientId];

  @override
  Future<Prediction?> prediction(String patientId) async =>
      _predictions[patientId];

  Patient _fallbackPatient() => const Patient(
        id: 'P100967',
        name: 'Sandy R.',
        age: 47,
        sex: 'F',
        bmi: 32.8,
        hba1c: 7.4,
        weeksOnProgram: 13,
        rss: 'Watch',
        tier: 'GLP-1 Direct',
      );
}
