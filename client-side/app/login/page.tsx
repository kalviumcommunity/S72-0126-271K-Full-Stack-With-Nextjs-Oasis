"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();

  function handleLogin() {
    // Mock token (in real apps, get it from backend)
    Cookies.set("token", "mock.jwt.token");
    router.push("/dashboard");
  }

  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-semibold">Login Page</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
      >
        Login
      </button>
    </main>
  );
}