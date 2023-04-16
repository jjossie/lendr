export class AuthError extends Error {
  constructor(message?: string) {
    super(message ?? "Must be logged in. 🫠");
    this.name = "AuthenticationError";
  }
}