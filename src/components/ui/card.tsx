import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white dark:bg-white/[0.03] shadow-sm rounded-xl border border-gray-200 dark:border-white/[0.05] ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className = '', children }: CardBodyProps) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = '', children }: CardHeaderProps) {
  return (
    <div className={`px-5 py-4 border-b border-gray-200 dark:border-white/[0.05] ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className = '', children }: CardFooterProps) {
  return (
    <div className={`px-5 py-4 border-t border-gray-200 dark:border-white/[0.05] ${className}`}>
      {children}
    </div>
  );
}
