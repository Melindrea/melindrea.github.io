import fs from 'fs';
import pluralize from 'pluralize';
import slug from 'slug';
import Path from 'node:path';

export function addDates (files, metalsmith) {
  Object.keys(files).filter(p => p.endsWith('.html')).forEach(path => {
    if (!files[path].pubdate &&
            files[path].stats.birthtime) {
      files[path].pubdate = files[path].stats.birthtime;
    }

    let lastmod = files[path].stats.mtime || false;
    const layoutFile = files[path].layout;

    // these are files where modifications may be  made in layout
    if (layoutFile === 'gallery.hbs' || layoutFile === 'index.hbs') {
      const stats = fs.statSync('templates' + Path.sep + layoutFile);
      if (lastmod < stats.mtime) {
        lastmod = stats.mtime;
      }
    }
    files[path].lastmod = lastmod;
  });
}

export function bodyClasses (files, metalsmith) {
  // Only HTML-files
  Object.keys(files).filter(p => p.endsWith('.html')).forEach(filepath => {
    const sections = filepath.split(Path.sep);
    let bodyClasses = [];

    // Adds body classes to define features, like sidebar
    if ('features' in files[filepath]) {
      bodyClasses = Object.keys(files[filepath].features).map(x => 'with-' + x);
    }
    // this removes .hbs and if it's sectioned (ex blog/listing) only takes the first word
    const layout = files[filepath].layout;

    if (layout) {
      const bodyClass = layout.split('.')[0].split('/')[0];
      bodyClasses.push(bodyClass);
    }

    // These particular pages/sections require different classes
    if (['blog', 'index.html', 'privacy-cookies'].includes(sections[0])) {
      switch (sections[0]) {
        case 'index.html':
          bodyClasses.push('faq');
          break;

        case 'privacy-cookies':
          bodyClasses.push('policy');
          break;

        case 'blog':
          if (sections[1] !== 'index.html') {
            bodyClasses.push(...[pluralize.singular(sections[1]), slug(files[filepath].title)]);
          }

          break;
      }
    } else {
      bodyClasses.push(sections[0]);
    }
    bodyClasses = [...new Set(bodyClasses)]; // Only unique values

    files[filepath].bodyClasses = bodyClasses;
  });
}

export function breadcrumbs (files, metalsmith) {
  const navigation = metalsmith.metadata().navigation;

  Object.keys(files).filter(p => p.endsWith('.html')).forEach(path => {
    const sections = path.split(Path.sep);

    let breadcrumbs = [
      {
        text: navigation.home.name,
        url: navigation.home.url,
        key: 'home'
      }
    ];

    if (sections[0] !== 'index.html') { // This is a page
      if (sections[0] in navigation) {
        breadcrumbs.push({
          text: navigation[sections[0]].name,
          url: navigation[sections[0]].url,
          key: sections[0]

        });
      } else {
        breadcrumbs.push({
          text: files[path].header,
          url: false,
          key: sections[0]

        });
      }

      if (sections[1] !== 'index.html') { // This is subpage
        if (sections[0] === 'blog') { // Blog post or tag
          breadcrumbs.push({
            text: files[path].header,
            url: false,
            key: slug(files[path].title)
          });
        }
      } else {
        breadcrumbs[1].url = false;
      }
    } else { // Home page
      breadcrumbs = [];
    }
    files[path].breadcrumbs = breadcrumbs;
  });
}

export function github (files, metalsmith) {
  // This just creates the empty .nojekyll file

  files['.nojekyll'] = {
    contents: Buffer.from('', 'utf-8')
  };
  const regex = /(https?:\/\/)/i;
  const cname = metalsmith.metadata().siteurl.replace(regex, '');
  files.CNAME = {
    contents: Buffer.from(cname, 'utf-8')
  };
}

export function favicons (files, metalsmith) {
  const faviconData = JSON.parse(fs.readFileSync('faviconData.json'));

  metalsmith.metadata().favicons = faviconData.favicon.html_code;
}

export function pathToLink (path) {
  return path.replaceAll(Path.sep, Path.posix.sep);
}
