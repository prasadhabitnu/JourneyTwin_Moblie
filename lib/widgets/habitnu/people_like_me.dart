import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';
import '../../data/models/social_and_predictions.dart';

class PeopleLikeMeCard extends StatelessWidget {
  final Cohort cohort;
  const PeopleLikeMeCard({super.key, required this.cohort});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: HColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: HColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('PEOPLE LIKE ME',
              style: HText.eyebrow(c: HColors.brandBlue)),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: HColors.brandBlue.withOpacity(0.12),
                ),
                child: Icon(Icons.people_rounded, size: 20, color: HColors.brandBlue),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(cohort.cohortLabel,
                        style: HText.body(size: 12.5, w: FontWeight.w600, c: HColors.ink)),
                    const SizedBox(height: 6),
                    Text(
                      'Age ${cohort.ageRange} · ${cohort.similarity.join(" · ")}',
                      style: HText.body(size: 10.5, w: FontWeight.w600, c: HColors.inkMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('What worked for them',
                        style: HText.body(size: 11, w: FontWeight.w800, c: HColors.inkMuted)),
                    const SizedBox(height: 4),
                    ...cohort.whatWorked.map((s) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            children: [
                              Icon(Icons.check_circle_outline_rounded,
                                  size: 13, color: HColors.success),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(s,
                                    style: HText.body(
                                        size: 11.5, w: FontWeight.w600, c: HColors.ink)),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Results in 30 days',
                        style: HText.body(size: 11, w: FontWeight.w800, c: HColors.inkMuted)),
                    const SizedBox(height: 4),
                    _kpi('${cohort.spikeReductionPct}%', 'Fewer spikes'),
                    _kpi('${cohort.weightLossLbs} lbs',  'Weight lost'),
                    _kpi('${cohort.tirImprovementPts}%', 'More time in range'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(0, 30),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('See their full story',
                      style: HText.body(size: 12, w: FontWeight.w800, c: HColors.brandBlue)),
                  Icon(Icons.chevron_right_rounded, size: 16, color: HColors.brandBlue),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kpi(String big, String label) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          children: [
            Icon(Icons.arrow_downward_rounded, size: 12, color: HColors.success),
            const SizedBox(width: 3),
            Text(big,
                style: HText.body(size: 13, w: FontWeight.w900, c: HColors.success)),
            const SizedBox(width: 4),
            Flexible(
              child: Text(label,
                  overflow: TextOverflow.ellipsis,
                  style: HText.body(size: 10.5, w: FontWeight.w600, c: HColors.inkMuted)),
            ),
          ],
        ),
      );
}
