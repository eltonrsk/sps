// Design System for Student Pickup System
// This file contains consistent design tokens and patterns for the entire application

export const colors = {
  // Primary Colors
  primary: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
  
  // Status Colors
  status: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.75rem', // 28px
};

export const fontSize = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Consistent component patterns
export const patterns = {
  // Card styles
  card: {
    base: 'bg-white rounded-3xl border border-gray-200 shadow-sm',
    hover: 'hover:shadow-lg hover:border-blue-200',
    interactive: 'cursor-pointer hover:bg-blue-50/30 transition-all',
  },
  
  // Button styles
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20',
  },
  
  // Input styles
  input: {
    base: 'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all',
    error: 'border-red-300 focus:ring-red-500',
  },
  
  // Badge styles
  badge: {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  
  // Icon container styles
  iconContainer: {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl',
  },
  
  // Status colors for icons
  iconBackground: {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  },
};

// Animation variants
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  stagger: (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  }),
};

// Utility functions for consistent styling
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'verified':
    case 'completed':
    case 'recent':
      return patterns.badge.success;
    case 'warning':
    case 'pending':
    case 'today':
      return patterns.badge.warning;
    case 'error':
    case 'failed':
    case 'inactive':
      return patterns.badge.error;
    case 'info':
    default:
      return patterns.badge.info;
  }
};

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return patterns.iconBackground.purple;
    case 'security':
      return patterns.iconBackground.red;
    case 'teacher':
      return patterns.iconBackground.blue;
    case 'parent':
    default:
      return patterns.iconBackground.green;
  }
};
