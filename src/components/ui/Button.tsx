import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  primary: 'bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold disabled:bg-amber-800 disabled:text-slate-500',
  secondary: 'bg-slate-600 hover:bg-slate-500 text-white disabled:bg-slate-700 disabled:text-slate-500',
  danger: 'bg-red-700 hover:bg-red-600 text-white disabled:bg-red-900 disabled:text-slate-500',
  ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 disabled:text-slate-600',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
