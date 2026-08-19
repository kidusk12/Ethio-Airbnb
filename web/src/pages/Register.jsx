import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, User, Briefcase } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

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
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const redirectPath = location.state?.from || "/host/list";

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const userData = {
      firstName: formData.firstName.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role,
    };

    login(userData, "mock_token_" + Date.now());
    navigate(redirectPath, { replace: true });
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
        />

        <Input
          id="middleName"
          label="Middle name"
          placeholder="Kebede"
          value={formData.middleName}
          onChange={handleChange}
        />

        <Input
          id="lastName"
          label="Last name"
          placeholder="Tesfaye"
          value={formData.lastName}
          onChange={handleChange}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="+251 9..."
          value={formData.phone}
          onChange={handleChange}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <Button type="submit" className="mt-2 mb-5">
          Continue
        </Button>

        {/* OR DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-gray-200"></span>
          <p className="m-0 text-gray-400 text-[12px] uppercase tracking-wider">OR</p>
          <span className="h-px flex-1 bg-gray-200"></span>
        </div>

        {/* GOOGLE BUTTON */}
        <Button 
          type="button" 
          variant="outline" 
          className="mb-6"
          onClick={() => {
            login({ email: "google.user@example.com", firstName: "Abebe", name: "Abebe Kebede", role: "host" }, "mock_google_token");
            navigate(redirectPath, { replace: true });
          }}
        >
          <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
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