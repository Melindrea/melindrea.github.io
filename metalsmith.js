import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import Metalsmith from 'metalsmith';
import collections from '@metalsmith/collections';
import layouts from '@metalsmith/layouts';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';
import publish from 'metalsmith-publish';
import discoverPartials from 'metalsmith-discover-partials';
import discoverHelpers from 'metalsmith-discover-helpers';
import postcss from '@metalsmith/postcss';
import include from 'metalsmith-include-files';
import concat from 'metalsmith-concat';
import sitemap from 'metalsmith-sitemap';
import toc from '@metalsmith/table-of-contents';

// My plugins
import rss from './bin/rss.js';
import gallery from './bin/gallery.js';
import blog from './bin/blog.js';
import { addDates, bodyClasses, breadcrumbs, github, favicons } from './bin/file-functions.js';

// JSON objects
import packageJson from './package.mjs';
import galleryMetadata from './gallery.mjs';
    
const __dirname = dirname(fileURLToPath(import.meta.url));
const t1 = performance.now();
const env = process.env.NODE_ENV || 'development';
const devMode = ['development', 'dev'].includes(env);
const melindreamakes = packageJson.melindreamakes;
const repository = packageJson.repository;

function presence(files, metalsmith) {
    Object.keys(files).forEach(path => {
      if (files[path].presence) {
          files[path].presence = melindreamakes.presence;
      }
  
      if (files[path].mastodon) {
          files[path].mastodon = melindreamakes.mastodon;
      }
    })
}

function check(files, metalsmith) {
    Object.keys(files).forEach(filepath => {
        
    //metalsmith.metadata().collections.blog.forEach(post => {
        /*if (post.toc) {
            console.log(post.title)
            console.log(post.toc)
        }*/
    //Object.keys(files).forEach(path => {
        //console.log(path);
        //console.log(files[path]);
    });
    let thingy = 'blog'
    //console.log(metalsmith.metadata().collections[thingy]);
    //console.log(metalsmith.metadata().images);

}

// Run Metalsmith in the current directory.
// When the .build() method runs, this reads
// and strips the frontmatter from each of our
// source files and passes it on to the plugins.
Metalsmith(__dirname)
    .metadata({
        repository: repository,
        ...melindreamakes.metadata
    })
    .source('./src')            // source directory
    .destination('./docs')     // destination directory
    .clean(true)                // clean destination before
    .ignore('**/*.DS_Store')
    .use(postcss({
        plugins: {
            'postcss-import': {},
            'tailwindcss': {},
            'autoprefixer': {}
        }
    }))
    .use(include({            // include external JavaScript
        directories: {
            'assets/js': [
                './node_modules/jquery/dist/jquery.slim.min.js'
        
            ],
            'assets/fonts': [
                './node_modules/lightgallery/fonts/*'
            ],
            'assets/images': [
                './node_modules/lightgallery/images/*'
            ],
            '' : [
                'favicons/*'
            ]
        }
    }))
    .use(concat({
        files: [
            'assets/js/main.max.js' // found in src
        ],
        searchPaths: ['node_modules'],
        output: 'assets/js/scripts.max.js'
    }))
    .use(concat({
        files: [
            'lightgallery/lightgallery.min.js', // found in node_modules
            'lightgallery/plugins/thumbnail/lg-thumbnail.min.js', // found in node_modules
            'lightgallery/plugins/zoom/lg-zoom.min.js' // found in node_modules
        ],
        searchPaths: ['node_modules'],
        output: 'assets/js/lightgallery.min.js'
    }))
    // Use @metalsmith/markdown to convert
    // our source files' content from markdown
    // to HTML fragments.
    .use(markdown())
    .use(favicons)
    .use(addDates)
    .use(publish({
        futureMeta: 'pubdate',
        draft: devMode,
        private: devMode,
        unlisted: devMode
    }))
    .use(permalinks({
        relative: false
    }))
    .use(collections({
        gallery: 'assets/images/gallery/*.{jpg,png}',
        updates: {
          metadata: {
            title: 'Updates',
            header: 'Brief updates',
            description: 'Quick details about what is going on',
            path: 'updates',
            postTemplate: 'micro',
            listClass: 'updates',
          },
          pattern: 'updates/**/*.html',
          refer: false,
          sortBy: 'pubdate',
          reverse: true
        },
        blog: {
            pattern: 'blog/**/*.html',
            sortBy: 'pubdate',
            reverse: true,
            metadata: {
                title: 'Blog',
                header: 'All blog posts',
                description: 'Where I share my thoughts, ideas and general musings',
                index: true,
                path: 'blog',
                postTemplate: 'long',
                listClass: 'blog-index',
                widgets: {
                    tags: {
                        position: 'sidebar'
                    }
                },
                features: {
                    'sidebar': true
                }
            }
        }
    }))
    .use(blog({
        dev: devMode
    }))
    .use(gallery({
        galleryMetadata: galleryMetadata
    }))
    .use(rss({
        url: melindreamakes.metadata.siteurl,
        title: melindreamakes.metadata.sitename,
        description: melindreamakes.metadata.description,
        copyright: melindreamakes.metadata.copyright
    }))
    .use(presence)
    .use(breadcrumbs)
    .use(bodyClasses)
    .use(check)
    .use(discoverHelpers({
        directory: 'templates/helpers',
        pattern: '.cjs'
    }))
    .use(discoverPartials({
        directory: 'templates/partials'
    }))
    .use(toc())
    // Put the HTML fragments from the step above
    // into our template, using the Frontmatter
    // properties as template variables.
    .use(layouts({
        pattern: '**/*.html',
        directory: 'templates'
    }))
    .use(sitemap({
        hostname: melindreamakes.metadata.siteurl,
        omitIndex: true
    }))
    .use(check)
    .use(github)
    //.use(webfinger(melindreamakes.metadata.webfinger))
    // And tell Metalsmith to fire it all off.
    .build((err) => {           // build process
        if (err) { throw err; }        // error handling is required
        console.log(`Build success in ${((performance.now() - t1) / 1000).toFixed(1)}s`)
      });