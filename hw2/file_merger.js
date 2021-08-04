const fs = require('fs');
const { Readable, pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

const zeroBuffer = {
  stream: null,
  array: [],
  rem: Buffer.from(''),
  status: false,
  currentSize: 0,
  siz: 0,
};

//В списке массивов ищет массив с минимальным первым элементом - пустые массивы игнорируются - возвращает объект с индексом массива и минимальным значением
const findMinElem = (arrays) => {
  return arrays.reduce(
    (acc, i, ind) => {
      if (ind === 0) return { ind: 0, i: i[0] };
      if (i.length === 0) return { ind: acc.ind, i: acc.i };
      if (acc.i < i[0]) return { ind: acc.ind, i: acc.i };
      return { ind: ind, i: i[0] };
    },
    { ind: -1, i: [] }
  );
};

//Переводит минимальные элементы из списка массивов в буфер - до тех пор пока один из массивов не обнулится
//возвращает итогвый список массивов + индекс обнуленного массива + итоговый буфер
const mergeStep = (arrays, buffer) => {
  let result = {
    ind: -1,
    buffer: buffer,
    arrays: arrays.map((i) => i.map((ii) => ii)),
  };
  let flag = true;
  while (flag) {
    const minElem = findMinElem(result.arrays);
    result.arrays[minElem.ind].shift();
    result.buffer.push(minElem.i);
    result.ind = minElem.ind;

    flag = result.arrays[minElem.ind].length > 0;
  }
  return result;
};

//возвращает новый объект буфера равный старому
const selfReturn = (buffer) => {
  return {
    stream: buffer.stream,
    array: [...buffer.array],
    rem: Buffer.from(buffer.rem),
    status: buffer.status,
    currentSize: buffer.currentSize,
    size: buffer.size,
  };
};

//берет буфер и новую порцию данных, разделитель чисел и возвращает массив чисел и остаток(не полное число) в виде буфера
// !!!!!!!!!!!!!!!! периодически возникала проблема - файл прочитан полностью, но последний chunk не null и новое readable событие не генерится
// !!!!!!!!!!!!!!!! - так и не понял  - это баг потоков или нет - пришлось ввести проверку на размер прочитанного файла.
// !!!!!!!!!!!!!!!! проблема связанна с обработкой readable события через once
const chunkToIntArray = (buffer, chunk, separator) => {
  const temp = (chunk ? buffer.rem + chunk : buffer.rem)
    .toString()
    .split(separator);
  const currentSize = buffer.currentSize + (chunk ? chunk.length : 0);
  if (buffer.size === currentSize) buffer.stream.close();
  return {
    stream: buffer.stream,
    array: temp.slice(0, temp.length - 1).map((i) => Number.parseInt(i)),
    rem: chunk ? Buffer.from(temp[temp.length - 1]) : Buffer.from(''),
    status: chunk ? true : false,
    currentSize: currentSize,
    size: buffer.size,
  };
};

// async итератор для чтения данных из списка файлов
//файлы должны быть отсортированы - чтение в порядке возрастания
//на каждой итерации читается файл для которого буфер обнулился

async function* multipaleFileReader(files, separator) {
  const sizes = await Promise.all(files.map((i) => fs.promises.stat(i)));

  let buffers = files.map((i, ind) => {
    return {
      stream: fs.createReadStream(i),
      array: [],
      rem: Buffer.from(''),
      status: true,
      currentSize: 0,
      size: sizes[ind].size,
    };
  });

  let flag = true;

  while (flag) {
    flag = false;
    const tempBuffers = await Promise.all(
      buffers.map((i, ind) => {
        return new Promise((resolve, reject) => {
          //Если поток неактивный то ресолвим значение по умолчанию
          if (i.status === false) {
            resolve(zeroBuffer);
          } else if (i.array.length > 0) {
            flag = true;
            //Если соответствующий массив не пустой - то ресолвим самого себя
            resolve(selfReturn(i));
          } else if (i.size === i.currentSize) {
            //Если файл был полностью прочитан, то возвращаем пустой буфер
            resolve(zeroBuffer);
          } else {
            flag = true;
            //Если массив пустой то читаем соответствующий файл
            i.stream.once('readable', () => {
              const chunk = i.stream.read();
              resolve(chunkToIntArray(i, chunk, separator));
            });
          }
        });
      })
    );
    const arrays = tempBuffers.map((i) => i.array);
    const outObject = mergeStep(arrays, []);
    buffers = outObject.arrays.map((i, ind) => {
      return {
        ...tempBuffers[ind],
        array: [...i],
      };
    });
    if (flag) yield outObject.buffer.join(separator) + separator;
  }
}

module.exports = async (files, separator, result) => {
  const rs = Readable.from(multipaleFileReader(files, separator));
  const ws = fs.createWriteStream(result);
  await pipelineAsync(rs, ws);
};
