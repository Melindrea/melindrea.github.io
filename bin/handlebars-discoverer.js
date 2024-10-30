// Inspired by the work by Tim De Pauw, but combining helpers & partials,
// as well as handling both Windows and POSIX

import defaults from 'defaults';
import Handlebars from 'handlebars';
import fs from 'fs';
import Path from 'path';
import { globSync } from 'glob';
import { pathToFileURL } from 'url';

export default function plugin(options) {
    options = defaults(options, {
        directories: {
            helpers: 'helpers',
            partials: 'partials',
        },
        patterns: {
            helpers: '.?(c|m)js',
            partials: '.hbs',
        }
    });
    
    return function (files, metalsmith, done) {
        // This ensures the path works with glob() even on Windows
        for (let type in options.directories) {      
            let directory = options.directories[type];
            
            // This ensures the path works with glob() even on Windows
            let glob_basedir = metalsmith.path(directory).replaceAll(Path.sep, Path.posix.sep) + Path.posix.sep; 
            let local_basedir = metalsmith.path(directory) + Path.sep;
            let fullPath = glob_basedir + '**/*' + options.patterns[type];
                        
            let files = globSync(fullPath);

            files.forEach(file => {
                let id = file.replace(local_basedir, '').replace(Path.extname(file), '').replaceAll(Path.sep, '-');
                switch (type) {
                    case 'helpers':
                        let fileURL = pathToFileURL((Path.resolve(file))).href;
                        
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
                            console.log(err)
                            return done(err)
                            }
                            
                            Handlebars.registerPartial(id, contents);
                            done();
                        });
                        break;
                }
                
                done();
            });
        }
    }
}