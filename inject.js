const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const snippet = '<script>\nasync function _sendStat(endpoint, data) {\n  try { await fetch("https://foodpicker.kr/" + endpoint, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}); } catch(e) {}\n}\nwindow.addEventListener("load", () => _sendStat("api/visit", {device: /Mobi/.test(navigator.userAgent) ? "mobile" : "pc"}));\n</script>';
html = html.replace('</head>', snippet + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('완료!');
