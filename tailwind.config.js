module.exports = {
  content: [
      "./templates/**/*.hbs",
      "./src/**/*.md"
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Playfair Display', 'serif'],
    },
    extend: {
      backgroundImage: {
        'dark': "url('/assets/images/dark-wood.png')",
        'light': "url('/assets/images/subtle-light-pattern.jpg')",
      }
    },
  },
  plugins: [],
}
