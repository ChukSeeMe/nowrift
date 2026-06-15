import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'near-black': 'var(--color-near-black)',
        'rift-red': 'var(--color-rift-red)',
        'off-white': 'var(--color-off-white)',
        'surface': 'var(--color-surface)',
        'border': 'var(--color-border)',
        'muted': 'var(--color-muted)',
        'dev-blue': 'var(--color-dev-blue)',
        'grant-green': 'var(--color-grant-green)',
        'sec-amber': 'var(--color-sec-amber)',
        'founders-purple': 'var(--color-founders-purple)',
        'creators-teal': 'var(--color-creators-teal)',
      },
      fontFamily: {
        headlines: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        data: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
