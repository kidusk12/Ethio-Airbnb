import React from "react";

export function Button({ 
  children, 
  variant = "primary", 
  className = "", 
  type = "button", 
  ...props 
}) {
  const baseStyles = "w-full h-[40px] flex items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-[#dc3545] hover:bg-[#c82333] text-white border border-transparent disabled:hover:bg-[#dc3545]",
    outline: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 disabled:hover:bg-white"
  };

  return (
    <button 
      type={type} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
