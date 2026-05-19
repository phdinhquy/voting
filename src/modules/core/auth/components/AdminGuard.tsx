"use client";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useEffect,
  useState,
} from "react";

import { auth } from "@/firebase/client";

import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  
  const [loading, setLoading] =
    useState(true);

  const [authorized,
    setAuthorized] =
    useState(false);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user?.email) {

            setAuthorized(false);

            setLoading(false);

            return;
          }

          const valid =
            user.email.endsWith(
              "@smp.udn.vn"
            ) ||
            user.email.endsWith(
              "@st.smp.udn.vn"
            );

          setAuthorized(valid);

          setLoading(false);
        }
      );

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">

        <h1 className="text-3xl font-bold">
          Admin Access Required
        </h1>

        <p className="text-slate-500">
          Please login with TYD account.
        </p>
      </div>
    );
  }

  return children;
}