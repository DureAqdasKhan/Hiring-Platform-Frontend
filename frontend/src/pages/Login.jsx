import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const { onLogin } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const data = await login({ email, password }); // { access_token, token_type }
      console.log("token:", data.access_token);

      await onLogin(data.access_token); // stores token + calls /auth/me + sets user
      console.log("logged in, navigating to /jobs");

      navigate("/jobs", { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Login</h1>

        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <label className="text-sm">Email</label>
        <input
          className="w-full mt-1 mb-3 rounded-xl border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label className="text-sm">Password</label>
        <input
          className="w-full mt-1 mb-4 rounded-xl border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <button type="submit" className="w-full rounded-xl bg-black text-white p-3">
          Sign in
        </button>

        <p className="text-sm mt-4">
          No account? <Link className="underline" to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
