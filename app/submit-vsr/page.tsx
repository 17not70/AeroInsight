// app/submit-vsr/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { auth, firestore } from "../firebase.config";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function SubmitVSRPage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  // --- Page Protection ---
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // User must be logged in to access this page
    }
  }, [user, loading, router]);

  // --- Form State ---
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Flight Ops");
  
  // --- NEW STATE for Anonymity ---
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  // --- END NEW STATE ---

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!user) { // This check is a safeguard
      setSubmitError("You must be logged in to submit a report.");
      return;
    }

    setIsSubmitting(true);

    try {
      // --- NEW LOGIC for Anonymity ---
      // 1. Create a base report object
      let reportData: any = {
        type: "VSR",
        status: "New",
        eventDate: eventDate,
        description: description,
        category: category,
        createdAt: serverTimestamp(),
        isAnonymous: isAnonymous, // Store the user's choice
      };

      // 2. Add user info ONLY if not anonymous
      if (isAnonymous) {
        reportData.reporter_id = "anonymous";
        reportData.reporter_email = "anonymous";
      } else {
        reportData.reporter_id = user.uid;
        reportData.reporter_email = user.email;
        // Only add contact email if they provided one
        if (contactEmail.trim() !== "") {
          reportData.contactEmail = contactEmail.trim();
        }
      }
      // --- END NEW LOGIC ---

      // 3. Get a reference to the 'reports' collection
      const reportsCollection = collection(firestore, "reports");

      // 4. Add the new document
      await addDoc(reportsCollection, reportData);

      // 5. Success! Redirect to the dashboard
      alert("Report submitted successfully!");
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error submitting report:", error);
      setSubmitError(`Failed to submit report. ${error.message}`);
    }

    setIsSubmitting(false);
  };

  // --- Render Logic ---
  if (loading || !user) {
    return <div>Loading form...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h1>Submit Voluntary Safety Report (VSR)</h1>
      <p>Logged in as: {appUser?.name} ({appUser?.email})</p>
      
      <form onSubmit={handleSubmit}>
        {/* Event Date */}
        <div style={{ margin: "20px 0" }}>
          <label>Date of Event</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", background: "#222", border: "1px solid #555" }}
          />
        </div>

        {/* Category */}
        <div style={{ margin: "20px 0" }}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", background: "#222", border: "1px solid #555" }}
          >
            <option value="Flight Ops">Flight Ops</option>
            <option value="Ground Handling">Ground Handling</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cabin Safety">Cabin Safety</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div style={{ margin: "20px 0" }}>
          <label>Event Description (What happened?)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            style={{ width: "100%", padding: "8px", fontFamily: "sans-serif", background: "#222", border: "1px solid #555" }}
          />
        </div>

        {/* --- NEW ANONYMITY SECTION --- */}
        <div style={{ margin: "20px 0", background: "#333", padding: "10px", borderRadius: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.g.target.checked)}
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            />
            Submit this report anonymously
          </label>
          <p style={{ fontSize: "12px", color: "#ccc", marginTop: "5px" }}>
            If checked, your name and email will not be attached to this report.
          </p>
        </div>

        {/* Show contact email field ONLY if NOT anonymous */}
        {!isAnonymous && (
          <div style={{ margin: "20px 0" }}>
            <label>Contact Email for Updates (Optional)</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Leave blank to use your login email"
              style={{ width: "100%", padding: "8px", background: "#222", border: "1px solid #555" }}
            />
            <p style={{ fontSize: "12px", color: "#ccc", marginTop: "5px" }}>
              Provide an email if you want to receive acknowledgement and outcome updates.
            </p>
          </div>
        )}
        {/* --- END NEW SECTION --- */}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ padding: "10px 20px", cursor: "pointer", background: "blue", color: "white", border: "none" }}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>

        {submitError && <p style={{ color: "red", marginTop: "10px" }}>{submitError}</p>}
      </form>
    </div>
  );
}