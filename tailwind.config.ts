import type { Config } from "tailwindcss";

// Palette note: original brown/walnut hues were replaced with slate-blue hues
// pulled from the brand's existing site. Token names are kept for minimal-diff
// migration — "walnut" now refers to a deep slate, "driftwood" to a muted slate.
// Brass (gold/amber) is retained as the accent — slate + brass is a classic
// heritage combo.
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
          walnut:    '#2F3842',  // Deep slate — headlines, nav, dark UI, primary buttons
          shale:     '#4A5563',  // Medium slate — body text
          linen:     '#FAFAF8',  // Warm off-white — primary background
          brass:     '#C4A265',  // Brass / amber — primary accent, CTAs, links, hover
          stone:     '#E4E7EC',  // Cool pale grey — cards, secondary backgrounds, dividers
          fell:      '#3D5E4A',  // Heritage green — success states, secondary accent
          driftwood: '#7A8593',  // Muted slate — metadata, borders
          cream:     '#EEF0F3',  // Cool pale — tags, badges, subtle fills
          surface:   '#FFFFFF',  // Raised surfaces — cards, form panels
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
        'walnut-gradient': 'linear-gradient(to bottom, #2F3842, #3F4A56)',
      },
    },
  },
  plugins: [],
};

export default config;
