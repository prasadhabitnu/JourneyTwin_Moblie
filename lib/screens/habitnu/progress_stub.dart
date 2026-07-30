import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../widgets/habitnu/app_bar.dart';

class ProgressStub extends StatelessWidget {
  const ProgressStub({super.key});
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
                Text('Progress',
                    style: HText.body(size: 26, w: FontWeight.w900, c: HColors.ink)),
                Text('Where you\'ve been. Where you\'re heading.',
                    style: HText.body(size: 13, c: HColors.inkMuted)),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.show_chart_rounded, size: 64, color: HColors.brandBlue.withOpacity(0.4)),
                  const SizedBox(height: 14),
                  Text('Progress detail coming in v2',
                      style: HText.body(size: 16, w: FontWeight.w900, c: HColors.ink)),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'Full timeline of Momentum, Weight, Glucose, Sleep and Stress. '
                      'Filter by week, month, and program milestones.',
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
