// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.config";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard'); // Redirect on success
        } catch (err: any) {
            console.error("Login Error:", err);
            // Handle common Firebase errors gracefully
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Invalid credentials. Please check email and password.");
            } else if (err.code === 'auth/invalid-email') {
                setError("The email address format is invalid.");
            } else {
                setError("Login failed. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
            <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-xl shadow-2xl border border-red-700/50">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-1">Access Required</h1>
                    <p className="text-zinc-400">Sign in to the AeroInsight Safety Dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="email">
                            Email (User ID)
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user.name@airline.com"
                            disabled={loading}
                            // FIXED UI/UX: High contrast styling
                            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            // FIXED UI/UX: High contrast styling
                            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-800/50 border border-red-700 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:bg-red-900 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Login Securely'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 transition duration-150">
                        &larr; Back to Introduction
                    </Link>
                </div>
            </div>
        </div>
    );
}