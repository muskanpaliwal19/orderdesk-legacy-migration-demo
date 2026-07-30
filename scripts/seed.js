const { openDatabase } = require('../db');

openDatabase().close();
console.log('Seeded OrderDesk legacy data store.');
