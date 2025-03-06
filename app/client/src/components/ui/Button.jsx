import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styles that apply to all buttons
  const baseStyles = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  // Size variations
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    default: "px-4 py-2.5",
    large: "px-6 py-3 text-lg"
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
    outline: "border border-white/10 text-white hover:bg-white/5",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90"
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Disabled styles
  const disabledStyles = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyles}
    ${disabledStyles}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && icon}
      {children}
    </button>
  );
};

export default Button;