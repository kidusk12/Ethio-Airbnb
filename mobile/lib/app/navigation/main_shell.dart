import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import '../theme/app_colors.dart';

class MainShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated =
        ref.watch(authControllerProvider) is AuthSuccess;

    // Router branch indexes:
    // 0 = Home, 1 = Explore, 2 = Bookings, 3 = Profile.
    final visibleBranchIndexes =
        isAuthenticated ? const [0, 1, 2, 3] : const [0, 1, 3];

    final selectedIndex =
        visibleBranchIndexes.indexOf(navigationShell.currentIndex);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex == -1 ? 0 : selectedIndex,
        onDestinationSelected: (visibleIndex) {
          navigationShell.goBranch(
            visibleBranchIndexes[visibleIndex],
            initialLocation:
                visibleBranchIndexes[visibleIndex] ==
                    navigationShell.currentIndex,
          );
        },
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primaryLight,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Explore',
          ),
          if (isAuthenticated)
            const NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined),
              selectedIcon: Icon(Icons.calendar_today),
              label: 'Bookings',
            ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}