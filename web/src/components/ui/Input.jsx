import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({ 
  id, 
  label, 
  type = "text",
  placeholder, 
  className = "",
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

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
          className={`w-full h-[40px] rounded-lg border border-gray-200 bg-white text-gray-900 text-[14px] placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-0 transition-all px-3 ${isPassword ? 'pr-[40px]' : ''}`}
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
    </div>
  );
}
