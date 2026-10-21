import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-normal transition-all duration-150 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1";

  const variantClasses = {
    primary: "bg-accent text-white hover:bg-accent-hover font-medium shadow-subtle border border-transparent",
    secondary: "bg-surface-elevated text-ink-primary hover:bg-surface-subtle border border-border hover:border-border-strong shadow-subtle",
    outline: "bg-transparent text-ink-primary hover:bg-surface border border-border hover:border-border-strong",
    ghost: "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface border-transparent",
    subtle: "bg-surface text-ink-primary hover:bg-surface-subtle border border-border-subtle",
    destructive: "bg-[#fdf2f2] text-status-error hover:bg-[#fae8e8] border border-[#f5c2c2]",
  }[variant];

  const sizeClasses = {
    sm: "h-7 px-3 text-xs rounded-md gap-1.5",
    md: "h-8 px-3.5 text-xs rounded-lg gap-2",
    lg: "h-10 px-5 text-sm rounded-lg gap-2 font-medium",
    icon: "h-8 w-8 rounded-md p-0 flex items-center justify-center",
  }[size];

  return (
    <button className={twMerge(clsx(baseClasses, variantClasses, sizeClasses, className))} {...props}>
      {children}
    </button>
  );
};
