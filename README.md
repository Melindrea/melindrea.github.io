# melindrea.github.io
Personal website hosted on github pages

Using Metalsmith to generate the site, markdown to write the posts, handlebars for layouts and CSS + Javascript to style and make things prettified and functional in the browser.

**NB**: `"set NODE_ENV=prod"` works in Windows, might not work in *nix.

### TODO
- Rewrite the Handlebars plugins into one and make it ESM-compatible and to not crash if there's no helpers/partials!
- Then rewrite slugify & classify to go back to using "slug" rather than "slugify"
- Terser for mangling/minifying prod JS
- ES-lint (decide on my rules!) for linting JS
- cssnano for CSS compression
- html-validation/formatcheck

### Notes
Update metalsmith-discover-helpers & metalsmith-dicover-partials with the following at the top of the function:
```
// This ensures the path works with glob() even on Windows
let basedir = metalsmith.path(options.directory).replaceAll(path.sep, path.posix.sep) + '/';
```