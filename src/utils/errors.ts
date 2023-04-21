export class LendrBaseError extends Error {
  constructor(message?: string) {
    super("⚠️🛠Lendr Error 🛠⚠️ " + message ?? "");
  }
}


export class AuthError extends LendrBaseError {
  constructor(message?: string) {
    super(message ?? "Must be logged in. 🫠");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends LendrBaseError {
  constructor(message?: string) {
    super(message ?? "Not found in Firestore DB. 🙀");
    this.name = "NotFoundError";
  }
}

export class ObjectValidationError extends LendrBaseError {
  constructor(message?: string) {
    super(message ?? "Object missing one or more required properties. 👻");
    this.name = "NotFoundError";
  }
}