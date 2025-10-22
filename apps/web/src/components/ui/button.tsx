import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Button Variants & Sizes
// ============================================

const buttonVariants = {
  // Primary gradient button
  gradient: [
    'bg-gradient-to-r from-brand to-[#5ac8fa]',
    'text-white font-semibold',
    'shadow-[0_12px_24px_-12px_rgba(10,132,255,0.45)]',
    'hover:brightness-110',
    'active:scale-[0.99]',
    'transition-all duration-200',
  ].join(' '),

  // Outline button
  outline: [
    'border border-[rgba(10,132,255,0.35)]',
    'bg-white/70 text-brand font-semibold',
    'shadow-[0_6px_16px_-10px_rgba(10,132,255,0.35)]',
    'hover:border-brand hover:text-brand',
    'active:scale-[0.99]',
    'transition-all duration-200',
  ].join(' '),

  // Ghost button (minimal)
  ghost: [
    'text-text-secondary font-semibold',
    'hover:bg-brand-weak hover:text-brand',
    'active:scale-[0.98]',
    'transition-all duration-200',
  ].join(' '),

  // Destructive button
  destructive: [
    'bg-gradient-to-r from-red-500 to-red-600',
    'text-white font-semibold',
    'shadow-[0_12px_24px_-12px_rgba(239,68,68,0.45)]',
    'hover:brightness-110',
    'active:scale-[0.99]',
    'transition-all duration-200',
  ].join(' '),

  // Link button (text only)
  link: [
    'text-brand font-semibold underline-offset-4',
    'hover:underline',
    'transition-colors duration-200',
  ].join(' '),
} as const;

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-full',
  md: 'px-5 py-2 text-sm rounded-full',
  lg: 'px-6 py-3 text-base rounded-full',
  icon: 'p-2 rounded-full',
} as const;

// ============================================
// Types
// ============================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼의 시각적 스타일 변형
   * @default "gradient"
   */
  variant?: keyof typeof buttonVariants;

  /**
   * 버튼의 크기
   * @default "md"
   */
  size?: keyof typeof buttonSizes;

  /**
   * 전체 너비 버튼 여부
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 로딩 상태 (스피너 표시)
   * @default false
   */
  isLoading?: boolean;

  /**
   * 버튼 아이콘 (왼쪽)
   */
  leftIcon?: React.ReactNode;

  /**
   * 버튼 아이콘 (오른쪽)
   */
  rightIcon?: React.ReactNode;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 버튼 내용
   */
  children?: React.ReactNode;
}

// ============================================
// Button Component
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'gradient',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-sans antialiased',
          'cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',

          // Variant & Size
          buttonVariants[variant],
          buttonSizes[size],

          // Full width
          fullWidth && 'w-full',

          // Disabled state
          isDisabled && [
            'cursor-not-allowed opacity-60',
            'hover:brightness-100 hover:scale-100',
          ],

          // Custom className
          className,
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && <ButtonSpinner />}

        {/* Left Icon */}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

        {/* Children */}
        {children && <span>{children}</span>}

        {/* Right Icon */}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

// ============================================
// Button Spinner Component
// ============================================

export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
