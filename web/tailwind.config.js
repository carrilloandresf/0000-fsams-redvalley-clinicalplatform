const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, './index.html'),
    join(__dirname, './src/**/*.{js,jsx,ts,tsx}')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};