// LitInvestorBlog-frontend/src/components/FadeInOnScroll.jsx

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { twMerge } from 'tailwind-merge';

const FadeInOnScroll = ({
  children,
  className,
  delay = 0,
  threshold = 0.1,
}) => {
  const { ref, inView } = useInView({

    threshold: threshold,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={twMerge(

        'transition-all duration-700 ease-out',

        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',

        className,
      )}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
