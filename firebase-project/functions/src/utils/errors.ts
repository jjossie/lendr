export class LendrBaseError extends Error {
  constructor(message?: string) {
    super("⚠️🛠🔥Lendr Error 🔥🛠⚠️ " + (message ?? "Unknown error. 🤔"));
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
  constructor(message?: string, object?: object) {
    super(message ?? "Object missing one or more required properties. 👻");
    console.log("⚠️🛠Invalid Object 🛠⚠️", object);
    this.name = "ObjectValidationError";
  }
}

export class NotImplementedError extends LendrBaseError {
  constructor(message?: string) {
    super(message ?? "Function Not Implemented 🤡");
    this.name = "NotImplementedError";
  }
}

export class FirestoreNotInitializedError extends LendrBaseError {
  constructor(message?: string) {
    super(message ?? "Firebase Firestore Not Initialized 🔥");
    this.name = "FirestoreNotInitializedError";
  }
}