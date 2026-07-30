import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../theme/habitnu_theme.dart';
import '../../widgets/habitnu/app_bar.dart';
import '../../ui_mode.dart';
import '../../app.dart' as nu_universe_app;

/// Settings / More tab. Contains the UI-mode toggle back to the dark Nu Universe.
class MoreScreen extends StatefulWidget {
  const MoreScreen({super.key});
  @override
  State<MoreScreen> createState() => _MoreScreenState();
}

class _MoreScreenState extends State<MoreScreen> {
  static const _buildStamp = 'v1.0.0 · habitnu-light';

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        children: [
          const HabitnuAppBar(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('More',
                    style: HText.body(size: 26, w: FontWeight.w900, c: HColors.ink)),
                Text('Settings, preferences, demo controls.',
                    style: HText.body(size: 13, c: HColors.inkMuted)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _SectionCard(
            title: 'Demo controls',
            children: [
              _row(
                icon: Icons.brightness_2_outlined,
                title: 'Switch to Nu Universe (v1)',
                subtitle: 'Dark planetary launcher. Voice-first navigation.',
                trailing: FilledButton(
                  onPressed: () => _switchMode(context, UiMode.nuUniverse),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF0B0E1F),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  child: const Text('Switch'),
                ),
              ),
              _row(
                icon: Icons.info_outline_rounded,
                title: 'Build',
                subtitle: _buildStamp,
              ),
            ],
          ),
          const SizedBox(height: 12),
          _SectionCard(
            title: 'Account (coming in v2)',
            children: [
              _row(icon: Icons.person_outline_rounded,   title: 'Profile',       subtitle: 'Sally · Age 52 · Female'),
              _row(icon: Icons.medication_outlined,       title: 'Program',       subtitle: 'GLP-1 · Week 13'),
              _row(icon: Icons.favorite_border_rounded,   title: 'Care Circle',   subtitle: '3 members invited'),
              _row(icon: Icons.chat_bubble_outline_rounded, title: 'Coach',       subtitle: 'Maya Patel · 2 new messages'),
              _row(icon: Icons.emoji_events_outlined,     title: 'Rewards',       subtitle: 'Platinum tier'),
              _row(icon: Icons.privacy_tip_outlined,      title: 'Privacy & data',subtitle: 'HIPAA compliant'),
              _row(icon: Icons.logout_rounded,            title: 'Sign out',      subtitle: ''),
            ],
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Future<void> _switchMode(BuildContext context, UiMode mode) async {
    await UiModeStore.save(mode);
    if (!context.mounted) return;
    // Instead of restarting the app, push the Nu Universe MaterialApp on top.
    // On next cold-start, main() will read the saved mode and route natively.
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0B0E1F),
      systemNavigationBarIconBrightness: Brightness.light,
    ));
    Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const nu_universe_app.NuApp()),
      (r) => false,
    );
  }

  Widget _row({required IconData icon, required String title, required String subtitle, Widget? trailing}) =>
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: HColors.brandBlue.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 18, color: HColors.brandBlue),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title,
                      style: HText.body(size: 14, w: FontWeight.w800, c: HColors.ink)),
                  if (subtitle.isNotEmpty)
                    Text(subtitle,
                        style: HText.body(size: 11.5, w: FontWeight.w500, c: HColors.inkMuted)),
                ],
              ),
            ),
            if (trailing != null) trailing else Icon(Icons.chevron_right_rounded, color: HColors.inkMuted),
          ],
        ),
      );
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _SectionCard({required this.title, required this.children});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: HColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: HColors.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
              child: Text(title.toUpperCase(),
                  style: HText.eyebrow(c: HColors.brandBlue)),
            ),
            ...List.generate(children.length * 2 - 1, (i) {
              if (i.isOdd) return const Divider(height: 1, color: HColors.line);
              return children[i ~/ 2];
            }),
          ],
        ),
      ),
    );
  }
}
