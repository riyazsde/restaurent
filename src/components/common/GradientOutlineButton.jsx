import React from 'react';

const GradientOutlineButton = ({ 
  onClick, 
  children, 
  className = "", 
  innerClassName = "",
  textClassName = "",
  icon = null,
  variant = "outline",
  type = "button",
  disabled = false,
  ...props
}) => {
  if (variant === "solid") {
    return (
      <button 
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`h-[42px] bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white px-5 rounded-xl font-medium font-poppins flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap ${className}`}
        {...props}
      >
        {icon && <span className="flex items-center justify-center text-white">{icon}</span>}
        <span className={`text-white text-sm md:text-[15px] font-medium font-poppins ${textClassName}`}>
          {children}
        </span>
      </button>
    );
  }

  if (variant === "subtle" || variant === "borderless") {
    return (
      <button 
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`h-[42px] bg-[#FAEFF5] hover:bg-[#F3E2ED] active:scale-[0.98] text-gray-900 px-4 sm:px-5 rounded-xl font-medium font-poppins flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 whitespace-nowrap border-0 shadow-none ${className}`}
        {...props}
      >
        {icon && <span className="flex items-center justify-center text-gray-800">{icon}</span>}
        <span className={`text-gray-900 text-sm md:text-[15px] font-medium font-poppins whitespace-nowrap ${textClassName}`}>
          {children}
        </span>
      </button>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        border: '1.2px solid transparent',
        backgroundImage: 'linear-gradient(135deg, #FAF2F7, #FDF3F8), linear-gradient(180deg, #6A1B9A, #D32F2F)',
        backgroundOrigin: 'padding-box, border-box',
        backgroundClip: 'padding-box, border-box',
        ...props.style
      }}
      className={`gradient-outline-btn h-[38px] sm:h-[40px] px-4 sm:px-5 rounded-[12px] text-black font-medium font-poppins inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-2xs ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center text-gray-800">{icon}</span>}
      <span className={`text-black text-sm md:text-[15px] font-medium font-poppins whitespace-nowrap ${textClassName}`}>
        {children}
      </span>
    </button>
  );
};

export default GradientOutlineButton;
