import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// Custom refinement to validate FieldValue or Timestamp
export const timestampSchema = z.any().refine(
    (value) =>
      value instanceof Timestamp || value === FieldValue.serverTimestamp(),
    {
      message: "Must be a Firestore Timestamp or FieldValue.serverTimestamp()",
    }
  );