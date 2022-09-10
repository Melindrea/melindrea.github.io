/*
 * Custom theme helpers for Handlebars.js
 */
// FYI: context === options
module.exports = function(context) {
    const currentMenuItem = context.data.key,
          breadcrumbs = context.data.root.breadcrumbs;

    let conditional = false;
    if (breadcrumbs.length < 2) {
      conditional = (currentMenuItem === 'home');
    } else {
      if (currentMenuItem !== 'home') {
        conditional = (breadcrumbs[1].key === currentMenuItem);
      }
    }

    if (conditional) {
      return context.fn(this);
    } else {
      return context.inverse(this);
    }
  };

