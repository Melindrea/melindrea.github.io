
import { DateTime } from 'luxon';
import Path from 'node:path';
import slug from 'slug';

import { pathToLink } from './file-functions.js';

export default function gallery (options) {
  options = options || {};
  const galleryMetadata = options.galleryMetadata || {};
  return function (files, metalsmith, done) {
    setImmediate(done);

    // Parses the gallery and adds metadata
    const gallery = options.gallery || metalsmith.metadata().collections.gallery;
    const imageInfo = {
      gallery: {
        sizes: []
      },
      thumbnails: {
        sizes: []
      }
    };

    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i];
      const basename = Path.basename(item.path);
      const filename = Path.parse(item.path).name;

      if (basename in galleryMetadata) {
        const metadata = galleryMetadata[basename];
        metadata.pubdate = DateTime.fromISO(metadata.pubdate).toJSDate();

        item.thumbnail = Path.dirname(item.path) + Path.sep + 'thumbnails' + Path.sep + basename;
        item.thumb_src = pathToLink(item.thumbnail);
        item.link = pathToLink(item.path);
        item.slug = slug(filename);

        Object.assign(item, metadata);

        imageInfo.gallery.sizes.push(item.stats.size);
        const thumbnail = files[item.thumbnail];

        imageInfo.thumbnails.sizes.push(thumbnail.stats.size);
        let merchify = true;
        if ('no-merch' in metadata) {
          merchify = !metadata['no-merch'];
        }

        if (!('links' in metadata) && merchify) {
          console.log(basename + ' : ' + metadata.title + ' : ' + metadata.description + ' has no merch.');
        }
      } else {
        console.warn('NB! Image file ' + basename + ' is not in gallery metadata');
      }
    }

    // Parses through files and create a featured images thing
    metalsmith.metadata().images = [];
    Object.keys(files).filter(p => p.endsWith('.html')).forEach(filePath => {
      const file = files[filePath];

      if ('image' in file) {
        const image = file.image;
        let context = 'page';
        if ('context' in file) {
          context = file.context;
        }
        const object = {
          page: {
            title: file.title,
            link: '/' + pathToLink(filePath),
            type: context
          },
          source: image.source,
          creator: image.creator
        };

        metalsmith.metadata().images.push(object);
      }
    });

    // TODO: Proper debugging!
    /* Object.keys(imageInfo).forEach(key => {
      const sizes = imageInfo[key].sizes;

      const typeData = {
        number: sizes.length,
        average: Math.round(sizes.reduce((a, b) => a + b) / sizes.length / 1024),
        max: Math.round(Math.max(...sizes) / 1024),
        min: Math.round(Math.min(...sizes) / 1024)
      };

      console.log(typeData);
    }); */
  };
}
