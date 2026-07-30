import 'package:flutter/material.dart';

import '../../theme/habitnu_theme.dart';

/// Glossy card with a gold gradient border and subtle inner sheen.
/// Use for hero cards (Best Path, Health Compass, key CGM).
///
/// Structure:
///   [outer gradient rounded rectangle]
///     [inner white surface with slight top-highlight]
///       [child]
class GoldCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final double borderWidth;
  final EdgeInsetsGeometry margin;
  const GoldCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(14),
    this.radius = 18,
    this.borderWidth = 1.6,
    this.margin = const EdgeInsets.symmetric(horizontal: 16),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: EdgeInsets.all(borderWidth),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFF6D77E), // light gold
            Color(0xFFC89A3B), // deep gold
            Color(0xFFE8C874), // light gold echo
            Color(0xFFB07E28), // burnt gold
          ],
          stops: [0.0, 0.4, 0.75, 1.0],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFC89A3B).withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius - borderWidth),
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFFFFFF),
              Color(0xFFFDFCF6), // near-white with warm tint
              Color(0xFFFFFFFF),
            ],
            stops: [0.0, 0.35, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Top-left specular highlight
            Positioned(
              top: 0, left: 0, right: 0,
              child: Container(
                height: 40,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(radius - borderWidth),
                    topRight: Radius.circular(radius - borderWidth),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      const Color(0xFFF6D77E).withOpacity(0.14),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Padding(padding: padding, child: child),
          ],
        ),
      ),
    );
  }
}

/// Same idea but with a color-tinted border (for compass segments in the
/// insights panel below the compass).
class TintCard extends StatelessWidget {
  final Widget child;
  final Color tint;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final double radius;
  const TintCard({
    super.key,
    required this.child,
    required this.tint,
    this.padding = const EdgeInsets.all(14),
    this.margin = const EdgeInsets.symmetric(horizontal: 16),
    this.radius = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: const EdgeInsets.all(1.2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [tint.withOpacity(0.85), tint.withOpacity(0.35)],
        ),
        boxShadow: [
          BoxShadow(
            color: tint.withOpacity(0.10),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius - 1.2),
          color: HColors.surface,
        ),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}
