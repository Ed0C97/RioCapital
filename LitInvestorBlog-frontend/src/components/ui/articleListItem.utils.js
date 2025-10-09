// src/components/ui/articleListItem.utils.js
import { cva } from 'class-variance-authority';

// Contenitore principale (il tag <Link>)
export const articleListItemVariants = cva('group block text-inherit no-underline', {
  variants: {
    variant: {
      archive: 'py-7 border-b border-border last:border-none',
      related: 'flex items-center gap-6',
    },
  },
  defaultVariants: {
    variant: 'archive',
  },
});

// Wrapper del contenuto (il div interno)
export const articleContentVariants = cva('', {
  variants: {
    variant: {
      archive: 'grid grid-cols-1 items-center gap-4 md:grid-cols-[295px_1fr] md:gap-8',
      related: 'flex items-center gap-6', // Manteniamo la coerenza con il contenitore
    },
  },
  defaultVariants: {
    variant: 'archive',
  },
});

// Contenitore dell'immagine
export const imageWrapperVariants = cva('overflow-hidden', {
  variants: {
    variant: {
      archive: 'w-full aspect-[295/167] rounded-[22px] bg-background',
      related: 'h-[134px] w-[134px] flex-shrink-0 rounded-[20px]',
    },
  },
  defaultVariants: {
    variant: 'archive',
  },
});

// Tag <img>
export const imageVariants = cva('h-full w-full object-cover transition-transform duration-300', {
  variants: {
    variant: {
      archive: 'group-hover:scale-105',
      related: 'group-hover:scale-105',
    },
  },
  defaultVariants: {
    variant: 'archive',
  },
});

// Contenitore del testo
export const textContentVariants = cva('', {
  variants: {
    variant: {
      archive: '',
      related: 'flex h-[134px] flex-col justify-center',
    },
  },
  defaultVariants: {
    variant: 'archive',
  },
});