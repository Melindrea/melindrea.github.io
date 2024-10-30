
import { DateTime } from 'luxon';
import Path from 'node:path';
import slug from 'slug';

import { pathToLink } from './file-functions.js';

export default function gallery(options) {
    options = options || {};
    let galleryMetadata = options.galleryMetadata || {};
    return function(files, metalsmith, done) {
        setImmediate(done);

        // Parses the gallery and adds metadata
        let gallery = options.gallery || metalsmith.metadata().collections.gallery;
        let imageInfo = {
            gallery: {
                sizes: []
            },
            thumbnails: {
                sizes: []
            }
        }
        
        for (let i = 0; i < gallery.length; i++) {
            let item = gallery[i];
            let basename = Path.basename(item.path);
            let filename = Path.parse(item.path).name
            
            if (basename in galleryMetadata) {
                let metadata = galleryMetadata[basename];
                metadata.pubdate = DateTime.fromISO(metadata.pubdate).toJSDate();
                
                item.thumbnail = Path.dirname(item.path) + Path.sep + 'thumbnails' + Path.sep + basename;
                item.thumb_src = pathToLink(item.thumbnail);
                item.link = pathToLink(item.path);
                item.slug = slug(filename)
                
                Object.assign(item, metadata);
                
                imageInfo.gallery.sizes.push(item.stats.size);
                let thumbnail = files[item.thumbnail];
                
                imageInfo.thumbnails.sizes.push(thumbnail.stats.size);
                let merchify = true;
                if ('no-merch' in metadata) {
                    merchify = ! metadata['no-merch'];
                }
                
                if (! ('links' in metadata) && merchify) {
                    console.log(basename + ' : ' + metadata.title + ' : ' + metadata.description)
                }
                
            } else {
                console.warn("NB! Image file " + basename + " is not in gallery metadata")
            }
        }
        
        // Parses through files and create a featured images thing
        metalsmith.metadata().images = [];
        Object.keys(files).filter(p => p.endsWith('.html')).forEach(file_path => {
            let file = files[file_path];
            
            if ('image' in file) {
                let image = file.image;
                let context = 'page';
                if ('context' in file) {
                    context = file.context;
                }
                let object = {
                    page: {
                        title: file.title,
                        link: '/' + pathToLink(file_path),
                        type: context
                    },
                    source: image.source,
                    creator: image.creator
                };
                
                metalsmith.metadata().images.push(object);
            }
        });

        Object.keys(imageInfo).forEach(key => {
            //console.log(key);
            let sizes = imageInfo[key].sizes;
            
            let typeData = {
                number: sizes.length,
                average: Math.round(sizes.reduce((a,b)=>a+b)/sizes.length/1024),
                max: Math.round(Math.max(...sizes)/1024),
                min: Math.round(Math.min(...sizes)/1024)
            };
            
            //console.log(typeData);
        });   
    }
}
