import 'package:http/http.dart' as http;

import 'repository.dart';
import '../models/patient.dart';
import '../models/cgm.dart';
import '../models/success_profile.dart';
import '../models/agp.dart';
import '../models/lens.dart';
import '../models/daily_metrics.dart';
import '../models/compass.dart';
import '../models/social_and_predictions.dart';

/// Stub for the future Java `platform-api` backend.
class PlatformApiRepository implements NuRepository {
  final String baseUrl;
  // ignore: unused_field
  final http.Client _client;

  PlatformApiRepository({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  @override
  Future<void> warmup() async {}

  Never _todo(String m) => throw UnimplementedError(
      'PlatformApiRepository.$m — wire when platform-api endpoints ship.');

  @override
  Future<Patient> currentPatient() => _todo('currentPatient');
  @override
  Future<List<Patient>> allPatients() => _todo('allPatients');
  @override
  Future<CgmStream> cgmStream(String patientId) => _todo('cgmStream');
  @override
  Future<List<SuccessProfile>> successProfiles(String patientId) =>
      _todo('successProfiles');
  @override
  Future<List<AgpBin>> agp(String patientId) => _todo('agp');
  @override
  Future<Map<CgmLens, LensInsight>> lensInsights(String patientId) =>
      _todo('lensInsights');
  @override
  Future<List<DailyMetric>> dailyMetrics(String patientId) =>
      _todo('dailyMetrics');
  @override
  Future<CompassScores> compassScores(String patientId) =>
      _todo('compassScores');
  @override
  Future<CompassInsights> compassInsights(String patientId) =>
      _todo('compassInsights');
  @override
  Future<Cohort?> cohort(String patientId) => _todo('cohort');
  @override
  Future<Prediction?> prediction(String patientId) => _todo('prediction');
}
