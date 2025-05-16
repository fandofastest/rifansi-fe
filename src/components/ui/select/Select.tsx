import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select: React.FC<SelectProps> = ({ className = "", error, children, ...props }) => {
  return (
    <div className="relative">
      <select
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
          dark:border-white/[0.05] dark:bg-gray-900 dark:text-white dark:placeholder-gray-500
          ${error ? "border-error-500 focus:border-error-500 focus:ring-error-500" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error-500 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

export default Select; 