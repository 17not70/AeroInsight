// app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function Home() {
  const { user, appUser, loading } = useAuth();
  
  const targetLink = user ? "/dashboard" : "/login";
  const buttonText = user ? "Access Dashboard" : "Login to AeroInsight";

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading system integrity...</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 text-center shadow-2xl">
      
      {/* Visual Header */}
      <div className="mb-8 p-4 bg-zinc-800 rounded-xl shadow-lg border border-blue-700/50">
        <h1 className="text-6xl font-extrabold text-blue-400 tracking-wider">
          AeroInsight
        </h1>
        <p className="text-2xl text-red-500 font-medium mt-1">
          Safety Performance Dashboard
        </p>
      </div>

      {/* Mission Statement and Standards */}
      <div className="max-w-3xl space-y-6">
        <h2 className="text-3xl font-semibold text-zinc-200">Mission Statement</h2>
        <p className="text-lg text-zinc-400 leading-relaxed border-l-4 border-red-500 pl-4 mx-4">
          **AeroInsight** provides a secure, centralized platform for systematic safety management. We adhere to **ICAO Annex 19** principles, ensuring confidential reporting, proactive risk assessment, and efficient corrective action tracking to maintain the highest levels of operational safety.
        </p>

        <div className="bg-zinc-800 p-6 rounded-lg shadow-inner">
          <p className="text-md font-bold text-yellow-500 mb-3">Key Features:</p>
          <ul className="text-sm text-zinc-300 space-y-2 list-disc list-inside text-left mx-auto w-fit">
            <li>Confidential VSR & MOR Submission</li>
            <li>Automated Initial Risk Assessment (M3)</li>
            <li>Role-Based Access Control (Admin/Reporter)</li>
            <li>Audit-Ready Report Tracking</li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-10">
        {user ? (
          <p className="text-lg text-green-400 mb-4">
            Welcome back, **{appUser?.name || user?.email}**
          </p>
        ) : (
          <p className="text-lg text-zinc-400 mb-4">
            Access restricted area. Authentication required.
          </p>
        )}
        <Link 
          href={targetLink}
          className="inline-block px-10 py-4 text-xl font-bold text-white bg-red-600 rounded-full shadow-xl hover:bg-red-700 hover:shadow-2xl transition duration-200 transform hover:scale-105 uppercase"
        >
          {buttonText}
        </Link>
      </div>
    </main>
  );
}