// Inspired by the work by Tim De Pauw, but combining helpers & partials,
// as well as handling both Windows and POSIX

import defaults from 'defaults';
import Handlebars from 'handlebars';
import fs from 'fs';
import Path from 'path';
import { globSync } from 'glob';
import { pathToFileURL } from 'url';

export default function plugin (options) {
  options = defaults(options, {
    directories: {
      helpers: 'helpers',
      partials: 'partials'
    },
    patterns: {
      helpers: '.?(c|m)js',
      partials: '.hbs'
    }
  });

  return function (files, metalsmith, done) {
    // This ensures the path works with glob() even on Windows
    for (const type in options.directories) {
      const directory = options.directories[type];

      // This ensures the path works with glob() even on Windows
      const globBasedir = metalsmith.path(directory).replaceAll(Path.sep, Path.posix.sep) + Path.posix.sep;
      const localBasedir = metalsmith.path(directory) + Path.sep;
      const fullPath = globBasedir + '**/*' + options.patterns[type];

      const files = globSync(fullPath);

      files.forEach(file => {
        const id = file.replace(localBasedir, '').replace(Path.extname(file), '').replaceAll(Path.sep, '-');
        const fileURL = pathToFileURL((Path.resolve(file))).href;

        switch (type) {
          case 'helpers':
            import(fileURL)
              .then(fn => {
                Handlebars.registerHelper(id, fn.default);
                done();
              })
              .catch(error => console.log(error));
            break;
          case 'partials':
            fs.readFile(file, 'utf8', function (err, contents) {
              if (err) {
                console.log(err);
                return done(err);
              }

              Handlebars.registerPartial(id, contents);
              done();
            });
            break;
        }

        done();
      });
    }
  };
}
