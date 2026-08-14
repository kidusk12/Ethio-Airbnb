import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Welcome{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Your account has been created successfully.
        </p>
        {user?.role && (
          <p className="text-gray-400 text-xs mb-6">
            Signed in as <span className="font-medium text-gray-600 capitalize">{user.role}</span>
          </p>
        )}

        <button
          onClick={handleLogout}
          className="text-[#dc3545] text-sm font-medium hover:underline"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default Home;
