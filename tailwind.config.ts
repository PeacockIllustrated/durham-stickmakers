import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stick: {
          walnut:    '#2C2417',  // Headlines, nav, dark UI, primary buttons
          shale:     '#555248',  // Body text
          linen:     '#FAFAF8',  // Primary background
          brass:     '#C4A265',  // Primary accent, CTAs, links, hover
          stone:     '#EDEAE4',  // Cards, secondary backgrounds, dividers
          fell:      '#3D5E4A',  // Success states, secondary accent
          driftwood: '#8A7D6B',  // Muted text, borders, metadata
          cream:     '#F0EDE7',  // Tags, badges, subtle fills
        },
      },
      fontFamily: {
        heading: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero':  ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h1':    ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'h2':    ['1.75rem', { lineHeight: '1.25' }],
        'h3':    ['1.375rem',{ lineHeight: '1.3'  }],
        'h4':    ['1.125rem',{ lineHeight: '1.4'  }],
        'body':  ['1rem',    { lineHeight: '1.65' }],
        'small': ['0.875rem',{ lineHeight: '1.5'  }],
        'xs':    ['0.75rem', { lineHeight: '1.4'  }],
      },
      borderRadius: {
        'card': '0.75rem',
      },
      spacing: {
        'section': '5rem',
        'section-sm': '3rem',
      },
      maxWidth: {
        'content': '72rem',
        'prose': '42rem',
      },
      backgroundImage: {
        'walnut-gradient': 'linear-gradient(to bottom, #2C2417, #3D3225)',
      },
    },
  },
  plugins: [],
};

export default config;
