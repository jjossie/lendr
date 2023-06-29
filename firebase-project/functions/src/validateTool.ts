import {onDocumentWritten} from "firebase-functions/v2/firestore";


export const validateTool = onDocumentWritten("/tools/{toolId}", (event) => {

  /**
   * Validation
   */

  // Ensure all required fields are populated: [name, description, lenderId, imageUrls[0], preferences, rate, location.lat, location.lon]

  // Trim strings for whitespace

  /**
   * Hydration
   */

  // Check lenderId and hydrate lender object accordingly

  // Check holderId and hydrate holder object accordingly

  // Check location geopoint and hydrate geopoint and city accordingly



});