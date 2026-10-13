import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'white' | 'secondary' | 'glass' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 whitespace-nowrap rounded-lg';

    const variants = {
      primary: 'bg-[#E50914] text-white hover:bg-[#F40612] active:bg-[#B81D24] font-semibold shadow-md',
      white: 'bg-white text-black hover:bg-white/85 active:bg-white/75 font-bold shadow-md',
      glass: 'bg-[#6D6D6E]/70 text-white hover:bg-[#6D6D6E]/45 active:bg-[#6D6D6E]/30 font-semibold backdrop-blur-xs',
      secondary: 'bg-[#242424] text-[#FFFFFF] hover:bg-[#2E2E2E] active:bg-[#383838] border border-[#333333]',
      outline: 'bg-transparent text-[#FFFFFF] hover:bg-[#242424] border border-[#333333] hover:border-[#444444]',
      ghost: 'bg-transparent text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#242424]',
      danger: 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30 hover:bg-[#E50914]/25 active:bg-[#E50914]/35',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-2.5 h-11 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
