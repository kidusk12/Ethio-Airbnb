/// Minimal Result wrapper so usecases/repositories don't need a dependency
/// like dartz just to express "success or failure".
sealed class Result<T> {
  const Result();

  R fold<R>(R Function(String message) onFailure, R Function(T value) onSuccess) {
    final self = this;
    if (self is Success<T>) return onSuccess(self.value);
    if (self is Failure<T>) return onFailure(self.message);
    throw StateError('Unknown Result subtype');
  }

  bool get isSuccess => this is Success<T>;
}

class Success<T> extends Result<T> {
  final T value;
  const Success(this.value);
}

class Failure<T> extends Result<T> {
  final String message;
  const Failure(this.message);
}