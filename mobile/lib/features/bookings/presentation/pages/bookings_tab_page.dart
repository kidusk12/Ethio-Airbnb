import 'package:flutter/material.dart';

/// Bookings tab placeholder — FR-4.4 / my-bookings, host-bookings. Will
/// branch on the logged-in user's role (guest → my bookings, host → host
/// bookings) once auth state + the bookings feature are wired in.
class BookingsTabPage extends StatelessWidget {
  const BookingsTabPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bookings')),
      body: const Center(child: Text('Your bookings will show up here')),
    );
  }
}
