// app/submit-vsr/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase.config"; // Ensure correct path
import { useAuth } from "../AuthContext"; // Ensure correct path

// Define the required fields for the VSR form submission
interface VSRData {
  eventDate: string;
  category: string;
  description: string;
  isAnonymous: boolean;
}

export default function SubmitVSRPage() {
  const { user, appUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<VSRData>({
    eventDate: "",
    category: "",
    description: "",
    isAnonymous: false,
  });
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Page Protection ---
  if (!authLoading && !user) {
    router.push("/login");
    return <p className="p-10 text-white">Redirecting to login...</p>;
  }
  
  if (authLoading) {
    return <p className="p-10 text-white">Loading user session...</p>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Special handling for checkbox
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus("loading");
    setErrorMessage(null);

    // Initial data structure for Firestore
    const newReport = {
      ...formData,
      // Reporter details linked to the authenticated user
      reporter_id: user?.uid,
      reporter_email: formData.isAnonymous ? "Anonymous" : appUser?.email || user?.email || "Unknown",
      // Initial state fields
      status: "New", 
      dateSubmitted: serverTimestamp(),
      // Initial risk values are TBD, to be overwritten by the deployed Cloud Function
      riskScore: "TBD",
      riskLevel: "TBD",
      type: "VSR", // Define report type
    };

    try {
      // Core Firestore Write Operation
      // This is allowed by the Milestone 5 security rules (allow create: if request.auth != null)
      await addDoc(collection(firestore, "reports"), newReport);

      setSubmissionStatus("success");
      setFormData({
        eventDate: "",
        category: "",
        description: "",
        isAnonymous: false,
      }); // Clear form
      
      // Redirect back to dashboard after a delay
      setTimeout(() => router.push('/dashboard'), 2000);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmissionStatus("error");
      // The M5 security rules prevent unauthorized *updates*, but report creation is open.
      setErrorMessage("Failed to submit report. Please check the form data or network connection.");
    }
  };

  const isFormDisabled = submissionStatus === 'loading';

  return (
    <div className="p-10 max-w-xl mx-auto dark:bg-black min-h-screen text-white">
      <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 block w-fit">
        &larr; Back to Dashboard
      </Link>
      <header className="pb-4 border-b border-zinc-700">
        <h1 className="text-3xl font-bold">Submit Voluntary Safety Report (VSR)</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Submitting as: **{formData.isAnonymous ? 'Anonymous' : appUser?.name || user?.email}**
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Event Date */}
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-zinc-400 mb-1">
            Date of Event/Observation *
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-400 mb-1">
            Category of Occurrence *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select a category</option>
            <option value="Flight Ops">Flight Operations</option>
            <option value="Ground Ops">Ground Operations</option>
            <option value="Maintenance">Maintenance</option>
            <option value="ATC/Weather">ATC/Weather</option>
            {/* Add more categories as needed */}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-1">
            Detailed Description of Event *
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            placeholder="What happened, where, and when? Include severity details if known."
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Anonymous Checkbox */}
        <div className="flex items-center">
            <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isAnonymous" className="ml-2 text-sm text-zinc-400">
                Submit this report **Anonymously**
            </label>
        </div>

        {/* Submission Button and Feedback */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full py-2 px-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition duration-150 disabled:bg-blue-900 disabled:cursor-not-allowed"
        >
          {submissionStatus === "loading"
            ? "Submitting Report..."
            : submissionStatus === "success"
            ? "Submission Complete! Redirecting..."
            : "Submit VSR"}
        </button>

        {errorMessage && (
          <p className="text-center text-sm p-2 bg-red-400 text-red-900 rounded">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}