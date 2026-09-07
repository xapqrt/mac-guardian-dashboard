/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#08080a',
        accent: {
          DEFAULT: '#7C3AED',
          primary: '#7C3AED',
          cyan: '#22D3EE',
          danger: '#EF4444',
          hover: '#6D28D9',
        },
        surface: {
          DEFAULT: '#08080a',
          card: 'rgba(255, 255, 255, 0.05)',
          muted: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.1)',
          borderHover: 'rgba(255, 255, 255, 0.2)',
        },
        text: {
          primary: '#F5F5F7',
          secondary: '#8A8A93',
          muted: '#8A8A93',
        },
        oled: {
          pitch: '#08080a',
          surface: '#0d0d12',
          subtle: '#14141b',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        DEFAULT: '1rem',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'SFMono-Regular',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ],
      },
      boxShadow: {
        'card': '0 4px 24px -1px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'card-hover': '0 12px 36px -4px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'violet-glow': '0 0 40px rgba(124, 58, 237, 0.2)',
        'violet-btn': '0 0 24px rgba(124, 58, 237, 0.4)',
        'cyan-glow': '0 0 30px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
}
