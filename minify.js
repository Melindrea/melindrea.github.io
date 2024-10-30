const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

minify({
  compressor: terser,
  input: 'build/assets/js/*.max.js',
  output: 'build/assets/js/scripts.min.js',
  options: {
    warnings: true, // pass true to display compressor warnings.
    mangle: false // pass false to skip mangling names.
  },
  callback: function (err, min) {
    if (err) console.error(err);
  }
});
