---
title: Social Media Post Integration
header: Automagically posting to social media
abstract: How to solve a problem like … Melindrea?
pubdate: 2022-09-14
publish: draft

social_media:
    hashtag:
        - programming

collection:
    - how-to
    - geek

image:
    description: A close-up of writing with a fountain pen
    source: https://unsplash.com/photos/y3Tl-cbU-CU
    creator: Digital Content Writers India
---

This particular post is part experiment to confirm that my theory is reasonable, and part a description on how to do the thing I'm trying to do, namely simplify the flow of sharing my new posts to social media (in particular mastodon, though once I've completed that part of the flow I should be able to expand it to anything that has a public API).

"Okay, that sounds cool and stuff", I imagine my audience saying, "but isn't this a solved problem? Isn't there a dozen or more plugins that do *just exactly this*?" Yes, but the complications lie in my site being on github pages without a proper backend. In a more usual CMS (like WordPress and probably Blogger and others of their kind) you write your post and when you click a specific button the post gets published, and generally there's some kind of "hook" that will notify the plugin(s) that you have a new post out (and the post goes public almost instantly, or at the time you've scheduled it to). Meanwhile, I'm writing this post in a textfile, and even once it's finished it won't be public until a) I've built the latest version and pushed it to github and b) github has realised that there is an update and ran it's things to get the new version of the site to replace the prior version. Not only does b) take a small amount of time (up to 10 minutes), the changes can be anything. It will do the same thing whether I've added a new post, changed CSS, made a new page, added another image to the gallery, etc.

With that said, I do have a few ideas on how to get it to work (and for you to get my process I will be updating this particular part of the post with crossed out/inserted text where my theory ran head-first into the practice of my site). The flow I'm considering is the following:

1. Add a `posts.json` file that when I run `npm run build` (which builds the site for prod environment) updates the file with ~~any posts that aren't already in the file~~ <ins>new posts and changes to old posts</ins>. Each post ~~likely~~ has things such as the slug as key and the valu including image link, image description, summary of the post, <ins>published and last modified, list of hashtags</ins> and ~~probably~~ a boolean along the lines of `pushed` to signify whether I've posted about this particular post. By only running it in the build/production pipeline it will only care about posts that are finished enough to be published, and if I change anything (including title, which builds the slug) before it's published it won't put the same post in there twice.

2. Use a git hook on my computer (`pre-push` seems a good candidate) that checks whether it's being pushed to main (since I might want to push a development branch at times), and if it is being pushed to main, run a script that reads `posts.json` and schedules posts about half an hour from the current time, using the information of any posts that are not yet pushed, and finishes with setting the `pushed` to true so it won't be pushed again. By scheduling it for half an hour from the time of the push I should minimise the risk of the post going live before the post does. I probably also want to commit most of the hook script to the repo, because I'm going to be very sad if it goes missing at some point.

## Listing current posts

The first conceit I base this on is that this should only include files that are actually ready to be published--before then they might change titles, slugs and all sorts of things, so `posts.json` needs to be stable in that sense. Since I already have development vs prod in my build pipeline, that particular bit was easy enough. In the end I tested it in dev mode while working on it, since not only did that give me a new file to work with, the dev pipeline is a lot less heavy than the prod one (in prod images are generated and such).

At first I was thinking only title, summary, pushed and a bit about the image, but I quickly decided that I wanted to have both published and last modified dates in there. I'd originally intended that it only adds new files, it doesn't update the existing ones but, again, I realised that having a bit of metadata about them, and that metadata being accurate and up-to-date would be important for this file to be the canonical truth about which posts are published. 

### Gameplan

1. Load the data from the `posts.json` file in the root directory of the project
2. For each post, check if it exists in the loaded data, and if it does use the value of `pushed` in the metadata you're creating from the file
3. Stringify the object just created and write it to the same file you loaded it from originally.

Here's where things got a bit confusing/hilarious: If you use `require` with a relative file path, it works off of the path of the file. IE, the file that's doing all of this is `bin/blog.js`, so I needed to use `require('../posts.json')`. Unfortunately, `fs.writeFile` works off of the current working dirctory … which is one step above the file, so if I write to `../posts.json`, that file will be outside of the repository. I solved this through using `path.resolve('posts.json')` and using the full path to both load and write.

Next complication came when looking at the file and deciding that I wanted it to be sorted, with the newest post highest up in the file and the oldest at the bottom. As you may or may not know, there is no order to a javascript object. You can sort an array, but you explicitly cannot sort an object (for clarification: there is a "naive" order in javascript objects, but not one that should be trusted in critical code: the solution I came up with is good enough for my usecas, but not for, say, code that ensures the right customer is billed). 

My solution was to rather than adding/replacing the object into the loaded data, I went `array` => `Map` => `Object` => `string of valid json`. This allowed me to 1) sort the array based on the publication date, 2) create a more-or-less ordered Map (using forEach on the array and Map.set(key, value)), 3) and write it to file as JSON. Maps cannot be used with `JSON.stringify`, but `Object.fromEntries(map)` can. 

That concludes step 1: creating the list of posts, to be consumed by whatever I need it to.

## Scheduling social media posts

For this, I will be using parts of [an old repository of mine](https://github.com/Melindrea/githooks) (here's to hoping that git hooks haven't changed …), though only the final bit of the code will be using the hook. If you take nothing else with you from this post, remember this: **Any bit of code that can only be triggered through a build or hook system is badly planned**. What I mean by that is that you should always have a way to trigger the thing manually, with a payload that is close enough to the real.

### Gameplan

1. Script (like in `bin` since that is where I store things) that can be triggered from the terminal. Probably based on [this pre-push hook](https://github.com/Melindrea/githooks/blob/master/hooks/pre-push), though I'll likely need to modernise every single thing in it.
2. Once it can be triggered properly, I need the baseline code:
    a. `npm run post-scheduler` to trigger it manually (in scripts)
    b. Read `posts.json` and pick out entries with `pushed: false`
    c. For each of these entries, decide when it should be scheduled (likely +30m for the first, and if there's more than one it's +1h for every other. So if it's ran at noon and have three posts it would be setting the times to 12.30, 13.30 and 14.30)
    d. Call function with objects and scheduled times, which will be doing the actual connecting to whatever social media stuffs
3. Actual connection function: either python or javascript, undecided. While the first, and most important, is for Mastodon, I'll try to write it in a way that it can be easily expanded or others.


