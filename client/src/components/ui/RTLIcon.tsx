/**
 * RTL Icon Component
 * مكون الأيقونات مع دعم RTL
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface RTLIconProps {
  icon: React.ComponentType<any>;
  position?: 'start' | 'end';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-5 w-5'
};

const positionClasses = {
  start: 'mr-2 rtl:mr-0 rtl:ml-2',
  end: 'ml-2 rtl:ml-0 rtl:mr-2'
};

export function RTLIcon({ 
  icon: Icon, 
  position = 'start', 
  className = '', 
  size = 'md',
  ...props 
}: RTLIconProps) {
  return (
    <Icon 
      className={cn(
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      {...props}
    />
  );
}

// Specific icon components for common use cases
export function ButtonIcon({ icon: Icon, className = '', ...props }: Omit<RTLIconProps, 'position'>) {
  return (
    <Icon 
      className={cn('h-4 w-4 btn-icon-start', className)}
      {...props}
    />
  );
}

export function TitleIcon({ icon: Icon, className = '', ...props }: Omit<RTLIconProps, 'position'>) {
  return (
    <Icon 
      className={cn('h-5 w-5 title-icon', className)}
      {...props}
    />
  );
}

export function MenuIcon({ icon: Icon, className = '', ...props }: Omit<RTLIconProps, 'position'>) {
  return (
    <Icon 
      className={cn('h-4 w-4 menu-icon', className)}
      {...props}
    />
  );
}

export function DropdownIcon({ icon: Icon, className = '', ...props }: Omit<RTLIconProps, 'position'>) {
  return (
    <Icon 
      className={cn('h-4 w-4 dropdown-icon', className)}
      {...props}
    />
  );
}

export function SearchIcon({ className = '', ...props }) {
  return (
    <div className={cn('absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 search-icon', className)} {...props} />
  );
}

export function TabIcon({ icon: Icon, className = '', ...props }: Omit<RTLIconProps, 'position'>) {
  return (
    <Icon 
      className={cn('h-4 w-4 tab-icon', className)}
      {...props}
    />
  );
}

// Hook for RTL-aware icon positioning
export function useRTLIcon(position: 'start' | 'end' = 'start') {
  return {
    className: positionClasses[position]
  };
}
