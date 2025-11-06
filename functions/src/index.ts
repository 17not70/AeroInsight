import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function: calculateinitialrisk (v2)
 * Triggers whenever a new report is created in the 'reports' collection.
 * Default assigns "Extreme (5E)" risk for immediate review.
 */
export const calculateinitialrisk = onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No data found in event payload.");
      return;
    }

    const data = snapshot.data();
    if (data?.severity || data?.probability) {
      logger.info(
        `Report ${snapshot.id} already contains risk data. Skipping.`
      );
      return;
    }

    const updateData = {
      severity: 5, // Catastrophic
      probability: "E", // Frequent
      riskScore: "5E", // Highest possible risk
      riskLevel: "Extreme",
      reviewRequired: true,
      dateSubmitted: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await snapshot.ref.update(updateData);
      logger.info(
        `Report ${snapshot.id}: Default Extreme Risk (5E) assigned.`
      );
    } catch (error) {
      logger.error(`Error updating report ${snapshot.id}:`, error);
    }
  }
);
