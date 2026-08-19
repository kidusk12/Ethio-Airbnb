import 'package:go_router/go_router.dart';
import '../features/admin/presentation/pages/admin_dashboard_page.dart';
import '../features/auth/presentation/pages/about_page.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/profile_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/bookings/presentation/pages/bookings_tab_page.dart';
import '../features/host/presentation/host_dashboard_page.dart';
import '../features/listings/presentation/pages/explore_page.dart';
import '../features/listings/presentation/pages/home_page.dart';
import '../features/listings/presentation/pages/listing_detail_page.dart';
import '../features/listings/presentation/pages/listing_form_page.dart';
import 'navigation/admin_shell.dart';
import 'navigation/host_shell.dart';
import 'navigation/main_shell.dart';
import 'package:flutter/material.dart';
import '../features/bookings/presentation/pages/booking_checkout_page.dart';
import '../features/listings/domain/entities/listing.dart';

/// Central route table.
///
/// Guest routes:
/// - `/home`, `/explore`, `/bookings`, `/profile`
///
/// Host routes:
/// - `/host/home`, `/host/profile`
///
/// Admin routes:
/// - `/admin/dashboard`, `/admin/profile`
///
/// Auth routes:
/// - `/login`, `/register`
///
/// Static / Info routes:
/// - `/about`, `/help`, `/legal/terms`
///
/// Account routes:
/// - `/account/personal-info`, `/account/login-security`
final GoRouter appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    // Authentication screens — outside bottom-navigation shells.
    GoRoute(
      path: '/register',
      builder: (context, state) {
        final requestedRole = state.uri.queryParameters['role'];
        return RegisterPage(
          initialRole: requestedRole == 'host' ? 'host' : 'guest',
          returnTo: state.uri.queryParameters['returnTo'],
        );
      },
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) {
        return LoginPage(returnTo: state.uri.queryParameters['returnTo']);
      },
    ),

    // Info and legal routes
    GoRoute(path: '/about', builder: (context, state) => const AboutPage()),
    // Guest application shell.
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainShell(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomePage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/explore',
              builder: (context, state) => const ExplorePage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/bookings',
              builder: (context, state) => const BookingsTabPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfilePage(),
            ),
          ],
        ),
      ],
    ),

    // Host application shell.
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return HostShell(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/host/home',
              builder: (context, state) => const HostDashboardPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/host/profile',
              builder: (context, state) => const ProfilePage(),
            ),
          ],
        ),
      ],
    ),

    // Admin application shell.
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return AdminShell(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/admin/dashboard',
              builder: (context, state) => const AdminDashboardPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/admin/profile',
              builder: (context, state) => const ProfilePage(),
            ),
          ],
        ),
      ],
    ),

    GoRoute(
      path: '/host/list',
      builder: (context, state) => const ListingFormPage(),
    ),

    // Opens above navigation shells, with back button and no bottom nav.
    GoRoute(
      path: '/listings/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'];
        return ListingDetailPage(listingId: id);
      },
    ),
    GoRoute(
      path: '/test/booking-checkout',
      builder: (context, state) {
        final testListing = Listing(
          id: 'test-listing',
          title: 'Test Apartment',
          category: 'Apartment',
          neighborhood: 'Bole',
          city: 'Addis Ababa',
          pricePerNight: 2500,
          photoUrl: '',
          rating: 4.8,
          reviewCount: 24,
          bathrooms: 1,
          amenities: const ['Wi-Fi', 'Kitchen', 'Parking'],
          hostName: 'Kidus Kidnaewold',
          hostDetails: 'Verified Host',
          description: 'Test property for booking checkout.',
          maxGuests: 4,
          images: const [],
        );

        final testDateRange = DateTimeRange(
          start: DateTime.now().add(const Duration(days: 1)),
          end: DateTime.now().add(const Duration(days: 3)),
        );

        return BookingCheckoutPage(
          listing: testListing,
          initialDateRange: testDateRange,
          initialTotalAmount: 5000,
          initialNights: 2,
        );
      },
    ),
  ],
);
