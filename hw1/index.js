const pt = require('./print_tree');
const fs = require('fs');

const object = JSON.parse(fs.readFileSync('./hw1/fixtures.json').toString());
exports.hw1 = () => process.stdout.write(pt.printTree(object));
