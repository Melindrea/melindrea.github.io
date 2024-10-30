/*
 * Custom theme helpers for Handlebars.js
 */

module.exports = function (links, context) {
  const mapping = {
    redbubble: {
      text: 'Buy products',
      external: true
    },
    post: {
      text: 'About image',
      external: false
    }
  };
  const formattedlinks = [];
  Object.keys(links).forEach(type => {
    const linkMap = mapping[type];
    let link = '<a href="' + links[type] + '"';

    if (linkMap.external) {
      link += ' target="_blank" rel="noopener noreferrer"';
    }

    link += '>' + linkMap.text + '</a>';
    if (links[type]) {
      formattedlinks.push(link);
    }
  });

  if (formattedlinks.length < 1) {
    return;
  }

  if (formattedlinks.length === 1) {
    return ' ' + formattedlinks[0];
  }

  return '<br>' + formattedlinks.join(' || ');
};
