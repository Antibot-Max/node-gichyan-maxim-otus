const { printTree } = require('./print_tree');

test('should throw exception if object have keys which is not  "items" or "name"', () => {
  expect(() => printTree({ nname: 1 })).toThrowError(Error);
});

test('should throw exception if "items" key contains not array value', () => {
  expect(() => printTree({ name: 1, items: {} })).toThrowError(Error);
});

test('should return just root for simple object', () => {
  const result_string = '1\n';
  const object = { name: 1, items: [] };
  const result = printTree(object);
  expect(result).toBe(result_string);
});

test('should make right connection with two root branchs', () => {
  const result_string = '1\n' + '├──' + '11\n' + '└──' + '12\n';
  const object = { name: 1, items: [{ name: 11 }, { name: 12 }] };
  const result = printTree(object);
  expect(result).toBe(result_string);
});

test('should make right reconnection', () => {
  // prettier-ignore
  const result_string =
    '1\n' +
    '├──' + '11\n' +
    '│  ' + '├──' + '111\n' +
    '│  ' + '└──' + '112\n' +
    '└──' + '12\n';

  const object = {
    name: 1,
    items: [{ name: 11, items: [{ name: 111 }, { name: 112 }] }, { name: 12 }],
  };
  const result = printTree(object);
  expect(result).toBe(result_string);
});
