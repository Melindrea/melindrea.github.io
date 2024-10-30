/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function (context) {
  const page = context.data.root;
  let image = page.siteurl + '/assets/images/';
  if (page.image) {
    if (page.image.slug) {
      image += 'page-images/' + page.image.slug;
    } else if (page.context === 'post') {
      image = page.siteurl + page.featuredpath + '/1464.jpg';
    }
  } else {
    image += 'site-image.jpg';
  }

  return image;
};
