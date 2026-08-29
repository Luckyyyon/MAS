import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-sm border transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantClasses = {
    primary: "bg-zinc-100 text-zinc-950 hover:bg-white border-zinc-200 font-semibold shadow-sm",
    secondary: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700",
    outline: "bg-transparent text-zinc-200 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border-transparent",
    destructive: "bg-red-950/50 text-red-300 hover:bg-red-900/60 border-red-800/80 hover:border-red-700",
  }[variant];

  const sizeClasses = {
    sm: "h-7 px-2.5 text-xs font-mono gap-1.5",
    md: "h-8 px-3 text-xs gap-2",
    lg: "h-9 px-4 text-sm gap-2",
    icon: "h-8 w-8 p-0 flex items-center justify-center",
  }[size];

  return (
    <button className={twMerge(clsx(baseClasses, variantClasses, sizeClasses, className))} {...props}>
      {children}
    </button>
  );
};
