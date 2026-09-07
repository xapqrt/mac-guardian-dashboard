/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oled: {
          pitch: '#000000',
          surface: '#0d0d0f',
          subtle: '#141417',
        },
        titanium: {
          hairline: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.16)',
        },
        apple: {
          bg: '#000000',
          card: '#0d0d0f',
          cardHover: '#131316',
          surface: '#1c1c1e',
          surfaceHover: '#2c2c2e',
          border: 'rgba(255, 255, 255, 0.08)',
          borderStrong: 'rgba(255, 255, 255, 0.16)',
          blue: '#0071e3',
          blueHover: '#0077ed',
          blueLight: '#2997ff',
          gray: '#86868b',
          grayLight: '#a1a1a6',
          grayDark: '#424245',
          green: '#30d158',
          orange: '#ff9f0a',
          red: '#ff453a',
          purple: '#bf5af2',
        },
        functional: {
          emerald: '#30d158',
          amber: '#ff9f0a',
          danger: '#ff453a',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
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
        'apple-card': '0 4px 24px -1px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'apple-card-hover': '0 12px 36px -4px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'apple-pill': '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'apple-blue': '0 4px 14px rgba(0, 113, 227, 0.35)',
        'chamfer-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 12px 32px -8px rgba(0, 0, 0, 0.8)',
        'chamfer-control': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'titanium': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 12px 36px -8px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}
