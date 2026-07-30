import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/repository/repository.dart';
import '../../data/models/cgm.dart';
import '../../data/models/daily_metrics.dart';
import '../../data/models/compass.dart';
import '../../data/models/social_and_predictions.dart';
import '../../voice/nu_voice.dart';
import '../../voice/planets.dart';
import '../../widgets/habitnu/app_bar.dart';
import '../../widgets/habitnu/greeting_mood.dart';
import '../../widgets/habitnu/best_path.dart';
import '../../widgets/habitnu/change_path_sheet.dart';
import '../../widgets/habitnu/health_compass.dart';
import '../../widgets/habitnu/compass_insights_panel.dart';
import '../../widgets/habitnu/glucose_story.dart';
import '../../widgets/habitnu/momentum_journey.dart';
import '../../widgets/habitnu/update_me.dart';
import '../../widgets/habitnu/people_like_me.dart';
import '../../widgets/habitnu/momentum_weight.dart';
import '../../widgets/habitnu/talk_to_nu_bar.dart';
import '../../widgets/habitnu/gold_card.dart';

const _PATIENT_ID = 'P100967';
const _SALLY_NAME = 'Sally';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  HCompass _segment = HCompass.glucose;
  MoodValue? _mood;
  PathOption _path = kPathOptions.first;

  final _scrollController = ScrollController();
  final _glucoseKey = GlobalKey();
  final _insightsKey = GlobalKey();
  final _commitmentKey = GlobalKey();

  NuVoice? _voice;
  bool _voiceListenerAttached = false;

  Future<_HomeData> _load(NuRepository repo) async {
    final res = await Future.wait([
      repo.cgmStream(_PATIENT_ID),
      repo.dailyMetrics(_PATIENT_ID),
      repo.compassScores(_PATIENT_ID),
      repo.compassInsights(_PATIENT_ID),
      repo.cohort(_PATIENT_ID),
      repo.prediction(_PATIENT_ID),
    ]);
    return _HomeData(
      stream:    res[0] as CgmStream,
      daily:     res[1] as List<DailyMetric>,
      scores:    res[2] as CompassScores,
      insights:  res[3] as CompassInsights,
      cohort:    res[4] as Cohort?,
      prediction: res[5] as Prediction?,
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_voiceListenerAttached) {
      _voice = context.read<NuVoice>();
      _voice!.intents.listen(_onIntent);
      _voiceListenerAttached = true;
    }
  }

  Future<void> _onIntent(ParsedIntent intent) async {
    if (!mounted) return;
    _handleActionKey(intent.followUpKey ?? '');
  }

  void _onPill(String label) {
    switch (label.toLowerCase()) {
      case 'why did i spike?': _handleActionKey('why-did-i-spike'); break;
      case 'log my lunch':      _handleActionKey('log-lunch');       break;
      case 'what should i do?': _handleActionKey('what-should-i-do'); break;
    }
  }

  Future<void> _handleActionKey(String key) async {
    if (!mounted) return;
    final voice = context.read<NuVoice>();
    switch (key) {
      case 'why-did-i-spike':
        setState(() => _segment = HCompass.glucose);
        await voice.speak(
          'Breakfast caused your highest spike today, at 174 milligrams per deciliter. '
          'Your walk after dinner brought you back into range within 45 minutes.',
        );
        _scrollTo(_glucoseKey);
        break;

      case 'log-lunch':
        await voice.speak(
          'Lunch logged. Grilled salmon with greens, 34 grams of protein. Nice choice.',
        );
        if (mounted) {
          _showToast(context, 'Lunch saved · grilled salmon + greens · 34g protein');
        }
        break;

      case 'what-should-i-do':
        await voice.speak(
          "Complete tonight's walk to keep your Momentum rising. "
          'Your 20-minute walk after dinner is scheduled for 9:15 PM.',
        );
        _scrollTo(_commitmentKey);
        break;

      case 'snap-meal':
        await voice.speak('Camera opening. Point at your plate and tap the shutter.');
        break;

      case 'why-tir-drop':
      case 'nu-summary':
      case 'explain-agp':
        setState(() => _segment = HCompass.glucose);
        _scrollTo(_glucoseKey);
        break;
    }
  }

  void _onCompassSelect(HCompass s) {
    setState(() => _segment = s);
    // Auto-focus the insights panel below so the user's attention flows there.
    _scrollTo(_insightsKey, alignment: 0.05);
  }

  Future<void> _onChangePath() async {
    final choice = await showChangePathSheet(context, _path.id);
    if (choice == null) return;
    setState(() => _path = choice);
    if (!mounted) return;
    _showToast(context, 'Switched to ${choice.name}');
    final voice = context.read<NuVoice>();
    await voice.speak(
      'Switched to ${choice.name}. ${choice.focusLine} '
      "I've updated your commitment for tonight.",
    );
  }

  void _scrollTo(GlobalKey key, {double alignment = 0.1}) {
    Future.delayed(const Duration(milliseconds: 200), () {
      final ctx = key.currentContext;
      if (ctx == null) return;
      Scrollable.ensureVisible(ctx,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOutCubic,
          alignment: alignment);
    });
  }

  void _showToast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        backgroundColor: HColors.brandBlue,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.only(bottom: 90, left: 16, right: 16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.read<NuRepository>();
    return Column(
      children: [
        Expanded(
          child: SafeArea(
            bottom: false,
            child: FutureBuilder<_HomeData>(
              future: _load(repo),
              builder: (context, snap) {
                if (!snap.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: HColors.brandBlue),
                  );
                }
                final d = snap.data!;
                final momentum = d.daily.isEmpty ? 78 : d.daily.last.momentum;
                final today = d.stream.days.isEmpty ? null : d.stream.days.last;

                return ListView(
                  controller: _scrollController,
                  padding: const EdgeInsets.only(bottom: 8),
                  children: [
                    const HabitnuAppBar(initials: 'S', notificationCount: 1),
                    GreetingBlock(
                      name: _SALLY_NAME,
                      mood: _mood,
                      onMood: (m) => setState(() => _mood = m),
                    ),
                    const SizedBox(height: 16),
                    BestPathCard(
                      pathName: _path.name,
                      focusLine: _path.focusLine,
                      whyExplanation: _path.whyExplanation,
                      headerIcon: _path.headerIcon,
                      items: _path.items,
                      onChangePath: _onChangePath,
                    ),
                    const SizedBox(height: 12),
                    KeyedSubtree(
                      key: _commitmentKey,
                      child: CommitmentRibbon(
                        commitment: _path.items.isNotEmpty ? _path.items.first.label : 'Walk 20 min after dinner',
                        targetTime: '9:15 PM',
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Full-width Health Compass — GOLD card
                    GoldCard(
                      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('HEALTH COMPASS',
                                  style: HText.eyebrow(c: HColors.brandBlue)),
                              const Spacer(),
                              Icon(Icons.info_outline_rounded,
                                  size: 15, color: HColors.inkMuted),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Center(
                            child: HealthCompass(
                              scores: d.scores,
                              momentum: momentum,
                              selected: _segment,
                              onSelect: _onCompassSelect,
                              size: 300,
                            ),
                          ),
                          const SizedBox(height: 10),
                          const _CompassLegend(),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Insights panel BELOW the compass, keyed for scroll target
                    KeyedSubtree(
                      key: _insightsKey,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: _AnimatedInsights(
                          segment: _segment,
                          child: CompassInsightsPanel(
                            segment: _segment,
                            insight: d.insights.get(_segment),
                            onAction: _handleActionKey,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    if (_segment == HCompass.movement ||
                        _segment == HCompass.stress ||
                        _segment == HCompass.mindset)
                      MomentumJourneyCard(daily: d.daily, prediction: d.prediction)
                    else if (today != null)
                      KeyedSubtree(
                        key: _glucoseKey,
                        child: GlucoseStoryCard(
                          day: today,
                          currentMgdl: 132,
                          onAnnotationTap: (a) async {
                            final voice = context.read<NuVoice>();
                            await voice.speak(
                              '${_titleCase(a.kind)}. ${a.label}. ${a.note ?? ""}',
                            );
                          },
                        ),
                      ),

                    const SizedBox(height: 16),
                    UpdateMeStrip(onTap: (_) {}),
                    const SizedBox(height: 16),
                    if (d.cohort != null) PeopleLikeMeCard(cohort: d.cohort!),
                    const SizedBox(height: 16),
                    MomentumWeightRow(daily: d.daily, goalWeight: 170),
                    const SizedBox(height: 12),
                  ],
                );
              },
            ),
          ),
        ),
        TalkToNuBar(
          pills: const ['Why did I spike?', 'Log my lunch', 'What should I do?'],
          onPill: _onPill,
        ),
      ],
    );
  }

  String _titleCase(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
}

/// Wraps the insights panel with a subtle pulse whenever the selected segment
/// changes, so tapping a compass segment visibly draws attention down.
class _AnimatedInsights extends StatelessWidget {
  final HCompass segment;
  final Widget child;
  const _AnimatedInsights({required this.segment, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 260),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 0.03),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: KeyedSubtree(key: ValueKey(segment), child: child),
    );
  }
}

class _CompassLegend extends StatelessWidget {
  const _CompassLegend();
  @override
  Widget build(BuildContext context) {
    Widget dot(Color c, String l) => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 8, height: 8,
                decoration: BoxDecoration(shape: BoxShape.circle, color: c)),
            const SizedBox(width: 4),
            Text(l, style: HText.body(size: 11, w: FontWeight.w700, c: HColors.inkMuted)),
          ],
        );
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        dot(HColors.success, 'Strong'),
        dot(HColors.warning, 'Good'),
        dot(HColors.danger, 'Needs focus'),
      ],
    );
  }
}

class _HomeData {
  final CgmStream stream;
  final List<DailyMetric> daily;
  final CompassScores scores;
  final CompassInsights insights;
  final Cohort? cohort;
  final Prediction? prediction;
  _HomeData({
    required this.stream,
    required this.daily,
    required this.scores,
    required this.insights,
    required this.cohort,
    required this.prediction,
  });
}
