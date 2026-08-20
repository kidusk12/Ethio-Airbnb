import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, User, Briefcase } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { registerUser, loginUser } from "../lib/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState("host");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from || (role === "guest" ? "/guest_dashboard" : "/host/Host_dashboard");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError("");
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Client-side password match check before hitting the API
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { status, body } = await registerUser({
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
      });

      if (status === 201) {
        // Registration succeeded — auto-login
        const loginRes = await loginUser({ email: formData.email.trim(), password: formData.password });

        if (loginRes.status === 200) {
          const { user, token } = loginRes.body.data;
          login(user, token);
          navigate(
            role === "guest" ? "/guest_dashboard" : "/host/Host_dashboard",
            { replace: true }
          );
        } else {
          // Registered but auto-login failed — send to login page
          navigate("/login", { state: { from: redirectPath }, replace: true });
        }
        return;
      }

      // Handle validation errors (400) and duplicate email (409)
      if (status === 400 || status === 409) {
        const errors = body.errors ?? [];
        if (errors.length > 0) {
          const mapped = {};
          errors.forEach(({ field, message }) => {
            mapped[field] = message;
          });
          setFieldErrors(mapped);
          setError(body.message || "Please fix the errors below.");
        } else {
          setError(body.message || "Registration failed. Please try again.");
        }
        return;
      }

      setError(body.message || "Something went wrong. Please try again.");
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
          Create your account
        </h1>
        <p className="m-0 text-gray-500 text-[14px]">
          Join Ethio Stays to list, book, and save places across Ethiopia.
        </p>
      </div>

      {/* ROLE SELECTOR */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole("guest")}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[14px] font-semibold transition-colors ${
            role === "guest"
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <User size={16} strokeWidth={2.5} />
          I'm a guest
        </button>

        <button
          type="button"
          onClick={() => setRole("host")}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-[14px] font-semibold transition-colors ${
            role === "host"
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <Briefcase size={16} strokeWidth={2.5} />
          I'm a host
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <Input
          id="firstName"
          label="First name"
          placeholder="Abebe"
          value={formData.firstName}
          onChange={handleChange}
          error={fieldErrors.firstName}
        />

        <Input
          id="middleName"
          label="Middle name"
          placeholder="Kebede"
          value={formData.middleName}
          onChange={handleChange}
          error={fieldErrors.middleName}
        />

        <Input
          id="lastName"
          label="Last name"
          placeholder="Tesfaye"
          value={formData.lastName}
          onChange={handleChange}
          error={fieldErrors.lastName}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />

        <Input
          id="phoneNumber"
          label="Phone number"
          type="tel"
          placeholder="+251 9..."
          value={formData.phoneNumber}
          onChange={handleChange}
          error={fieldErrors.phoneNumber}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <Button type="submit" className="mt-2 mb-5" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Continue"}
        </Button>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-500 text-[14px]">
          Already have an account?{" "}
          <Link to="/login" state={{ from: redirectPath }} className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;
