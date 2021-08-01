const fs = require('fs');
const { resolve } = require('path');

exports.file_divider = async (filePath, separator, N) => {
  let sum = 0;
  const wss = [];
  const files = [];
  const stat = await fs.promises.stat(filePath);
  const size = stat.size;
  const rs = fs.createReadStream(filePath);
  let counter = 0;

  return new Promise((res, rej) => {
    rs.on('readable', () => {
      const temp = rs.read();
      // Если не конец файла
      if (temp) {
        //Если новый файл не нужен то пишем в последний
        if (sum < (wss.length * size) / N) {
          wss[wss.length - 1].write(temp);
        } else {
          wss.push(fs.createWriteStream(filePath + wss.length));

          //подписываемся на событие завершения записи в файл
          wss[wss.length - 1].on('finish', () => {
            counter += 1;
            //ресолвим если все файлы записаны
            if (counter === N) res([...files]);
          });

          const tempString = temp.toString();
          const separatorIndex = tempString.indexOf(separator);
          // разбиваем первый чанк нового файла до первого разделителя и пишем префикс в предидущий файл
          const old_temp =
            wss.length > 1
              ? Buffer.from(tempString.substring(0, separatorIndex))
              : Buffer.from('');
          const new_temp =
            wss.length > 1
              ? Buffer.from(tempString.substring(separatorIndex + 1))
              : temp;
          wss[wss.length - 1].write(new_temp);

          //после записи префикса в предидущий файл  - его можно закрыть
          if (wss.length > 1) {
            wss[wss.length - 2].write(old_temp);
            files.push(resolve(filePath + (wss.length - 2)));
            wss[wss.length - 2].end();
          }
        }
        sum += temp.length;
      } else {
        //Если достигли конца файла, то закрываем последний файл на запись
        files.push(resolve(filePath + (wss.length - 1)));
        wss[wss.length - 1].end();
      }
    });
  });
};
