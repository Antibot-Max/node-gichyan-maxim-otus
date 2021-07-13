const fs = require('fs');

const prefixes = {
  angle: '└──',
  cross: '├──',
  space: '   ',
  vert: '│  ',
};

const leafPrefix = (obj, key) => {
  return parseInt(key) !== Object.keys(obj).length - 1
    ? prefixes.cross
    : prefixes.angle;
};

const treeConnect = (treeStrings, key, obj, curLevel) => {
  const { level, tree } = treeStrings;
  if (curLevel < level) {
    let t = tree.length - 1;
    while (
      tree[t][curLevel - 1] === prefixes.space ||
      tree[t][curLevel - 1] === prefixes.angle
    ) {
      tree[t][curLevel - 1] =
        tree[t][curLevel - 1] === prefixes.space
          ? prefixes.vert
          : prefixes.cross;
      t -= 1;
    }
  }
  return {
    tree: [...tree],
    prefix: leafPrefix(obj, key),
    level: level,
  };
};

const addLeaf = (treeStrings, value) => {
  return {
    ...treeStrings,
    tree: [
      ...treeStrings.tree,
      [
        ...Array(treeStrings.level > 0 ? treeStrings.level - 1 : 0).fill(
          prefixes.space
        ),
        treeStrings.prefix,
        value,
      ],
    ],
  };
};

const leafFromObj = (obj, treeStrings = { tree: [], level: 0, prefix: '' }) => {
  const level = treeStrings.level;
  for (let key in obj) {
    if (key === 'name') {
      treeStrings = addLeaf(treeStrings, obj[key]);
    } else {
      treeStrings = treeConnect(treeStrings, key, obj, level);
      treeStrings = leafFromObj(obj[key], {
        ...treeStrings,
        level: level + (key === 'items' ? 1 : 0),
      });
    }
  }
  return treeStrings;
};

exports.printTree = (fpass) => {
  const object = JSON.parse(fs.readFileSync(fpass).toString());
  leafFromObj(object).tree.forEach((i) => console.log(i.join('')));
};
