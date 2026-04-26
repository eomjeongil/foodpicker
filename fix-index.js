const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 메뉴 추천 후 서버 기록 함수 추가
const statCode = `
<script>
async function _logMenu(menu, category, gender, age) {
  try { await fetch('https://foodpicker.kr/api/log-menu', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({menu,category,gender,age})}); } catch(e) {}
}
async function _logClick(type, menu) {
  try { await fetch('https://foodpicker.kr/api/log-click', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,menu})}); } catch(e) {}
}
</script>`;

html = html.replace('</head>', statCode + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('완료!');