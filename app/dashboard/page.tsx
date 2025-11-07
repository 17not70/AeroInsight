// app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "../AuthContext"; 
import { auth, firestore } from "../firebase.config"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, orderBy, where, DocumentData } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

// Define the shape of a Report document for type safety
interface Report extends DocumentData {
    id: string;
    type: string;
    eventDate: string;
    category: string;
    riskLevel: string;
    riskScore: string;
    status: string;
    reporter_email: string;
}

// Helper function to format risk color (retained from M3)
const getRiskColor = (level: string) => {
    switch (level) {
        case "Extreme": return "bg-red-700 text-white";
        case "High": return "bg-orange-500 text-white";
        case "Medium": return "bg-yellow-400 text-black";
        default: return "bg-gray-200 text-black";
    }
};

export default function DashboardPage() {
    const { user, appUser, loading } = useAuth();
    const router = useRouter();

    // --- Role Check ---
    const isAdmin = appUser?.role === "Admin" || appUser?.role === "Safety Officer";

    // --- Page Protection ---
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // --- Data Fetching Logic (Role-Based Filtering) ---
    const reportsCollection = collection(firestore, "reports");
    let reportsQuery;

    // 🔑 M4: Implement role-based query filtering
    if (isAdmin) {
        // Admin/Safety Officer sees ALL reports
        reportsQuery = query(reportsCollection, orderBy("dateSubmitted", "desc"));
    } else {
        // Standard User/Reporter sees ONLY their own reports
        reportsQuery = query(
            reportsCollection,
            where("reporter_id", "==", user?.uid || "invalid-user"),
            orderBy("dateSubmitted", "desc")
        );
    }
    
    const [reportsSnapshot, reportsLoading, reportsError] = useCollection(reportsQuery);
    const reports: Report[] = (reportsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)) || []);

    // --- Render Logic ---
    if (loading || reportsLoading || !user || !appUser) {
        return <div className="p-10 text-white dark:text-zinc-300">Loading AeroInsight Dashboard...</div>;
    }
    
    if (reportsError) {
        return <div className="p-10 text-red-500">Error fetching reports: {reportsError.message}</div>;
    }

    return (
        <div className="p-10 max-w-7xl mx-auto dark:bg-black min-h-screen text-white">
            <header className="flex justify-between items-center pb-6 border-b border-zinc-700">
                <div>
                    <h1 className="text-3xl font-bold">Safety Performance Dashboard</h1>
                    <p className="text-sm text-zinc-400">Welcome, **{appUser.name}** ({appUser.role || 'User'})</p>
                </div>
                <div className="space-x-4">
                    <Link href="/submit-vsr" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        + Submit New VSR
                    </Link>
                    <button onClick={() => auth.signOut()} className="px-4 py-2 text-white bg-zinc-700 rounded-md hover:bg-zinc-600">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* 🔑 M4: Conditional Rendering of Admin Content */}
            {isAdmin && (
                <>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Reports for Review ({reports.length})</h2>

                    {/* --- Reports Table --- */}
                    <div className="overflow-x-auto bg-zinc-800 rounded-lg shadow-xl">
                        <table className="min-w-full text-sm divide-y divide-zinc-700">
                            <thead className="bg-zinc-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">ID / Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Event Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold">Risk Level</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Reporter</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-700">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-zinc-700/50">
                                        <td className="px-4 py-3 font-medium">
                                            {report.id.substring(0, 8)}... ({report.type})
                                        </td>
                                        <td className="px-4 py-3">
                                            {report.eventDate}
                                        </td>
                                        <td className="px-4 py-3">
                                            {report.category}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRiskColor(report.riskLevel)}`}>
                                                {report.riskScore} ({report.riskLevel})
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${report.status === 'New' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {report.reporter_email} 
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* Link to detail page */}
                                            <Link href={`/report/${report.id}`} className="text-blue-400 cursor-pointer hover:text-blue-300">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Display for Standard User (or if Admin table is empty) */}
            {!isAdmin && (
                 <h2 className="text-2xl font-semibold mt-8 mb-4">My Submissions ({reports.length})</h2>
                 // You could show a simplified table of their own reports here if desired, 
                 // but for now, the data is fetched and they see their submission count.
            )}
            
            {reports.length === 0 && (
                <p className="py-8 text-center text-zinc-500">
                    No reports found {isAdmin ? "for review." : "for your user account."}
                </p>
            )}
        </div>
    );
}