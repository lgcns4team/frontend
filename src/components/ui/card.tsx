import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: DivProps) {
  return <div className={`rounded-2xl bg-white border border-slate-200 ${className}`} {...props} />;
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={`px-4 pt-4 ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }: DivProps) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={`px-4 pb-4 ${className}`} {...props} />;
}
