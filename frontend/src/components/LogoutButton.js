import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton() {
  const navigate = useNavigate();
  const { onLogout } = useAuth();

  function handleLogout() {
    onLogout();
    navigate("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
    >
      Logout
    </button>
  );
}
