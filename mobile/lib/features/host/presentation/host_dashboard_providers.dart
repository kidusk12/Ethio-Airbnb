import 'package:flutter_riverpod/flutter_riverpod.dart';

enum HostDashboardTab { overview, listings, earnings, reviews }

final hostDashboardTabProvider = StateProvider<HostDashboardTab>((ref) => HostDashboardTab.overview);