import 'package:flutter/foundation.dart';

import 'planets.dart';

/// A single Nu response — what to say, whether to expect a follow-up,
/// and how to act (side-effect callback owned by the screen).
class DialogNode {
  final String say;                    // What Nu speaks
  final List<String>? followUps;       // Suggested follow-up phrases
  final String? nextKey;               // Key of the next DialogNode if user says yes
  final String? actionKey;             // Side effect the screen can consume

  const DialogNode({
    required this.say,
    this.followUps,
    this.nextKey,
    this.actionKey,
  });
}

/// A dialog tree registered by a specific screen. Keyed by follow-up phrase key
/// (see planets.dart `_followUps`) or by custom yes/no acknowledgement keys.
typedef DialogTree = Map<String, DialogNode>;

/// Screen-registered scripts. Each screen calls DialogManager.register(scope, tree)
/// in initState and unregister in dispose.
class DialogManager extends ChangeNotifier {
  final Map<String, DialogTree> _scopes = {};
  String? _activeScope;
  String? _pendingNextKey; // set when Nu just spoke and expects yes/no

  String? _lastAction;
  String? get lastAction => _lastAction;
  bool get expectingYesNo => _pendingNextKey != null;

  void register(String scope, DialogTree tree) {
    _scopes[scope] = tree;
    _activeScope = scope;
  }

  void unregister(String scope) {
    _scopes.remove(scope);
    if (_activeScope == scope) _activeScope = null;
    _pendingNextKey = null;
  }

  void setActive(String? scope) {
    _activeScope = scope;
    _pendingNextKey = null;
    notifyListeners();
  }

  void consumeAction() {
    _lastAction = null;
  }

  /// Resolve a parsed intent against the active screen's dialog tree.
  /// Returns a DialogNode if there's a matching script, or null.
  ///
  /// If the manager is expecting a yes/no (i.e. Nu just asked a follow-up),
  /// affirmatives will advance to the pending next node.
  DialogNode? resolve(ParsedIntent intent) {
    final tree = _activeScope == null ? null : _scopes[_activeScope!];
    if (tree == null) return null;

    // Yes/no continuation
    if (_pendingNextKey != null) {
      final t = intent.transcript.toLowerCase();
      final yes = RegExp(r'\b(yes|yeah|yep|sure|please|go ahead|okay|ok|do it)\b').hasMatch(t);
      final no = RegExp(r'\b(no|nope|not now|skip|cancel|later)\b').hasMatch(t);
      if (yes) {
        final next = tree[_pendingNextKey!];
        _pendingNextKey = next?.nextKey;
        if (next?.actionKey != null) _lastAction = next!.actionKey;
        notifyListeners();
        return next;
      }
      if (no) {
        _pendingNextKey = null;
        notifyListeners();
        return const DialogNode(say: 'No problem. Let me know when you\'re ready.');
      }
      // Neither yes nor no — clear the pending state and fall through to
      // treat this utterance as a fresh command.
      _pendingNextKey = null;
    }

    // Follow-up key match
    if (intent.followUpKey != null && tree.containsKey(intent.followUpKey)) {
      final node = tree[intent.followUpKey]!;
      _pendingNextKey = node.nextKey;
      if (node.actionKey != null) _lastAction = node.actionKey;
      notifyListeners();
      return node;
    }

    return null;
  }
}

/// -------- Scripted dialog trees per screen --------
///
/// These are pure data. Each screen registers the relevant tree in initState.
/// Content is hand-curated for the Sandy R. demo storyline.

const DialogTree kCgmDialog = {
  'why-tir-drop': DialogNode(
    say:
        'Your Time in Range dropped on Tuesday because dinner was later than usual '
        'and higher in refined carbs. Your glucose peaked at 178 around 9 PM. '
        'Want me to walk you through the timeline?',
    followUps: ['yes, walk me through', 'no thanks'],
    nextKey: 'walk-tuesday',
  ),
  'walk-tuesday': DialogNode(
    say:
        'Okay. Tuesday: 7 AM oatmeal held you flat. Lunch at noon was the salad-and-'
        'chicken bowl — stayed in range. Then at 8:30 PM you had pasta and garlic '
        'bread. Peak of 178 at 9:15, back down to 145 by 11. The Long Walker '
        'profile would have kept this dinner under 150 with a 20-minute walk after.',
    actionKey: 'scroll-to-tuesday',
  ),
  'explain-agp': DialogNode(
    say:
        'AGP stands for Ambulatory Glucose Profile. It overlays your last two weeks '
        'of glucose readings on a single 24-hour clock, so you can see when highs '
        'and lows tend to happen. The shaded bands show the middle 50 percent and '
        'middle 90 percent of readings for each hour of the day.',
  ),
  'nu-summary': DialogNode(
    say:
        'You\'re at 87 percent Time in Range this week, up 3 points from last week. '
        'Your best day was Sunday. Your rockiest day was Tuesday. Overall trend: '
        'improving, and your Long Walker playbook is working.',
  ),
};

const DialogTree kTodayDialog = {
  'why-long-walker': DialogNode(
    say:
        'Long Walker is your top playbook today because on three previous days when '
        'you took a walk after dinner, your Time in Range hit 92 percent or higher. '
        'The pattern is strongest when the walk is at least 20 minutes and starts '
        'within an hour of your last bite. Want me to schedule a reminder for '
        'tonight?',
    followUps: ['yes please', 'no thanks'],
    nextKey: 'schedule-walk-reminder',
  ),
  'schedule-walk-reminder': DialogNode(
    say: 'Done. I\'ll nudge you at 7:45 PM tonight for a Long Walker session.',
    actionKey: 'toast-reminder-set',
  ),
  'nu-summary': DialogNode(
    say:
        'Today\'s playbook is Long Walker. Your Care Circle checked in this morning. '
        'You have one lesson pending from your coach, and your glucose is holding '
        'steady this morning at 108.',
  ),
};
