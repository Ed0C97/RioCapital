// src/components/FadeInOnScroll.jsx

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { twMerge } from 'tailwind-merge';

const FadeInOnScroll = ({ children, className, delay = 0, threshold = 0.1 }) => {
  const { ref, inView } = useInView({
    // triggerOnce: true, // L'animazione avviene solo una volta
    threshold: threshold, // L'elemento è considerato "in vista" quando il 10% è visibile
    triggerOnce: true, // Imposta a 'false' se vuoi che l'animazione si ripeta ogni volta che entra/esce
  });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={twMerge(
        // Stili di base per la transizione
        "transition-all duration-700 ease-out",
        // Stato iniziale (invisibile e spostato)
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        // Unisci eventuali classi personalizzate passate come prop
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
