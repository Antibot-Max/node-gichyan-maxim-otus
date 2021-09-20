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
    while (tree[t][curLevel - 1] === prefixes.space) {
      tree[t][curLevel - 1] = prefixes.vert;
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
    //Check object format
    if (key !== 'name' && key !== 'items' && !Array.isArray(obj))
      throw new Error('Wrong object format');
    if (key === 'items' && !Array.isArray(obj[key])) {
      throw new Error('Wrong object format');
    }
    //if find name then add new Leaf
    if (key === 'name') {
      treeStrings = addLeaf(treeStrings, obj[key]);
    } else {
      // make connection in pre treeStrings
      treeStrings = treeConnect(treeStrings, key, obj, level);
      // pass object to recursion
      treeStrings = leafFromObj(obj[key], {
        ...treeStrings,
        level: level + (key === 'items' ? 1 : 0),
      });
    }
  }
  return treeStrings;
};

exports.printTree = (object) => {
  return leafFromObj(object)
    .tree.map((i) => i.join('') + '\n')
    .join('');
};
