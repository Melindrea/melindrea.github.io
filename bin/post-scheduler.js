'use strict';

const posts = require('../posts.json');

exports.schedulePosts = function(env) {
    console.log(env)
    console.log(posts);
}