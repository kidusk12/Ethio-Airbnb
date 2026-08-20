/// Shared validators for `TextFormField.validator`. Add new ones here
/// instead of writing inline validation logic inside a page (guide §5.6).
class Validators {
  Validators._();

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$field is required';
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

  static String? password(String? value, {int minLength = 8}) {
    if (value == null || value.length < minLength) {
      return 'Password must be at least $minLength characters';
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