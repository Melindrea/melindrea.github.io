module.exports = {
  content: [
      "./templates/*.jinja"
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Playfair Display', 'serif'],
    },
    extend: {
      backgroundImage: {
        'dark': "url('/static/images/dark-wood.png')",
        'light': "url('/static/images/subtle-light-pattern.jpg')",
      }
    },
  },
  plugins: [],
}
