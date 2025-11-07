// app/report/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/AuthContext"; 
import { firestore } from "@/app/firebase.config"; 
import { doc, getDoc, updateDoc, DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report extends DocumentData {
    id: string;
    type: string;
    eventDate: string;
    category: string;
    description?: string;
    riskLevel: string;
    riskScore: string;
    status: string;
    reporter_email: string;
    reviewerNotes?: string; // New field for review notes
    reviewerName?: string; // New field to track who reviewed it
}

interface ReportPageProps {
    params: { id: string };
}

// Helper functions (retained)
const getStatusColor = (status: string) => {
    switch (status) {
        case "New": return "bg-red-500";
        case "In Review": return "bg-yellow-500";
        case "Closed": return "bg-green-600";
        default: return "bg-gray-400";
    }
};

export default function ReportDetailPage({ params }: ReportPageProps) {
    const { user, appUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const reportId = params.id;

    const [report, setReport] = useState<Report | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State for Admin Actions
    const [status, setStatus] = useState<string>('');
    const [reviewerNotes, setReviewerNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);


    const isAdmin = appUser?.role === "Admin" || appUser?.role === "Safety Officer";

    // --- Data Fetching Logic ---
    const fetchReport = async () => {
        setPageLoading(true);
        try {
            const reportRef = doc(firestore, "reports", reportId);
            const docSnap = await getDoc(reportRef);

            if (docSnap.exists()) {
                const fetchedReport = { id: docSnap.id, ...docSnap.data() } as Report;
                
                // Access Check (M4 logic)
                if (!isAdmin && fetchedReport.reporter_id !== user?.uid) {
                    setError("Access Denied: You do not have permission to view this report.");
                    setReport(null);
                } else {
                    setReport(fetchedReport);
                    // Initialize form state with current report values for Admins
                    setStatus(fetchedReport.status || 'New');
                    setReviewerNotes(fetchedReport.reviewerNotes || '');
                }
            } else {
                setError(`Report with ID ${reportId} not found.`);
            }
        } catch (e) {
            console.error("Error fetching report:", e);
            setError("An unexpected error occurred while fetching the report.");
        } finally {
            setPageLoading(false);
        }
    };
    
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }
        if (user && reportId) {
            fetchReport();
        }
    }, [user, authLoading, reportId, router, isAdmin]);

    // --- Admin Update Handler (M5 Core) ---
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Client-side guard: Only Admins can proceed
        if (!isAdmin || !report || isSubmitting) return; 

        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            // This direct write REQUIRES robust Firestore Security Rules (M5 Part B)
            await updateDoc(doc(firestore, "reports", reportId), {
                status: status,
                reviewerNotes: reviewerNotes,
                reviewerName: appUser?.name || 'Admin', 
                dateReviewed: new Date().toISOString(),
            });

            // Refresh UI state with new data
            setReport(prev => prev ? { ...prev, status, reviewerNotes } : null);

            setSubmissionStatus("success");
            setSubmitMessage("Report updated successfully!");
        } catch (e) {
            console.error("Error updating document:", e);
            setSubmitMessage("Error: Failed to save updates. Check network or security rules.");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitMessage(null), 5000);
        }
    };


    if (authLoading || pageLoading) {
        return <div className="p-10 text-white dark:text-zinc-300">Loading Report Details...</div>;
    }
    
    if (error) {
        return <div className="p-10 text-red-500">Error: {error}</div>;
    }
    if (!report) return null;

    return (
        <div className="p-10 max-w-7xl mx-auto dark:bg-black min-h-screen text-white">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 block w-fit">
                &larr; Back to Dashboard
            </Link>

            <header className="pb-4 border-b border-zinc-700">
                <h1 className="text-3xl font-bold">Report Details: {report.id.substring(0, 8)}... ({report.type})</h1>
                <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(report.status)} text-white`}>
                        Status: {report.status}
                    </span>
                    <span className="text-zinc-400 text-sm">
                        Submitted by: **{report.reporter_email}** on {report.eventDate}
                    </span>
                </div>
            </header>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Report Information & Description (Col 1 & 2) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
                        <h2 className="text-xl font-semibold mb-3 border-b border-zinc-700 pb-2">Incident Data</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Category:</strong> {report.category}</p>
                            <p><strong>Risk:</strong> {report.riskScore} ({report.riskLevel})</p>
                            <p className="col-span-2 pt-4"><strong>Description:</strong></p>
                            <p className="col-span-2 whitespace-pre-wrap text-zinc-300">
                                {report.description || "No detailed description provided."}
                            </p>
                        </div>
                    </div>
                    
                    {/* Display Reviewer Notes if available AND user is NOT Admin (Admins see it in the form) */}
                    {!isAdmin && report.reviewerNotes && (
                         <div className="bg-zinc-800 p-6 rounded-lg shadow-xl border-t-4 border-yellow-500">
                             <h2 className="text-xl font-semibold mb-3 text-yellow-300">Reviewer Feedback ({report.reviewerName})</h2>
                             <p className="whitespace-pre-wrap text-zinc-300">{report.reviewerNotes}</p>
                         </div>
                    )}
                </div>


                {/* --- Admin Review Actions (Col 3) --- */}
                {isAdmin ? (
                    <div className="lg:col-span-1 bg-red-900/30 p-6 rounded-lg shadow-xl border border-red-700 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-red-300 border-b border-red-700/50 pb-2">Review Actions</h2>
                        
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Status Field */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-zinc-400 mb-1">Update Status</label>
                                <select 
                                    id="status"
                                    name="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="New">New</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Closed">Closed (Completed)</option>
                                </select>
                            </div>

                            {/* Reviewer Notes Field */}
                            <div>
                                <label htmlFor="reviewerNotes" className="block text-sm font-medium text-zinc-400 mb-1">Reviewer Notes (for Reporter)</label>
                                <textarea 
                                    id="reviewerNotes"
                                    name="reviewerNotes"
                                    rows={5}
                                    value={reviewerNotes}
                                    onChange={(e) => setReviewerNotes(e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="Document findings, corrective actions, and final assessment here."
                                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md text-white p-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Submission Button and Feedback */}
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2 px-4 bg-red-600 rounded-md font-semibold hover:bg-red-700 transition duration-150 disabled:bg-red-900 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Review Update'}
                            </button>
                            
                            {submitMessage && (
                                <p className={`text-center text-sm p-2 rounded ${submitMessage.startsWith('Error') ? 'bg-red-400 text-red-900' : 'bg-green-400 text-green-900'}`}>
                                    {submitMessage}
                                </p>
                            )}
                        </form>
                    </div>
                ) : (
                    // Standard User View
                    <div className="col-span-1 flex flex-col justify-center items-center bg-zinc-800 p-6 rounded-lg">
                        <p className="text-lg text-zinc-400">Current Status:</p>
                        <span className={`px-4 py-2 mt-2 text-xl font-bold rounded ${getStatusColor(report.status)}`}>
                            {report.status}
                        </span>
                        <p className="text-sm text-zinc-500 mt-4">A Safety Officer is reviewing your submission.</p>
                    </div>
                )}
            </div>
        </div>
    );
}