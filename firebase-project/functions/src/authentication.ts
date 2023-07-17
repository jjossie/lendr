import * as functions from "firebase-functions";

export const createUser = functions.auth.user().onCreate((user) => {
  // TODO authProfileRefactoring
})