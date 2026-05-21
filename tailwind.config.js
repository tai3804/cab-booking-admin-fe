/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Luxury dark palette — deep obsidian surfaces
        surface: {
          base: '#09090b',
          DEFAULT: '#16161d',
          elevated: '#1e1e28',
          active: '#262633',
        },
        // Gold champagne accent — replaces violet
        accent: {
          primary: '#C5A059',
          hover: '#D4AF37',
          glow: 'rgba(197, 160, 89, 0.12)',
          muted: 'rgba(197, 160, 89, 0.08)',
        },
        // Ultra-subtle borders
        border: {
          light: 'rgba(255, 255, 255, 0.055)',
          medium: 'rgba(255, 255, 255, 0.10)',
          active: 'rgba(197, 160, 89, 0.45)',
        },
        // Text hierarchy
        text: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        // Refined status colors — muted jewel tones
        status: {
          success: '#50C878',
          'success-bg': 'rgba(80, 200, 120, 0.08)',
          warning: '#C5A059',
          'warning-bg': 'rgba(197, 160, 89, 0.08)',
          danger: '#8B2635',
          'danger-bg': 'rgba(139, 38, 53, 0.08)',
          info: '#4A90D9',
          'info-bg': 'rgba(74, 144, 217, 0.08)',
        },
      },
      boxShadow: {
        // Soft deep shadows — no neon colors
        'card': '0 1px 3px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 2px 6px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4)',
        'accent': '0 2px 8px rgba(197, 160, 89, 0.15)',
        'accent-hover': '0 4px 16px rgba(197, 160, 89, 0.22)',
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '18px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
