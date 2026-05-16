
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('test', 10);
console.log('Hash:', hash);
const check = bcrypt.compareSync('test', hash);
console.log('Result:', check);
