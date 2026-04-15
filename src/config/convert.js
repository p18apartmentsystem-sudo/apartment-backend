const fs = require('fs');

const data = JSON.parse(
  fs.readFileSync('./src/config/firebase-service-account.json', 'utf8')
);

console.log(JSON.stringify(data));