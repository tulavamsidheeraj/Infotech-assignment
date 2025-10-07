import { useState,useMemo, } from "react";

type InputVariant = 'filled' | 'outlined' | 'ghost';
type InputSize = 'sm' | 'md' | 'lg';
type InputType = 'text' | 'password';

interface InputFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    helperText?: string;
    errorMessage?: string;
    disabled?: boolean;
    invalid?: boolean;
    loading?: boolean;
    variant?: InputVariant;
    size?: InputSize;
    type?: InputType;
    onClear?: () => void;
    // Assume dark mode is handled by a parent class (e.g., 'dark' on the body)
}


const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.36-1.65"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const InputField: React.FC<InputFieldProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Enter value...',
    helperText,
    errorMessage,
    disabled = false,
    invalid = false,
    loading = false,
    variant = 'outlined',
    size = 'md',
    type = 'text',
    onClear,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const hasError = invalid && !!errorMessage;
    const inputId = useMemo(() => `input-field-${Math.random().toString(36).substring(2, 9)}`, []);

    // Base styling and size mapping
    const baseClasses = 'w-full transition-all duration-200 focus:outline-none rounded-lg';
    const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : '';

    const sizeClasses = useMemo(() => {
        switch (size) {
            case 'sm':
                return 'py-2 px-3 text-sm h-10';
            case 'lg':
                return 'py-3.5 px-5 text-lg h-14';
            case 'md':
            default:
                return 'py-3 px-4 text-base h-12';
        }
    }, [size]);

    // Variant styling
    const variantClasses = useMemo(() => {
        const errorBorder = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600';
        const focusRing = hasError ? '' : 'focus:ring-blue-500';

        switch (variant) {
            case 'filled':
                return `bg-gray-50 dark:bg-gray-700 border border-transparent ${focusRing} focus:border-blue-500 dark:focus:border-blue-500`;
            case 'ghost':
                return `border-b border-t-0 border-l-0 border-r-0 rounded-none bg-transparent ${errorBorder} focus:border-blue-500 dark:focus:border-blue-500`;
            case 'outlined':
            default:
                return `border ${errorBorder} bg-white dark:bg-gray-900 ${focusRing} focus:border-blue-500 dark:focus:border-blue-500`;
        }
    }, [variant, hasError]);

    // Icon container size adjustment
    const iconContainerSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const iconPlacementClasses = isPassword || loading || onClear ? 'pr-10' : '';

    // Determine the actual input type
    const inputType = isPassword && !showPassword ? 'password' : 'text';

    return (
        <div className="flex flex-col text-gray-900 dark:text-gray-100 w-full">
            {label && (
                <label htmlFor={inputId} className={`font-medium mb-1 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                <input
                    id={inputId}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    aria-invalid={invalid}
                    aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${iconPlacementClasses} placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                />

                {/* Right-side Icons Container */}
                <div className="absolute right-0 flex items-center space-x-2 mr-3 pointer-events-none h-full">
                    {loading && (
                        <div className={`text-blue-500 pointer-events-auto ${iconContainerSize}`}>
                            <LoadingSpinner />
                        </div>
                    )}

                    {onClear && value && !loading && !disabled && (
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label="Clear input"
                            className={`pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors ${iconContainerSize}`}
                        >
                            <XIcon />
                        </button>
                    )}
                    
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            disabled={disabled || loading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className={`pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors ${iconContainerSize}`}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    )}
                </div>
            </div>

            {/* Helper and Error Messages */}
            {hasError ? (
                <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">
                    {errorMessage}
                </p>
            ) : helperText ? (
                <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
};

export default InputField;