// src/components/IconButton.tsx
import React from 'react';
import type { MouseEvent } from 'react';

type IconButtonProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export function IconButton({ 
  onClick, 
  title, 
  children, 
  className = '',
  type = 'button'
}: IconButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center p-1.5 rounded-md text-tokyo-night-comment hover:text-tokyo-night-fg hover:bg-tokyo-night-bg3/50 focus:outline-none focus:ring-2 focus:ring-tokyo-night-blue/50 focus:ring-offset-2 focus:ring-offset-tokyo-night-bg2 transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}