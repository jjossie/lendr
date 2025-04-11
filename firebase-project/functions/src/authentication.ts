import {logger} from "firebase-functions";
import {createUser, getUserFromUid} from "./controllers/users.controller";
import { LendrUserModelValidated } from "./models/lendrUser.model";
import { HttpsError, user } from "firebase-functions/v1/auth";

export const onUserCreate = user().onCreate(async (user) => {
  // TODO authProfileRefactoring

  if (!user) {
    logger.error("🔥onUserCreate: event.data is undefined")
    throw new HttpsError("invalid-argument", "event.data is undefined");
  }

  // Create a Lendr User if it doesn't already exist (it should)
  logger.debug(`🔥Checking for existing Lendr user ${user.uid}`);
  const lendrUser = await getUserFromUid(user.uid);
  logger.debug("🔥LendrUser object" + (lendrUser ? " found:" : "not found: "), lendrUser);
  if (!lendrUser) {
    logger.warn(`🔥Have to create Lendr User for user ${user.uid}`, user);
    await createUser(user);
  }
});

export const onUserDelete = user().onDelete(async (user) => {
  logger.debug(`🔥onUserDelete: user ${user.uid} was deleted from Auth`);
  // await deleteUser(user.uid);
  // TODO delete all the references to the user in the database? Or just leave them there? and mark the Lendr User as deleted?
  const lendrUser: LendrUserModelValidated | undefined = await getUserFromUid(user.uid);
  if (!lendrUser) {
    return;
  }
  lendrUser.displayName = "[deleted]";
});