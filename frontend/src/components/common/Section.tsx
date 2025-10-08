import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  center?: boolean;
}

// Provides consistent vertical spacing and container widths across pages
export const Section: React.FC<SectionProps> = ({
  className,
  title,
  subtitle,
  center,
  children,
  ...props
}) => {
  return (
    <section className={cn('py-16', className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className={cn('mb-12', center ? 'text-center' : '')}>
            {title && (
              <h2 className={cn('text-3xl md:text-4xl font-bold text-foreground mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500')}>{title}</h2>
            )}
            {subtitle && (
              <p className={cn('text-xl text-muted-foreground max-w-3xl', center ? 'mx-auto' : '', 'animate-in fade-in duration-700')}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
