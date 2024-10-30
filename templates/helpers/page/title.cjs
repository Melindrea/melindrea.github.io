/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function (context) {
  const page = context.data.root;
  const pageTitle = page.title;
  const siteTitle = page.sitename;
  if (page.layout === 'index.hbs') { // Index page
    return siteTitle;
  }

  const titlebits = [
    pageTitle
  ];

  if (page.context) {
    if (page.context === 'tag') {
      titlebits.push('Tags');
    } else if (page.context === 'post') {
      titlebits.push('Posts');
    }
  }

  titlebits.push(siteTitle);
  return titlebits.join(page.titlesep);
};
