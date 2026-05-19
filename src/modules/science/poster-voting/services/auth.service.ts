import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/firebase/client";

const googleProvider =
  new GoogleAuthProvider();

const microsoftProvider =
  new OAuthProvider("microsoft.com");

export async function loginWithGoogle() {
  return await signInWithPopup(
    auth,
    googleProvider
  );
}

export async function loginWithMicrosoft() {
  const result =
    await signInWithPopup(
      auth,
      microsoftProvider
    );

  const email =
    result.user.email || "";

  const isValid =
    email.endsWith("@smp.udn.vn") ||
    email.endsWith("@st.smp.udn.vn");

  if (!isValid) {
    await signOut(auth);

    throw new Error(
      "Chỉ tài khoản TYD được phép đăng nhập."
    );
  }

  return result;
}

export async function logout() {
  return await signOut(auth);
}