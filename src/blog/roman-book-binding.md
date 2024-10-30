---
title: Roman Book Binding Stitch
header: Romanesque stitch
abstract: An offset variant of long stitch binding that creates a beautiful effect.
image:
    description: A close-up of a laptop with some code on the screen
    source: https://unsplash.com/photos/XJXWbfSo2f0
    creator: Luca Bravo

social_media:
    hashtag:
        - bookbinding

collection:
    - crafts
    - how-to
publish: draft
---

My first time of learning book binding was five or six (might be more) years ago. I found some great videos on youtube (I highly recommend [Sea Lemon](https://www.youtube.com/@SeaLemonDIY) since that's where I learned most of the basics), and googled to find other interesting stitches.

At some point, that led me to a blog in a language I don't speak (I want to say Italian?). With a combination of 20-teens google translate and some really good images on the site I figured out the basics for this stitch which they called either Roman or Romanesque. Unfortunately, I then moved away from book binding and didn't return until a year or two ago, and at that point I could not find the site I was looking for at all. Googling in preparation for this post I did find an ad for a class where the cover art had something that might be what I'm talking about, but I still can't find that site. 

## Description of the stitch

The reason I call it an "offset long stitch binding" is because like long stitch binding, it can be stitched straight onto a spine. However, where long stitch binding finishes with one signature and then moving on to the next, this one starts by coming out of the top hole of signature A and then into the bottom hole of signature B, using a predefined pattern. 

There are a few important requirements for this to work, however.

1. Odd number of signatures. While you can do it with only three, I recommend no less than five
2. While I'm sure you can combine it with other stitches if you try, the offset stitching makes that more difficult
3. Each signature needs one exit and one entry hole, with the thread wrapping around on the inside (making very short signatures mixed with longer ones not as easy to bind)
4. It will require keeping several half-stitched signatures in place while you work

You don't need to keep this as visible stitch, but with the above limitations there are better stitches if you're planning on covering the spine. Now let's get into the nitty-gritty!

## How does it work?

I'm going to explain this in a few different ways, since while it's easy in practice, it can take a bit to wrap your mind around how you make it work, especially generalising it to any odd number. For this example (with images) we'll use a book with seven signatures.

Start by laying the cover (or spine piece) flat and pierce 7 columns of 2 holes in each. The top hole will be called A and the bottom hole B. The columns will be numbered from 1 to 7, left to right (so in books that are to be read from left to right, the first column is the last signature, and the last column is the front signature).

1. From the inside of the signature matching Column 1, pull the threaded needle through A, leaving a tail on the inside. From A1 it goes into B5, so the bottom hole of the fifth-from-the-left signature. 
2. On the inside of the fifth signature it goes out of A5 and into B2. The fifth signature is secured.
3. On the inside of the second signature it goes out of A2 and into B6. The second signature is now secured.
4. On the inside of the sixth signature it goes out of A6 and into B3. The sixth signature is now secured.
5. On the inside of the third signature it goes out of A3 and into B7 (the right-most signature). The third signature is now secured.
6. On the inside of the seventh signature it goes out of A7 and into B4. The sevent signature is now secured.
7. On the inside of the fourth signature it goes out of A4 and into B1. The fourth signature is now secured.
8. Tie a knot on the inside of the first signature, which is now secured, and the binding is finished.

The pattern here is mathematical, but is dependant on the number of signatures. So you can't take the exakt pattern for seven signatures and apply it to five or nine or eleven. I will show the formula [below](#link to lower header), but want to finish the example completelly first.

For seven signature, it will be either "add 4" or "subtract 3", which both come from the same pattern: if `&lt;signature number&gt; + 4` is larger than seven, then the insert point is at `&lt;signature number&gt; - 3` instead. Or, put in another way: it loops around. So if it's signature sixe, we count the following way: 7, 1, 2, 3. Or for signature five: 6, 7, 1, 2. 

This number that we add/subtract is going to be referred to as the "offset".


