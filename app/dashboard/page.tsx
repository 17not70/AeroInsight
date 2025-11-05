// app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase.config";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- 1. Import Link

export default function DashboardPage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  // This is our page protection logic
  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user, redirect to login
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || !user || !appUser) {
    return <div>Loading dashboard...</div>;
  }

  // We are logged in and have user data
  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome to your Dashboard, {appUser.name}</h1>
      <p>Your email is: {appUser.email}</p>
      <p>Your role is: {appUser.role}</p>
      <br />

      {/* 2. This is the new Link block */}
      <Link href="/submit-vsr" style={{ color: "cyan", fontSize: "20px", marginRight: "20px" }}>
        Submit a New VSR
      </Link>

      <button onClick={() => auth.signOut()} style={{ padding: "10px", color: "black" }}>
        Sign Out
      </button>
    </div>
  );
}