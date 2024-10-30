module.exports = {
  content: [
    './templates/**/*.hbs',
    './src/**/*.md'
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Cormorant', 'serif']
    },
    extend: {
      backgroundImage: {
        dark: "url('/assets/images/dark-1.jpg')",
        light: "url('/assets/images/light-1.jpg')"
      }
    }
  },
  plugins: []
};
