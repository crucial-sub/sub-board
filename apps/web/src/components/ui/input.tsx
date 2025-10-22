import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Input Variants & Sizes
// ============================================

const inputVariants = {
  // Default glass-morphism input
  default: [
    'border border-white/60',
    'bg-gradient-to-br from-white/86 to-white/72',
    'text-text-primary placeholder:text-text-subtle',
    'shadow-[0_25px_45px_-24px_rgba(15,23,42,0.28)]',
    'backdrop-blur-[32px] backdrop-saturate-[1.8]',
    'transition-all duration-200',
    'focus:border-brand/40 focus:shadow-[0_12px_24px_-12px_rgba(10,132,255,0.35)]',
    'hover:border-white/80',
  ].join(' '),

  // Outline input (simpler)
  outline: [
    'border border-border-default',
    'bg-white',
    'text-text-primary placeholder:text-text-subtle',
    'shadow-sm',
    'transition-all duration-200',
    'focus:border-brand focus:ring-1 focus:ring-brand/20',
    'hover:border-border-default/80',
  ].join(' '),

  // Ghost input (minimal, borderless)
  ghost: [
    'border-0 border-b-2 border-border-muted',
    'bg-transparent',
    'text-text-primary placeholder:text-text-subtle',
    'transition-all duration-200',
    'focus:border-brand',
    'hover:border-border-default',
  ].join(' '),
} as const;

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-xl',
  lg: 'px-5 py-3 text-lg rounded-2xl',
} as const;

// ============================================
// Types
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * 인풋의 시각적 스타일 변형
   * @default "default"
   */
  variant?: keyof typeof inputVariants;

  /**
   * 인풋의 크기
   * @default "md"
   */
  inputSize?: keyof typeof inputSizes;

  /**
   * 전체 너비 인풋 여부
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 에러 상태 (빨간 테두리)
   * @default false
   */
  error?: boolean;

  /**
   * 왼쪽 아이콘
   */
  leftIcon?: React.ReactNode;

  /**
   * 오른쪽 아이콘
   */
  rightIcon?: React.ReactNode;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

// ============================================
// Input Component
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      fullWidth = false,
      error = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    // If icons are provided, wrap input in a container
    if (leftIcon || rightIcon) {
      return (
        <div
          className={cn(
            'relative inline-flex items-center',
            fullWidth && 'w-full',
          )}
        >
          {/* Left Icon */}
          {leftIcon && (
            <span className="absolute left-3 text-text-subtle pointer-events-none">
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full font-sans antialiased',
              'focus-visible:outline-none',

              // Variant & Size
              inputVariants[variant],
              inputSizes[inputSize],

              // Icon padding
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',

              // Error state
              error && [
                'border-red-500/50',
                'focus:border-red-500 focus:ring-red-500/20',
              ],

              // Disabled state
              disabled && [
                'cursor-not-allowed opacity-60',
                'hover:border-border-default',
              ],

              // Custom className
              className,
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <span className="absolute right-3 text-text-subtle pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    // Regular input without icons
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'font-sans antialiased',
          'focus-visible:outline-none',

          // Variant & Size
          inputVariants[variant],
          inputSizes[inputSize],

          // Full width
          fullWidth && 'w-full',

          // Error state
          error && [
            'border-red-500/50',
            'focus:border-red-500 focus:ring-1 focus:ring-red-500/20',
          ],

          // Disabled state
          disabled && [
            'cursor-not-allowed opacity-60',
            'hover:border-border-default',
          ],

          // Custom className
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

// ============================================
// Textarea Component
// ============================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 텍스트에어리어의 시각적 스타일 변형
   * @default "default"
   */
  variant?: keyof typeof inputVariants;

  /**
   * 텍스트에어리어의 크기
   * @default "md"
   */
  textareaSize?: keyof typeof inputSizes;

  /**
   * 전체 너비 텍스트에어리어 여부
   * @default false
   */
  fullWidth?: boolean;

  /**
   * 에러 상태 (빨간 테두리)
   * @default false
   */
  error?: boolean;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      textareaSize = 'md',
      fullWidth = false,
      error = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'font-sans antialiased',
          'focus-visible:outline-none',
          'resize-y min-h-[100px]',

          // Variant & Size
          inputVariants[variant],
          inputSizes[textareaSize],

          // Full width
          fullWidth && 'w-full',

          // Error state
          error && [
            'border-red-500/50',
            'focus:border-red-500 focus:ring-1 focus:ring-red-500/20',
          ],

          // Disabled state
          disabled && [
            'cursor-not-allowed opacity-60',
            'hover:border-border-default',
          ],

          // Custom className
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

// ============================================
// Label Component
// ============================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * 필수 필드 표시 여부
   * @default false
   */
  required?: boolean;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 라벨 내용
   */
  children?: React.ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-semibold text-text-primary mb-1.5',
          className,
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1" aria-label="필수">*</span>}
      </label>
    );
  },
);

Label.displayName = 'Label';

// ============================================
// FormField Component (Label + Input/Textarea)
// ============================================

export interface FormFieldProps {
  /**
   * 라벨 텍스트
   */
  label: string;

  /**
   * 필수 필드 표시 여부
   * @default false
   */
  required?: boolean;

  /**
   * 에러 메시지
   */
  error?: string;

  /**
   * 도움말 텍스트
   */
  helperText?: string;

  /**
   * Input 또는 Textarea 컴포넌트
   */
  children: React.ReactElement;
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>

      {/* Clone child with error prop */}
      {children}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p className="text-xs text-text-subtle mt-1">{helperText}</p>
      )}
    </div>
  );
}
