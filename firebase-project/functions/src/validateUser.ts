import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { lendrUserInputSchema, LendrUserInputValidated, lendrUserModelSchema } from "./models/lendrUser.model";
import { ObjectValidationError } from "./utils/errors";
import { FieldValue } from "firebase-admin/firestore";

export const validateUser = onDocumentCreated("/users/{userId}", async (event) => {
  if (!event.data) {
    throw new ObjectValidationError("No data in event", {});
  }

  logger.info("Validating new user document: ", event.params.userId);

  // Validate the user document against the schema
  const parsedUser = lendrUserInputSchema.safeParse(event.data.data());
  if (!parsedUser.success) {
    logger.error("Invalid user document: ", parsedUser.error);
    throw new ObjectValidationError("Invalid user data", parsedUser.error);
  }

  logger.info("Successfully validated user document: ", event.params.userId);

  // Optionally, you can modify or enrich the document here if needed
  const validatedUser: LendrUserInputValidated = parsedUser.data;

  const enrichedUser = lendrUserModelSchema.safeParse({
    ...validatedUser,
    displayName: validatedUser.displayName || `${validatedUser.firstName} ${validatedUser.lastName}`,
    createdAt: FieldValue.serverTimestamp(),
  })

  // Write the validated user document back to Firestore
  try {
    await event.data.ref.set(enrichedUser, { merge: false });
    logger.info("User document successfully validated and saved: ", event.params.userId);
  } catch (error) {
    logger.error("Error saving validated user document: ", event.params.userId, error);
    throw error;
  }
});
