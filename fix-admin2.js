const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// showAdminStats 함수에 PC/모바일 표시 추가
html = html.replace(
  'document.getElementById("statTotal").textContent = s.total.toLocaleString();',
  `document.getElementById("statTotal").textContent = s.total.toLocaleString();
  if(document.getElementById("statPC")) document.getElementById("statPC").textContent = (s.pcVisits||0).toLocaleString();
  if(document.getElementById("statMobile")) document.getElementById("statMobile").textContent = (s.mobileVisits||0).toLocaleString();`
);

// 통계 카드 영역에 PC/모바일 카드 추가
const pcMobileCard = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">
  <div class="stat-card"><div style="font-size:24px">💻</div><div id="statPC" class="stat-num">0</div><div class="stat-label">PC 유입</div></div>
  <div class="stat-card"><div style="font-size:24px">📱</div><div id="statMobile" class="stat-num">0</div><div class="stat-label">모바일 유입</div></div>
</div>`;

html = html.replace('id="statToday"', 'id="statToday"');
html = html.replace('<div id="adminStats"', pcMobileCard + '<div id="adminStats"');

fs.writeFileSync('admin.html', html);
console.log('완료!');