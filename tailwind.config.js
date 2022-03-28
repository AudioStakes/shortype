module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        '3d': '1px 3px rgb(208, 213, 219, 1), 1px 1px rgb(208, 213, 219, 1)',
        '3d-sm': '1px 2px rgb(208, 213, 219, 1), 1px 1px rgb(208, 213, 219, 1)',
      },
    },
    animation: {
      shake: 'shake',
      fadeOut: 'fadeOut',
    },
    keyframes: {
      shake: {
        '10%, 90%': { transform: 'translateX(-1px)' },
        '20%, 80%': { transform: 'translateX(2px)' },
        '30%, 50%, 70%': { transform: 'translateX(-4px)' },
        '40%, 60%': { transform: 'translateX(4px)' },
      },
      fadeOut: {
        '100%': {
          opacity: '0',
          transform: 'translateX(2%)',
        },
      },
    },
  },
  plugins: [],
}
