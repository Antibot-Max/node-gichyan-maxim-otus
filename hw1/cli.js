#!/bin/sh
':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const pt = require('./print_tree.js');
const args = process.argv.slice(2);

pt.printTree(args[0]);
