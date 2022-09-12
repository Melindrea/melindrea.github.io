#!/usr/bin/env node
var argv = require('yargs')
        .default('env', 'dev')
        .help('h')
        .alias('h', 'help')
        .epilog('Copyright 2015')
        .example('$0 origin git@something:etc', 'pre-push hook (stop on non-0 exit)')
        .usage('Usage: $0 <remote name> <url>')
        .demand(2)
        .argv,
    readline = require('readline'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    gitKeys = Object.keys(process.env).filter(function (key) {
        return (key.lastIndexOf('GIT_', 0) === 0);
    }),
    gitObject = {};

gitKeys.forEach(function (key) {
    gitObject[key] = process.env[key];
});
console.log('Args:', argv);
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log(gitObject);

rl.on('line', function (cmd) {
    console.log('STIDIN: ' + cmd);
}).on('close', function () {
    process.exit(0);
});