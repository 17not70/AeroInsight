// app/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "./firebase.config";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Define the shape of our user object
interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  role: "Admin" | "Safety Officer" | "Reporter";
}

// Define the context shape
interface AuthContextType {
  user: User | null | undefined; // Firebase auth user
  appUser: AppUser | null; // Our custom user from Firestore
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user) {
      // User is logged in, let's get their profile from Firestore
      const userRef = doc(firestore, "users", user.uid);
      getDoc(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            // Set our custom app user
            setAppUser(snapshot.data() as AppUser);
          } else {
            // This case handles users created in Auth but not in Firestore
            console.error("No user profile found in Firestore!");
            setAppUser(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          setAppUser(null);
        });
    } else {
      // User is logged out
      setAppUser(null);
    }
  }, [user]); // This effect runs whenever the auth 'user' changes

  const value = {
    user,
    appUser,
    loading,
  };

  // Don't show anything until loading is complete
  if (loading) {
    return <div>Loading app...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a handy hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};