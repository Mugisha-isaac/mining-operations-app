import { cn } from '@/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-stone-200 bg-white p-5 shadow-sm', className)}
      {...props}
    />
  );
}
