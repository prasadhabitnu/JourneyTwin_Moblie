import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../widgets/habitnu/app_bar.dart';

class LearnStub extends StatelessWidget {
  const LearnStub({super.key});
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const HabitnuAppBar(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Learn',
                    style: HText.body(size: 26, w: FontWeight.w900, c: HColors.ink)),
                Text('Tiny lessons. 90-second reads.',
                    style: HText.body(size: 13, c: HColors.inkMuted)),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.menu_book_rounded, size: 64, color: HColors.brandBlue.withOpacity(0.4)),
                  const SizedBox(height: 14),
                  Text('Lessons coming in v2',
                      style: HText.body(size: 16, w: FontWeight.w900, c: HColors.ink)),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'Micro-content on GLP-1, glucose patterns, and habits, '
                      'curated for what Sally is working on right now.',
                      textAlign: TextAlign.center,
                      style: HText.body(size: 12.5, c: HColors.inkMuted),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
