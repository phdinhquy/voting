export async function loginWithGoogle() {
  if (typeof window === "undefined") return;

  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const { getFirebaseAuth } = await import("@/firebase/client");

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  return signInWithPopup(auth, provider);
}

export async function loginWithMicrosoft() {
  if (typeof window === "undefined") return;

  const { OAuthProvider, signInWithPopup, signOut } = await import("firebase/auth");
  const { getFirebaseAuth } = await import("@/firebase/client");

  const auth = getFirebaseAuth();
  const provider = new OAuthProvider("microsoft.com");

  const result = await signInWithPopup(auth, provider);

  const email = result.user.email || "";

  const isValid =
    email.endsWith("@smp.udn.vn") ||
    email.endsWith("@st.smp.udn.vn");

  if (!isValid) {
    await signOut(auth);
    throw new Error("Chỉ tài khoản TYD được phép đăng nhập.");
  }

  return result;
}

export async function logout() {
  const { signOut } = await import("firebase/auth");
  const { getFirebaseAuth } = await import("@/firebase/client");

  const auth = getFirebaseAuth();
  return signOut(auth);
}