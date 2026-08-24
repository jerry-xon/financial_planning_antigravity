const fs = require('fs');

let code = fs.readFileSync('./apps/web/src/components/DetailedReport/putYourMoneyToWorkLogic.js', 'utf8');
code = code.replace(/import .* from .*/g, '');
code = code.replace(/export /g, '');
// Execute the code
eval(code);

const pymtwCategories = INSTRUMENT_CATEGORIES.filter(c => c.reportScope === 'pymtw');
console.log(pymtwCategories.flatMap(c => c.instruments));
