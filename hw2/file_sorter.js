const fs = require('fs');
const { resolve } = require('path');

exports.file_sorter = (filesList, separator) => {
  return filesList.map((i) => {
    const data = fs
      .readFileSync(i)
      .toString()
      .split(separator)
      .map((j) => Number.parseInt(j))
      .sort((a, b) => a - b)
      .filter((j) => !isNaN(j))
      .join(separator);
    fs.writeFileSync(i + '_sorted', data + separator);
    return resolve(i + '_sorted');
  });
};
