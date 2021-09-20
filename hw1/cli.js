#!/bin/sh
':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
const fs = require('fs');
const pt = require('./print_tree.js');
const args = process.argv.slice(2);

const object = JSON.parse(fs.readFileSync(args[0]).toString());
process.stdout.write(pt.printTree(object));
