"use client";

import {
  signInWithPopup,
  OAuthProvider,
  getAuth,
} from "firebase/auth";

import app from "@/firebase/client";

const auth = getAuth(app);

export async function loginWithMicrosoft() {

  const provider = new OAuthProvider(
    "microsoft.com"
  );

  provider.setCustomParameters({
    prompt: "select_account",
  });

  return signInWithPopup(
    auth,
    provider
  );
}