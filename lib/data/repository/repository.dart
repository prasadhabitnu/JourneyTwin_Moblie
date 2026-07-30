import '../models/patient.dart';
import '../models/cgm.dart';
import '../models/success_profile.dart';
import '../models/agp.dart';
import '../models/lens.dart';
import '../models/daily_metrics.dart';
import '../models/compass.dart';
import '../models/social_and_predictions.dart';

/// Screens depend only on this interface. Swap MockRepository -->
/// PlatformApiRepository (Java backend) later without touching UI code.
abstract class NuRepository {
  Future<void> warmup();

  // v0.x — Nu Universe (dark) data
  Future<Patient> currentPatient();
  Future<List<Patient>> allPatients();
  Future<CgmStream> cgmStream(String patientId);
  Future<List<SuccessProfile>> successProfiles(String patientId);
  Future<List<AgpBin>> agp(String patientId);
  Future<Map<CgmLens, LensInsight>> lensInsights(String patientId);

  // v1.0 — Habitnu light-theme additions
  Future<List<DailyMetric>> dailyMetrics(String patientId);
  Future<CompassScores> compassScores(String patientId);
  Future<CompassInsights> compassInsights(String patientId);
  Future<Cohort?> cohort(String patientId);
  Future<Prediction?> prediction(String patientId);
}
