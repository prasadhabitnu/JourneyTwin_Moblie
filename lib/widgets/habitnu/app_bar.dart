import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';

/// Habitnu top bar — sprout logo left, bell + circular avatar right.
class HabitnuAppBar extends StatelessWidget {
  final String initials;
  final int notificationCount;
  const HabitnuAppBar({super.key, this.initials = 'S', this.notificationCount = 1});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 16, 6),
      child: Row(
        children: [
          Row(
            children: [
              Text('habitnu',
                  style: HText.body(size: 22, w: FontWeight.w900, c: HColors.ink)),
              const SizedBox(width: 2),
              Icon(Icons.eco_rounded, size: 16, color: HColors.brandGreen),
            ],
          ),
          const Spacer(),
          Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(Icons.notifications_none_rounded, size: 26, color: HColors.ink),
              if (notificationCount > 0)
                Positioned(
                  right: -2, top: -2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: HColors.danger,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$notificationCount',
                      style: const TextStyle(
                        color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: HColors.brandBlue,
            ),
            alignment: Alignment.center,
            child: Text(initials,
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
          ),
        ],
      ),
    );
  }
}
