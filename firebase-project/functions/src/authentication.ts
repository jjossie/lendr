import {logger} from "firebase-functions";
import {createUser, getUserFromUid} from "./controllers/users.controller";
import { LendrUserInput, LendrUserValidated } from "./models/lendrUser.model";
import { beforeUserCreated, HttpsError } from "firebase-functions/v2/identity";

const functions = require("firebase-functions");


export const onUserCreate = beforeUserCreated(async (event) => {
  // TODO authProfileRefactoring

  const user = event.data;

  if (!user) {
    logger.error("🔥onUserCreate: event.data is undefined")
    throw new HttpsError("invalid-argument", "event.data is undefined");
  }

  // Create a Lendr User if it doesn't already exist
  logger.debug(`🔥Checking for existing Lendr user ${user.uid}`);
  const lendrUser = await getUserFromUid(user.uid);
  logger.debug("🔥LendrUser object" + (lendrUser ? " found:" : "not found: "), lendrUser);
  if (lendrUser) return;

  logger.debug(`🔥Creating Lendr User for user ${user.uid}`);
  logger.debug(`🔥Name: ${user.displayName}`);
  logger.debug(`🔥PhotoURL: ${user.photoURL}`);
  logger.debug(`🔥Email: ${user.email}`);
  await createUser(user);
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  logger.debug(`🔥onUserDelete: user ${user.uid} was deleted from Auth`);
  // await deleteUser(user.uid);
  // TODO delete all the references to the user in the database? Or just leave them there? and mark the Lendr User as deleted?
  const lendrUser: LendrUserValidated | undefined = await getUserFromUid(user.uid);
  if (!lendrUser) {
    return;
  }
  lendrUser.displayName = "[deleted]";
});