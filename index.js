const homework = process.argv[2];

switch (homework) {
  case 'hw1':
    const { hw1 } = require('./hw1');
    hw1();
    break;
  case 'hw2':
    const { hw2 } = require('./hw2');
    hw2();
    break;
  case 'hw3':
    break;
  default:
    break;
}
