---
layout: page.hbs
title: Colophon
header: Colophon—About this site
description: an inscription placed at the end of a book or manuscript and giving details of its publication—e.g., the name of the printer and the date of printing.
image:
    slug: colophon.jpg
    source: https://unsplash.com/photos/2vdkNvgbgno
    creator: Carmen Peñaranda
widgets:
    images: 
        position: bottom
        titletag: h2
---

## Introduction

Especially as an artist, I want to give credit to the giants on whose shoulders I stand, whether it's using a particular technology or stock photos by a photographer for my art and featured images. While one of my talents lay in writing things more verbosely than I, perhaps, should, I will try to keep my colophon brief.

## Technology stack

* [NodeJS](#nodejs)
    * Building the site
* [Python](#python)
    * Dev server
    * Image handling
* [HTML, CSS, Javascript](#browser)
    * Output
* Affinity Photo <span class="ampersand">&</span> Analog Efex Pro 2
    * Featured images on pages and posts
* Github
    * Display the static site
    * Host the code and content

### NodeJS
Most of the backend work is done with Nodejs, including building the site
* [Metalsmith](https://metalsmith.io/): Static site generator with [plugins](https://metalsmith.io/plugins/)
    * layouts
    * collections
    * markdown
    * permalinks
    * table-of-contents
    * concat
    * include-files
    * publish
    * sitemap
    * postcss
* [Markdown](https://daringfireball.net/projects/markdown/): Text-to-HTML conversion tool, via MarkedJS and the original syntax
* [PostCSS](https://postcss.org/) with [TailwindCSS](https://tailwindcss.com/): Valid (and prefixed, when necessary) CSS
* [Cypress](https://www.cypress.io/): Testing (at the moment minimal)

### Python

Two parts of the site use Python:

* Server: `python -m http.server 8000`
* Image handling using a simple script and ImageMagick to resize and copy images to their destination folder

### Browser

This site should work in most browers, with or without javascript, and on most devices. A modern browser is highly recommended (in general, not just for this site). It has both a dark and a light mode.

#### Scripts

* [jQuery](https://jquery.com/)
* [lightGallery](https://www.lightgalleryjs.com/) (only used on [the gallery](/gallery/))

#### Design

The stylesheets have been optimised to be valid in all browers fulfilling these requirements:

* Used by > 1%
* Within the last 2 versions

Two typefaces have been used throughout the site, both from [Bunny Fonts](https://fonts.bunny.net) using the Open Font License.

* The serif [Cormorant](https://github.com/CatharsisFonts/Cormorant) for headers and other details
* The sans-serif [Montserrat](https://github.com/JulietaUla/Montserrat) for body texts