import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Honour redirect intent (e.g. from PropertyDetail → Book → Login)
  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { status, body } = await loginUser({ email: email.trim(), password });

      if (status === 200) {
        const { user, token } = body.data;
        login(user, token);

        // Redirect to the intended destination, or role-appropriate dashboard
        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "guest") {
          navigate("/guest_dashboard", { replace: true });
        } else {
          navigate("/host/Host_dashboard", { replace: true });
        }
        return;
      }

      if (status === 401) {
        setError("Incorrect email or password.");
        return;
      }

      setError(body.message || "Login failed. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {/* LOGO */}
      <Link to="/" className="inline-flex items-center mb-8 font-serif text-[22px] font-bold tracking-tight text-gray-900">
        <div className="w-[34px] h-[34px] mr-2.5 rounded-full bg-primary text-white flex items-center justify-center">
          <Home size={17} strokeWidth={2.5} />
        </div>
        Ethio<span className="text-primary">Stays</span>
      </Link>

      {/* TITLE */}
      <div className="mb-6">
        <h1 className="m-0 mb-1.5 font-serif text-[28px] leading-tight font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="m-0 text-gray-500 text-[14px]">
          {from ? "Log in to continue." : "Log in to manage your trips and saved stays."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-[14px] font-medium text-gray-900">
              Password
            </label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="At least 8 characters"
            className="mb-0"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="mt-2 mb-5" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Continue"}
        </Button>

        {/* REGISTER LINK */}
        <p className="text-center text-gray-500 text-[14px]">
          New to Ethio Stays?{" "}
          <Link to="/register" state={{ from }} className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
