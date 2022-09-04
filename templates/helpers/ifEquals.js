/*
 * Custom theme helpers for Handlebars.js
 */
// FYI: context === options
let ifEquals = function(context, options) {
    
    if (options.hash.comparison === context) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  };

module.exports = ifEquals;
