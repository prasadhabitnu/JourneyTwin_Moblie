/**
 * WidgetContext — the full signal set Fathom uses to decide which widget to
 * render, in what variant, at what moment.
 *
 * The context is the union of everything Fathom knows about the member and
 * the moment. Each widget has a contextFit(ctx) function that scores itself
 * against this context; the selector picks the winner.
 *
 * Signal categories:
 *   1. patient           — persona, medication, program stage, archetype
 *   2. time              — hour, day-of-week, part-of-day, DND
 *   3. environment       — weather, calendar, travel, location
 *   4. clinical          — CGM, NHI, active symptoms, severity band
 *   5. behavioral        — engagement, drift, streak, mood
 *   6. access            — refills, PA status, coupon eligibility
 *   7. cohort            — what similar members are doing right now
 *   8. session           — what widgets have already been shown/dismissed
 */

import { PatientContext, WidgetId } from "./widgetContract";

// -----------------------------------------------------------------------------

export type PartOfDay = "early-morning" | "morning" | "midday" | "afternoon" | "evening" | "night";
export type Weather   = "sunny" | "cloudy" | "rainy" | "cold" | "hot" | "snow";
export type Calendar  = "free" | "busy" | "meeting" | "commuting" | "unknown";
export type Travel    = "home" | "traveling" | "airport" | "hotel";
export type SeverityBand   = "none" | "mild" | "moderate" | "severe";
export type EngagementBand = "engaged" | "steady" | "drifting" | "silent";
export type RefillStatus   = "on-track" | "warning" | "pending" | "blocked" | "unknown";
export type Archetype =
  | "morning-mover"          // best days start with sunlight walk
  | "evening-walker"         // best days end with post-dinner walk
  | "meal-order-optimizer"   // fiber-first / protein-first works for her
  | "steady-simple"          // predictable meal times matter most
  | "hydration-champion"     // hydration is the primary lever
  | "unknown";

// -----------------------------------------------------------------------------

export interface TimeContext {
  localHour: number;                    // 0-23
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  isWeekend: boolean;
  partOfDay: PartOfDay;
  isDND: boolean;                       // do-not-disturb window (e.g. 22-07)
  minutesSinceLastNotification?: number;
}

export interface EnvironmentContext {
  weather?: Weather;
  tempF?: number;
  calendar?: Calendar;
  travel?: Travel;
  timezone?: string;
}

export interface ClinicalContext {
  lastGlucosePeak?: number;             // mg/dL in last 24h
  hoursSinceLastSpike?: number;         // if spike > 180
  lastTIR?: number;                     // % time-in-range last 24h
  nuHealthIndex?: number;               // 0-10 (Nu-scored)
  activeSymptoms?: string[];            // e.g. ["nausea", "fatigue"]
  severityBand?: SeverityBand;          // worst active symptom's band
}

export interface BehavioralContext {
  daysSinceLastLog?: number;
  streakDays?: number;
  lastMood?: 1 | 2 | 3 | 4 | 5;
  driftDetected?: boolean;
  engagementBand?: EngagementBand;
  archetype?: Archetype;
}

export interface AccessContext {
  daysMedicationLeft?: number;
  refillStatus?: RefillStatus;
  priorAuthStatus?: "not-required" | "approved" | "pending" | "denied";
  couponEligible?: boolean;
}

export interface CohortContext {
  similarMembersEngagedToday?: number;  // e.g. 312 of 428
  trendingWidgetToday?: WidgetId;
  cohortAvgTirYesterday?: number;
}

export interface SessionContext {
  widgetsShownToday: WidgetId[];
  dismissedInLast7Days: { widgetId: WidgetId; hoursAgo: number }[];
  lastCoachTouchHoursAgo?: number;
  lastBestPathShownDaysAgo?: number;
}

// -----------------------------------------------------------------------------
// The full context handed to each widget's contextFit() function.
// -----------------------------------------------------------------------------

export interface WidgetContext {
  patient: PatientContext;
  time: TimeContext;
  environment: EnvironmentContext;
  clinical: ClinicalContext;
  behavioral: BehavioralContext;
  access: AccessContext;
  cohort: CohortContext;
  session: SessionContext;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function partOfDayFromHour(h: number): PartOfDay {
  if (h < 6)  return "early-morning";
  if (h < 10) return "morning";
  if (h < 13) return "midday";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function isDND(h: number): boolean {
  return h < 7 || h >= 22;
}

/** Build a plausible full context from a small set of overrides. */
export function makeContext(
  patient: PatientContext,
  overrides: Partial<WidgetContext> = {}
): WidgetContext {
  const now = new Date();
  const h = overrides.time?.localHour ?? now.getHours();
  const dow = overrides.time?.dayOfWeek ?? (now.getDay() as any);
  return {
    patient,
    time: {
      localHour: h,
      dayOfWeek: dow,
      isWeekend: dow === 0 || dow === 6,
      partOfDay: partOfDayFromHour(h),
      isDND: isDND(h),
      minutesSinceLastNotification: 240,
      ...overrides.time,
    },
    environment: {
      weather: "cloudy",
      tempF: 68,
      calendar: "free",
      travel: "home",
      ...overrides.environment,
    },
    clinical: {
      lastTIR: patient.signals?.lastTIR ?? 78,
      nuHealthIndex: 7.2,
      activeSymptoms: patient.signals?.activeSymptoms ?? [],
      severityBand: (patient.signals?.activeSymptoms?.length ?? 0) > 0 ? "mild" : "none",
      ...overrides.clinical,
    },
    behavioral: {
      daysSinceLastLog: patient.signals?.daysSinceLastLog ?? 0,
      streakDays: 12,
      lastMood: patient.signals?.lastMood ?? 3,
      driftDetected: (patient.signals?.daysSinceLastLog ?? 0) >= 5,
      engagementBand:
        (patient.signals?.daysSinceLastLog ?? 0) >= 7 ? "silent" :
        (patient.signals?.daysSinceLastLog ?? 0) >= 3 ? "drifting" :
        "engaged",
      archetype: "evening-walker",
      ...overrides.behavioral,
    },
    access: {
      daysMedicationLeft: 21,
      refillStatus: "on-track",
      priorAuthStatus: "approved",
      couponEligible: true,
      ...overrides.access,
    },
    cohort: {
      similarMembersEngagedToday: 312,
      trendingWidgetToday: "best-day-mirror",
      cohortAvgTirYesterday: 74,
      ...overrides.cohort,
    },
    session: {
      widgetsShownToday: [],
      dismissedInLast7Days: [],
      lastCoachTouchHoursAgo: 26,
      lastBestPathShownDaysAgo: 8,
      ...overrides.session,
    },
  };
}
