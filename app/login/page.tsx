// app/login/page.tsx
"use client"; // This must be a client component

import React, { useState, useEffect } from "react";
import { auth } from "../firebase.config";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, userCredential, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from refreshing the page
    signInWithEmailAndPassword(email, password);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h1>Login to AeroInsight</h1>
      <form onSubmit={handleLogin}>
        <div style={{ margin: "10px 0" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", color: "black" }}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", color: "black" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Login
        </button>
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </form>
    </div>
  );
}