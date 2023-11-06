/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      jetbrains: ['JetBrains Mono', ...defaultTheme.fontFamily.sans],
    },
    // screens: {
    //   tablet: '960px',
    //   desktop: '1248px',
    // },
    extend: {
      maxWidth: {
        site: '90rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};
