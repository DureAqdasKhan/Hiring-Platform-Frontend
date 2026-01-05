import React, { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("applicant");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSuccess(false);
    try {
      await signup({ email, password, role });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErr(error?.response?.data?.detail || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>

        {success && (
          <div className="mb-3 p-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-lg">
            Sign up successful! Redirecting to login...
          </div>
        )}

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
          className="w-full mt-1 mb-3 rounded-xl border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <label className="text-sm">Role</label>
        <select
          className="w-full mt-1 mb-4 rounded-xl border p-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="applicant">Applicant</option>
          <option value="hiring_manager">Hiring Manager</option>
        </select>

        <button className="w-full rounded-xl bg-black text-white p-3">Sign up</button>

        <p className="text-sm mt-4">
          Already have an account? <Link className="underline" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
