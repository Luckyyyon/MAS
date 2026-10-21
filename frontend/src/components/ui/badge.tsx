import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'agent';
  agentType?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  agentType,
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium rounded-md border transition-colors";
  
  const variantClasses = {
    default: "bg-surface-elevated text-ink-primary border-border-subtle",
    secondary: "bg-surface text-ink-secondary border-border-subtle",
    outline: "bg-transparent text-ink-secondary border-border",
    destructive: "bg-[#fdf2f2] text-status-error border-[#f5c2c2]",
    success: "bg-[#f0f9f1] text-status-success border-[#c8e6c9]",
    warning: "bg-[#fff8e1] text-status-warning border-[#ffe082]",
    agent: getAgentClasses(agentType)
  }[variant];

  return (
    <div className={twMerge(clsx(baseClasses, variantClasses, className))} {...props}>
      {children}
    </div>
  );
};

function getAgentClasses(agentType?: string) {
  switch (agentType) {
    case 'Supervisor':
      return "bg-[#f2f2f7] text-[#3a3a3c] border-[#d1d1d6]";
    case 'Security Agent':
      return "bg-[#fdf2f2] text-status-error border-[#f5c2c2]";
    case 'Performance Agent':
      return "bg-[#e8f2fc] text-accent border-[#b3d7f7]";
    case 'Syntax & Refactor Agent':
      return "bg-[#f0f9f1] text-status-success border-[#c8e6c9]";
    default:
      return "bg-surface text-ink-primary border-border";
  }
}
