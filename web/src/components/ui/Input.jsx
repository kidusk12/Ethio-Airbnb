import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({ 
  id, 
  label, 
  type = "text",
  placeholder, 
  className = "",
  error = "",
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-1.5 text-[14px] font-medium text-gray-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={currentType}
          placeholder={placeholder}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && errorId ? errorId : undefined}
          className={`w-full h-[40px] rounded-lg border bg-white text-gray-900 text-[14px] placeholder-gray-400 outline-none focus:ring-0 transition-all px-3 ${isPassword ? 'pr-[40px]' : ''} ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-400'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-[13px] text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
