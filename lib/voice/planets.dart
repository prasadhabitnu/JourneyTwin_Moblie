import 'package:flutter/material.dart';

/// Planet catalog — kept in sync with glp1-dashboard/lib/nuVoice.ts.
class Planet {
  final String slug;
  final String name;
  final String emoji;
  final List<String> keywords;
  final Color toneColor;
  final String status;
  final bool built;

  const Planet({
    required this.slug,
    required this.name,
    required this.emoji,
    required this.keywords,
    required this.toneColor,
    required this.status,
    required this.built,
  });

  String get route => '/planet/$slug';
}

const List<Planet> kPlanets = [
  Planet(
    slug: 'today',
    name: 'Today',
    emoji: '🌅',
    keywords: ['today', 'playbook', 'recipe', 'plan', 'long walker', 'the walker', 'my day', 'daily'],
    toneColor: Color(0xFFF59E0B),
    status: 'Long Walker',
    built: true,
  ),
  Planet(
    slug: 'cgm',
    name: 'CGM',
    emoji: '💧',
    keywords: ['cgm', 'c g m', 'c. g. m', 'see gm', 'sea gm', 'seagm', 'sea g m', 'see g m',
               'glucose', 'sugar', 'tir', 't i r', 'time in range', 'blood sugar', 'insights'],
    toneColor: Color(0xFF3B82F6),
    status: 'TIR 87%',
    built: true,
  ),
  Planet(
    slug: 'journey',
    name: 'Journey',
    emoji: '🗺️',
    keywords: ['journey', 'timeline', 'history', 'story', 'week', 'path'],
    toneColor: Color(0xFFA78BFA),
    status: 'Week 13',
    built: false,
  ),
  Planet(
    slug: 'coach',
    name: 'Coach',
    emoji: '👥',
    keywords: ['coach', 'message', 'session', 'chat', 'call'],
    toneColor: Color(0xFFFB7185),
    status: '2 new',
    built: false,
  ),
  Planet(
    slug: 'care-circle',
    name: 'Care Circle',
    emoji: '💗',
    keywords: ['care circle', 'care', 'family', 'circle', 'loved', 'spouse', 'kids'],
    toneColor: Color(0xFFF472B6),
    status: '3 members',
    built: false,
  ),
  Planet(
    slug: 'learn',
    name: 'Learn',
    emoji: '📚',
    keywords: ['learn', 'lesson', 'mindful', 'teach', 'class', 'eat'],
    toneColor: Color(0xFF22D3EE),
    status: 'Mindful eating',
    built: false,
  ),
  Planet(
    slug: 'rewards',
    name: 'Rewards',
    emoji: '🏆',
    keywords: ['rewards', 'reward', 'badges', 'badge', 'credits', 'credit', 'achievement', 'trophy', 'streak'],
    toneColor: Color(0xFFC89A3B),
    status: 'Platinum',
    built: false,
  ),
  Planet(
    slug: 'progress',
    name: 'Progress',
    emoji: '📈',
    keywords: ['progress', 'trend', 'month', 'improvement'],
    toneColor: Color(0xFF10B981),
    status: '+3 TIR pts',
    built: false,
  ),
];

Planet planetBySlug(String slug) =>
    kPlanets.firstWhere((p) => p.slug == slug, orElse: () => kPlanets.first);

class ParsedIntent {
  final String transcript;
  final String cleaned;
  final Planet? target;
  final String? route;
  final bool matched;
  final String reason;
  final double confidence;
  final String? followUpKey;

  const ParsedIntent({
    required this.transcript,
    required this.cleaned,
    this.target,
    this.route,
    required this.matched,
    required this.reason,
    required this.confidence,
    this.followUpKey,
  });

  factory ParsedIntent.unmatched(String transcript, String cleaned, String reason) => ParsedIntent(
        transcript: transcript,
        cleaned: cleaned,
        target: null,
        route: null,
        matched: false,
        reason: reason,
        confidence: 0.0,
        followUpKey: null,
      );
}

