class Validators {
  Validators._();

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$field is required';
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Enter your email address';
    }

    final emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

    if (!emailPattern.hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }

    return null;
  }

  static String? emailOrPhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Enter an email or phone number';
    }
    final isEmail = value.contains('@');
    if (isEmail && !value.contains('.')) {
      return 'Enter a valid email';
    }
    return null;
  }

  static String? phoneNumber(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Enter your phone number';
    }

    final phonePattern = RegExp(r'^\+?[0-9]{9,15}$');

    if (!phonePattern.hasMatch(value.trim())) {
      return 'Enter a valid phone number';
    }

    return null;
  }

  static String? password(String? value, {int minLength = 8}) {
    if (value == null || value.length < minLength) {
      return 'Password must be at least $minLength characters';
    }
    return null;
  }

  static String? confirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Confirm your password';
    }

    if (value != password) {
      return 'Passwords do not match';
    }

    return null;
  }

  static String? price(String? value) {
    if (value == null || value.trim().isEmpty) return 'Enter a price';
    final parsed = num.tryParse(value);
    if (parsed == null || parsed <= 0) return 'Enter a valid price';
    return null;
  }
}