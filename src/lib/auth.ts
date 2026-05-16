/**
 * Authentication service functions
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export async function signIn(email: string, password: string) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Server returned invalid response format");
  }

  if (!response.ok) throw new Error(data.error || "Sign in failed");
  return data;
}

export async function signUp(email: string, password: string, fullName: string) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Server returned invalid response format");
  }

  if (!response.ok) throw new Error(data.error || "Sign up failed");
  return data;
}

export async function verifyToken(token: string) {
  const response = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Server returned invalid response format");
  }

  if (!response.ok) throw new Error("Verification failed");
  return data;
}
