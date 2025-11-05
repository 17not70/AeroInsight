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
      router.push("/login");
    }
  }, [user, loading, router]);

  // --- Form State ---
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Flight Ops"); // Default value
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      setSubmitError("You must be logged in to submit a report.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create a new report object
      const newReport = {
        type: "VSR",
        reporter_id: user.uid,
        reporter_email: user.email,
        status: "New",
        eventDate: eventDate,
        description: description,
        category: category,
        createdAt: serverTimestamp(), // Adds a server-side timestamp
      };

      // 2. Get a reference to the 'reports' collection
      const reportsCollection = collection(firestore, "reports");

      // 3. Add the new document
      await addDoc(reportsCollection, newReport);

      // 4. Success! Redirect to the dashboard
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
            style={{ width: "100%", padding: "8px", color: "black" }}
          />
        </div>

        {/* Category */}
        <div style={{ margin: "20px 0" }}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", color: "black" }}
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
            style={{ width: "100%", padding: "8px", color: "black", fontFamily: "sans-serif" }}
          />
        </div>

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