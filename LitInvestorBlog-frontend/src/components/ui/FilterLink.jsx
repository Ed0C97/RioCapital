// src/components/ui/FilterLink.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterLink = ({ label, onClick, isActive, className }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={cn(
      'group flex w-full items-center gap-3 py-1.5 text-left text-sm transition-colors duration-150',
      isActive
        ? 'font-semibold text-blue'
        : 'text-foreground hover:text-blue',
      className,
    )}
  >
    <ArrowRight
      className={cn(
        'size-4 transition-all duration-150 group-hover:translate-x-1 group-hover:text-blue',
        isActive ? 'text-blue' : 'text-foreground-secondary/70',
      )}
    />
    <span>{label}</span>
  </a>
);

export { FilterLink };