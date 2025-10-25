import React, { useEffect } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  useEffect(() => {
    const cursor = document.querySelector('.custom-cursor') as HTMLElement;
    const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
    
    if (!cursor || !cursorDot) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const addHoverEffect = () => {
      cursor?.classList.add('hover');
    };

    const removeHoverEffect = () => {
      cursor?.classList.remove('hover');
    };

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], .template-card, .texture-item'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', addHoverEffect);
      el.addEventListener('mouseleave', removeHoverEffect);
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', addHoverEffect);
        el.removeEventListener('mouseleave', removeHoverEffect);
      });
    };
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || window.innerWidth < 768) {
    return null; // Disable custom cursor on mobile or when user prefers reduced motion
  }

  return (
    <>
      <div className="cursor-dot" />
      <div className="custom-cursor">
        <svg className="cursor-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      </div>
    </>
  );
};

export default CustomCursor;