// ---------- Wake-phrase tolerance ----------

const List<String> _nuAliases = [
  'nu', 'new', 'no', 'noo', 'nue', 'nyu', 'know', 'knew',
  'you', 'nu.', 'new.', 'no.',
];

String _wakePattern() {
  final n = _nuAliases.map(RegExp.escape).join('|');
  return r"\b(what'?s?\s*up\s+(" + n + r")|whatsapp\s+(" + n + r")|hey\s+(" + n + r")|ok\s+(" + n + r")|hi\s+(" + n + r")|okay\s+(" + n + r")|hello\s+(" + n + r"))\b";
}

const Map<String, List<String>> _followUps = {
  'why-tir-drop': ['why did my tir drop', 'why did tir drop', 'what happened tuesday', 'why tuesday', 'why did my t i r drop', 'why did my sugar drop'],
  'why-long-walker': ['why long walker', 'why is long walker', 'why this playbook', 'why walker today'],
  'explain-agp': ['what is agp', 'explain agp', 'what does agp mean', 'a g p', 'agp'],
  'nu-summary': ['summary', 'summarize', 'give me a summary', 'catch me up'],
  'home': ['universe', 'home', 'back', 'main', 'go home', 'take me home', 'go back'],
  // Habitnu light-theme suggestion pills
  'why-did-i-spike': ['why did i spike', 'why did i spike today', 'why the spike', 'explain my spike', 'why the peak'],
  'log-lunch': ['log my lunch', 'log lunch', 'log my meal', 'save lunch', 'add lunch'],
  'what-should-i-do': ['what should i do', 'what next', 'what now', 'suggest something', 'help me decide'],
  'snap-meal': ['snap meal', 'take a picture', 'take a photo', 'snap my meal', 'photo meal'],
};

class IntentParser {
  static ParsedIntent parse(String raw) {
    final transcript = raw.trim();
    // Track cleaned form for debugging.
    var cleaned = raw
        .toLowerCase()
        .replaceAll(RegExp(_wakePattern(), caseSensitive: false), ' ')
        .replaceAll(RegExp(r'\b(nu|new|no|nue|nyu|know|knew)[,\s]+',
            caseSensitive: false), ' ')
        .replaceAll(RegExp(
            r'\b(please\s+)?(open|show(\s+me)?|take\s+me\s+to|take\s+me|go\s+to|find|jump\s+to|switch\s+to)\s+',
            caseSensitive: false), ' ')
        .replaceAll(RegExp(r'[,.!?]'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();

    if (cleaned.isEmpty) {
      return ParsedIntent.unmatched(transcript, cleaned, 'empty after cleaning');
    }

    // Follow-up phrases take priority.
    for (final entry in _followUps.entries) {
      for (final phrase in entry.value) {
        if (cleaned.contains(phrase)) {
          if (entry.key == 'home') {
            return ParsedIntent(
              transcript: transcript,
              cleaned: cleaned,
              route: '/',
              matched: true,
              reason: 'home',
              confidence: 0.95,
            );
          }
          return ParsedIntent(
            transcript: transcript,
            cleaned: cleaned,
            matched: true,
            reason: 'follow-up "$phrase"',
            confidence: 0.9,
            followUpKey: entry.key,
          );
        }
      }
    }

    // Planet keyword match — longest wins.
    Planet? best;
    String? bestKw;
    int bestScore = 0;
    for (final p in kPlanets) {
      for (final kw in p.keywords) {
        if (cleaned.contains(kw) && kw.length > bestScore) {
          best = p;
          bestKw = kw;
          bestScore = kw.length;
        }
      }
    }

    if (best != null) {
      return ParsedIntent(
        transcript: transcript,
        cleaned: cleaned,
        target: best,
        route: best.route,
        matched: true,
        reason: 'matched "$bestKw"',
        confidence: (0.7 + bestScore / 30.0).clamp(0.0, 0.98),
      );
    }

    return ParsedIntent.unmatched(transcript, cleaned, 'no keyword matched');
  }
}
