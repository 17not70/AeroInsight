// functions/src/index.ts
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function: calculateinitialrisk (v2)
 * Triggers whenever a new report is created in the 'reports' collection.
 * Logic: Assigns Extreme Risk (5E) by default for mandatory Safety Officer review.
 */
export const calculateinitialrisk = onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.info("No data found in event payload.");
      return;
    }

    // Assign the highest risk level to flag for immediate review
    const updateData = {
      // NOTE: These fields will be reassessed (overwritten) by the Safety Officer
      severity: 5,        // Catastrophic
      probability: "E",   // Frequent
      riskScore: "5E",    // Highest possible risk score
      riskLevel: "Extreme", // Highest possible risk level
      dateSubmitted: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await snapshot.ref.update(updateData);
      logger.log(
        `Assigned Extreme Risk (5E) to new report ${snapshot.id} for safety review.`,
      );
    } catch (error) {
      logger.error(
        `Error updating report ${snapshot.id} with initial risk:`,
        error,
      );
    }
  },
);