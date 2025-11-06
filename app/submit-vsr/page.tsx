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
  const [category, setCategory] = useState("Flight Operations");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
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
      let reportData: any = {
        type: "VSR",
        status: "New",
        eventDate: eventDate,
        description: description,
        category: category,
        createdAt: serverTimestamp(),
        isAnonymous: isAnonymous,
        
        // **IMPORTANT:** We are NOT sending severity/probability from the form.
      };

      if (isAnonymous) {
        reportData.reporter_id = "anonymous";
        reportData.reporter_email = "anonymous";
      } else {
        reportData.reporter_id = user.uid;
        reportData.reporter_email = user.email;
        if (contactEmail.trim() !== "") {
          reportData.contactEmail = contactEmail.trim();
        }
      }

      const reportsCollection = collection(firestore, "reports");
      await addDoc(reportsCollection, reportData);

      alert("Report submitted successfully! It is now queued for safety review.");
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error submitting report:", error);
      setSubmitError(`Failed to submit report. ${error.message}`);
    }

    setIsSubmitting(false);
  };

  // --- Render Logic ---
  if (loading || !user) {
    return <div className="p-10">Loading form...</div>;
  }

  return (
    <div className="max-w-2xl p-10 mx-auto">
      <h1 className="text-3xl font-bold">Submit Voluntary Safety Report (VSR)</h1>
      <p className="mt-2 text-zinc-400">
        Logged in as: {appUser?.name} ({appUser?.email})
      </p>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* --- FORM SECTION 1: Event Details (Reporter's ONLY job) --- */}
        <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 space-y-6">
          <h2 className="text-xl font-semibold">Event Details</h2>
          {/* Event Date */}
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium">
              Date of Event
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={{ colorScheme: "dark" }}
              className="w-full p-2 mt-1 text-black bg-white border border-zinc-300 rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 mt-1 text-black bg-white border border-zinc-300 rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            >
              <option value="Flight Operations">Flight Operations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Ground Handling">Ground Handling</option>
              <option value="Cabin Safety">Cabin Safety</option>
              <option value="Air Traffic Services">Air Traffic Services</option>
              <option value="Aerodrome / Airport Facilities">Aerodrome / Airport Facilities</option>
              <option value="Dangerous Goods">Dangerous Goods</option>
              <option value="Security (AVSEC)">Security (AVSEC)</option>
              <option value="Organization / Human Factors">Organization / Human Factors</option>
              <option value="Other / Near Miss">Other / Near Miss</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Event Description (What happened?)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full p-2 mt-1 text-black bg-white border border-zinc-300 rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-700 font-sans"
            />
          </div>
        </div>

        {/* --- FORM SECTION 2: Anonymity (No risk fields here) --- */}
        <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 mr-3"
            />
            Submit this report anonymously
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            If checked, your name and email will not be attached to this report.
          </p>
        </div>

        {/* Show contact email field ONLY if NOT anonymous */}
        {!isAnonymous && (
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium">
              Contact Email for Updates (Optional)
            </label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Leave blank to use your login email"
              className="w-full p-2 mt-1 text-black bg-white border border-zinc-300 rounded-md dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Provide an email if you want to receive acknowledgement and outcome updates.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-3 font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-zinc-500"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>

        {submitError && <p className="mt-2 text-red-500">{submitError}</p>}
      </form>
    </div>
  );
}