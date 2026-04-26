const fs = require('fs');
const h = fs.readFileSync('admin.html', 'utf8');
const m = h.match(/id="[^"]+"/g);
const all = [...new Set(m)];
console.log(all.join('\n'));
console.log('\n총:', all.length);