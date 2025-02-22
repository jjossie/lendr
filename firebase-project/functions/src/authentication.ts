import * as functions from "firebase-functions";
import {logger} from "firebase-functions";
import {createUser, getUserFromUid} from "./controllers/users.controller";
import { LendrUser } from "./models/lendrUser.model";

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // TODO authProfileRefactoring

  // Create a Lendr User if it doesn't already exist
  logger.debug(`🔥Checking for existing Lendr user ${user.uid}`);
  const lendrUser = await getUserFromUid(user.uid);
  logger.debug("🔥LendrUser object" + (lendrUser) ? " found:" : "not found: ", lendrUser);
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
  const lendrUser: LendrUser = await getUserFromUid(user.uid);
  if (!lendrUser){
    return;
  }
  lendrUser.displayName = "[deleted]";
  
});