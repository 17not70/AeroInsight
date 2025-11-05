// app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function Home() {
  const { user, appUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Welcome to AeroInsight</h1>

      {user ? (
        <div>
          <p>Hello, {appUser?.name}</p>
          <Link href="/dashboard" style={{ color: "cyan" }}>
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <Link href="/login" style={{ color: "cyan" }}>
            Login Now
          </Link>
        </div>
      )}
    </main>
  );
}