import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseClasses = "rounded-xl transition-all";
  const variantClasses = {
    default: "bg-surface-elevated border border-border-subtle shadow-subtle",
    subtle: "bg-surface border border-border-subtle",
    elevated: "bg-surface-elevated border border-border-subtle shadow-card",
  }[variant];

  return (
    <div className={twMerge(clsx(baseClasses, variantClasses, className))} {...props}>
      {children}
    </div>
  );
};
