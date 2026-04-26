const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// showAdminStats에 PC/모바일 추가
html = html.replace(
  'document.getElementById("kTotal")',
  `if(document.getElementById("kPC")) document.getElementById("kPC").textContent = (s.pcVisits||0).toLocaleString();
  if(document.getElementById("kMobile")) document.getElementById("kMobile").textContent = (s.mobileVisits||0).toLocaleString();
  document.getElementById("kTotal")`
);

// kToday 카드 다음에 PC/모바일 카드 삽입
const pcCard = `<div class="stat-card">
  <div style="font-size:22px">💻</div>
  <div id="kPC" class="stat-num">0</div>
  <div class="stat-label">PC 유입</div>
</div>
<div class="stat-card">
  <div style="font-size:22px">📱</div>
  <div id="kMobile" class="stat-num">0</div>
  <div class="stat-label">모바일 유입</div>
</div>`;

html = html.replace('id="kTodayDiff"', 'id="kTodayDiff"');
html = html.replace('id="kMonth"', pcCard + '\n<div class="stat-card" id="kMonthCard"><div');

fs.writeFileSync('admin.html', html);
console.log('완료!');