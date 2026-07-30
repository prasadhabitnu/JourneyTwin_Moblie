import 'package:flutter/material.dart';

import 'theme/habitnu_theme.dart';
import 'screens/habitnu/home_screen.dart';
import 'screens/habitnu/learn_stub.dart';
import 'screens/habitnu/progress_stub.dart';
import 'screens/habitnu/more_screen.dart';

/// New light-theme Habitnu shell.
/// Bottom-nav app with 4 tabs: Home / Learn / Progress / More.
class HabitnuApp extends StatelessWidget {
  const HabitnuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Habitnu',
      debugShowCheckedModeBanner: false,
      theme: buildHabitnuTheme(),
      home: const HabitnuShell(),
    );
  }
}

class HabitnuShell extends StatefulWidget {
  const HabitnuShell({super.key});
  @override
  State<HabitnuShell> createState() => _HabitnuShellState();
}

class _HabitnuShellState extends State<HabitnuShell> {
  int _tabIndex = 0;

  static const _tabs = <Widget>[
    HomeScreen(),
    LearnStub(),
    ProgressStub(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HColors.bg,
      body: IndexedStack(index: _tabIndex, children: _tabs),
      bottomNavigationBar: _BottomNav(
        index: _tabIndex,
        onSelect: (i) => setState(() => _tabIndex = i),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final int index;
  final ValueChanged<int> onSelect;
  const _BottomNav({required this.index, required this.onSelect});

  static const _items = [
    (label: 'Home', icon: Icons.home_rounded),
    (label: 'Learn', icon: Icons.menu_book_rounded),
    (label: 'Progress', icon: Icons.show_chart_rounded),
    (label: 'More', icon: Icons.more_horiz_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: HColors.surface,
        border: Border(top: BorderSide(color: HColors.line, width: 1)),
      ),
      padding: const EdgeInsets.only(top: 4, bottom: 6),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(_items.length, (i) {
            final active = i == index;
            final it = _items[i];
            final c = active ? HColors.brandBlue : HColors.inkMuted;
            return GestureDetector(
              onTap: () => onSelect(i),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(it.icon, size: 22, color: c),
                    const SizedBox(height: 2),
                    Text(it.label,
                        style: HText.body(
                            size: 11, w: FontWeight.w700, c: c)),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
