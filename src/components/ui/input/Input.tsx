import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input: React.FC<InputProps> = ({ className = "", error, ...props }) => {
  return (
    <div className="relative">
      <input
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white dark:placeholder-gray-500 ${
          error ? "border-error-500 focus:border-error-500 focus:ring-error-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-500 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

export default Input; 