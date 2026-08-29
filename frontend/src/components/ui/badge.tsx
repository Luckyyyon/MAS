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
  const baseClasses = "inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-sm border transition-colors";
  
  const variantClasses = {
    default: "bg-zinc-800 text-zinc-100 border-zinc-700",
    secondary: "bg-zinc-900 text-zinc-400 border-zinc-800",
    outline: "bg-transparent text-zinc-300 border-zinc-700",
    destructive: "bg-red-950/40 text-red-400 border-red-800/60",
    success: "bg-emerald-950/40 text-emerald-400 border-emerald-800/60",
    warning: "bg-amber-950/40 text-amber-400 border-amber-800/60",
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
      return "bg-purple-950/40 text-purple-300 border-purple-800/60";
    case 'Security Agent':
      return "bg-rose-950/40 text-rose-300 border-rose-800/60";
    case 'Performance Agent':
      return "bg-blue-950/40 text-blue-300 border-blue-800/60";
    case 'Syntax & Refactor Agent':
      return "bg-emerald-950/40 text-emerald-300 border-emerald-800/60";
    default:
      return "bg-zinc-800 text-zinc-200 border-zinc-700";
  }
}
