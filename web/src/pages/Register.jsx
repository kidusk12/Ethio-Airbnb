import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Form fields ──────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");

  // ── UI state ─────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Client-side validation ───────────────────────────
  function validate() {
    const next = {};

    if (!name.trim()) {
      next.name = "Name is required";
    }

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Please enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    if (!role || !["guest", "host"].includes(role)) {
      next.role = 'Role must be "guest" or "host"';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Clear a single field's error on change ───────────
  function clearFieldError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }

  // ── Submit handler ───────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError("");
    setErrors({});

    try {
      const { status, body } = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (status === 201) {
        login(body.data.user, body.data.token);
        navigate("/home");
        return;
      }

      // Map field-level errors from API (400 / 409)
      if (body.errors && Array.isArray(body.errors)) {
        const fieldErrors = {};
        body.errors.forEach((err) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setGeneralError(body.message || "Something went wrong. Please try again.");
        }
      } else {
        setGeneralError(body.message || "Something went wrong. Please try again.");
      }
    } catch {
      // Network failure or unexpected error
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {/* LOGO */}
      <div className="flex items-center mb-8 font-serif text-[22px] font-bold tracking-tight text-gray-900">
        <div className="w-[34px] h-[34px] mr-2.5 rounded-full bg-[#dc3545] text-white flex items-center justify-center">
          <Home size={17} strokeWidth={2.5} />
        </div>
        Ethio<span className="text-[#dc3545]">Stays</span>
      </div>

      {/* TITLE */}
      <div className="mb-6">
        <h1 className="m-0 mb-1.5 font-serif text-[28px] leading-tight font-bold text-gray-900">
          Create your account
        </h1>
        <p className="m-0 text-gray-500 text-[14px]">
          Join Ethio Stays to book and save places across Ethiopia.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <Input
          id="name"
          label="Full name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          error={errors.name}
          autoComplete="name"
        />

        {/* Email */}
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          error={errors.email}
          autoComplete="email"
        />

        {/* Password */}
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          error={errors.password}
          autoComplete="new-password"
        />

        {/* Role selector */}
        <div className="mb-5">
          <label className="block mb-1.5 text-[14px] font-medium text-gray-900">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={role === "guest" ? "primary" : "outline"}
              className="!h-[38px]"
              onClick={() => {
                setRole("guest");
                clearFieldError("role");
              }}
              aria-pressed={role === "guest"}
            >
              Book stays
            </Button>
            <Button
              type="button"
              variant={role === "host" ? "primary" : "outline"}
              className="!h-[38px]"
              onClick={() => {
                setRole("host");
                clearFieldError("role");
              }}
              aria-pressed={role === "host"}
            >
              Host guests
            </Button>
          </div>
          {errors.role && (
            <p className="mt-1 text-[13px] text-red-500" role="alert">
              {errors.role}
            </p>
          )}
        </div>

        {/* General error banner */}
        {generalError && (
          <div
            className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
            role="alert"
          >
            {generalError}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="mt-2 mb-5" disabled={isSubmitting}>
          {isSubmitting ? "Creating account\u2026" : "Continue"}
        </Button>

        {/* OR DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-gray-200"></span>
          <p className="m-0 text-gray-400 text-[12px] uppercase tracking-wider">OR</p>
          <span className="h-px flex-1 bg-gray-200"></span>
        </div>

        {/* GOOGLE BUTTON */}
        <Button type="button" variant="outline" className="mb-6">
          <svg className="w-[18px] h-[18px] mr-2 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </Button>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-500 text-[14px]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#dc3545] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;