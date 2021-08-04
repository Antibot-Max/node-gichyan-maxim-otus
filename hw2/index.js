const dg = require('./file_generator');
const fd = require('./file_divider');
const fsr = require('./file_sorter');
const dm = require('./file_merger');

const SEPARATOR = ',';
const fs = require('fs');

exports.hw2 = async () => {
  const start = new Date();

  //генерация файла
  const file = await dg.file_generator(
    './hw2/result/fixtures',
    100,
    1000000,
    SEPARATOR
  );
  console.log(file.size);

  //разделение файла
  const filesList = await fd.file_divider(file.path, file.separator, 15);

  //сортировка разделенных файлов
  const sortedfilesList = fsr.file_sorter(filesList, file.separator);
  console.log(sortedfilesList);

  //сливание файла
  await dm(sortedfilesList, file.separator, './hw2/result/result');

  const end = new Date();

  console.log(
    'start -',
    start,
    '    end -',
    end,
    '    dur -',
    (end - start) / 1000
  );
};
