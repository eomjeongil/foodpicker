/* ============================================================
   🍎 fruit-card.js — 음식 궁합 과일 카드 UI + AI API 연동
   픽푸드 v6 | 쿠팡 파트너스 연계
   ============================================================ */

/* ── 쿠팡 파트너스 과일 URL 생성 ────────────────── */
function _fruitUrl(q) {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(q)}&channel=user&partner=${_cfg.p}&subId=${_cfg.s}_fruit`;
}

/* ── 과일 카드 클릭 카운팅 (서버 + localStorage) ─── */
function _trackFruitClick(fruitName) {
  const cc = parseInt(localStorage.getItem("fp6_click_coupang") || "0") + 1;
  localStorage.setItem("fp6_click_coupang", String(cc));
  try {
    const payload = JSON.stringify({ type: 'coupang', menu: fruitName || '' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/log-click', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/log-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  } catch(e) {}
}

/* ── 로딩 표시 ─────────────────────────────────── */
function _showFruitLoading() {
  const wrap = document.getElementById("fruitCardWrap");
  if (!wrap) return;
  wrap.innerHTML = `
    <div style="text-align:center;padding:24px;color:var(--text2);">
      <div style="font-size:28px;margin-bottom:8px;">🍎</div>
      <div style="font-size:13px;">AI가 궁합 과일을 분석 중이에요...</div>
      <div style="margin-top:12px;height:3px;background:var(--card2);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:60%;background:linear-gradient(90deg,#89E900,#4ECDC4);border-radius:99px;animation:loadBar 1.2s ease-in-out infinite alternate;"></div>
      </div>
    </div>`;
}

/* ── 과일 카드 HTML 생성 (XSS 차단: createElement + textContent) ── */
function _renderFruitCard(menuName, data) {
  const wrap = document.getElementById("fruitCardWrap");
  if (!wrap) return;

  // 정적 골격만 innerHTML (사용자/AI 데이터 없음)
  wrap.innerHTML = `
    <div style="background:var(--card);border-radius:16px;padding:16px;
                border:1px solid rgba(137,233,0,.2);
                box-shadow:0 4px 20px rgba(137,233,0,.08);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:20px;">🍎</span>
        <div>
          <div data-slot="title" style="font-size:13px;font-weight:800;color:#A8E063;letter-spacing:-.3px;"></div>
          <div style="font-size:11px;color:var(--text2);margin-top:1px;">영양 시너지 · 소화 촉진 · 건강 보완</div>
        </div>
      </div>
      <div style="padding:8px 12px;background:rgba(255,209,102,.06);
                  border:1px solid rgba(255,209,102,.15);border-radius:10px;
                  font-size:11px;color:#A8E063;margin-bottom:12px;line-height:1.6;">
        ⚡ <strong>이 음식의 주의점:</strong> <span data-slot="risk"></span>
      </div>
      <div data-slot="fruits" style="display:flex;flex-direction:column;gap:8px;"></div>
      <div data-slot="avoid-wrap" style="display:none;margin-top:12px;padding:10px 14px;
                  background:rgba(232,0,61,.08);border:1px solid rgba(232,0,61,.2);
                  border-radius:10px;font-size:12px;color:#A8E063;">
        ⚠️ <strong>피해야 할 과일:</strong> <span data-slot="avoid"></span>
      </div>
      <div style="margin-top:12px;text-align:center;font-size:10px;color:var(--text2);
                  padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
        🛒 쿠팡 파트너스 링크 · 클릭 시 수수료 발생 가능
      </div>
    </div>`;

  // 사용자/AI 데이터는 textContent로 안전 주입
  wrap.querySelector('[data-slot="title"]').textContent = (menuName || '') + '과 궁합 과일';
  wrap.querySelector('[data-slot="risk"]').textContent = data.risk || '';

  // 과일 카드 리스트
  const fruitsContainer = wrap.querySelector('[data-slot="fruits"]');
  data.fruits.forEach(f => {
    const a = document.createElement('a');
    a.href = _fruitUrl(f.q || (typeof FRUIT_SEARCH !== 'undefined' && FRUIT_SEARCH[f.name]) || (f.name + ' 신선'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--card2);border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,.08);transition:all .18s;cursor:pointer;';
    a.addEventListener('click', function() { _trackFruitClick(f.name); });

    const emojiSpan = document.createElement('span');
    emojiSpan.style.cssText = 'font-size:28px;flex-shrink:0;';
    emojiSpan.textContent = f.emoji || '';

    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'flex:1;min-width:0;';
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'font-size:15px;font-weight:800;color:#A8E063;margin-bottom:4px;';
    nameDiv.textContent = f.name || '';
    const reasonDiv = document.createElement('div');
    reasonDiv.style.cssText = 'font-size:12px;font-weight:700;color:#A8E063;line-height:1.6;letter-spacing:-.2px;';
    reasonDiv.textContent = f.reason || '';
    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(reasonDiv);

    const cta = document.createElement('div');
    cta.style.cssText = 'flex-shrink:0;font-size:11.5px;font-weight:800;color:#F2B441;background:rgba(242,180,65,.12);padding:5px 11px;border-radius:50px;white-space:nowrap;';
    cta.textContent = '🛒 보러가기';

    a.appendChild(emojiSpan);
    a.appendChild(infoDiv);
    a.appendChild(cta);
    fruitsContainer.appendChild(a);
  });

  // 피해야 할 과일
  if (data.avoid && data.avoid !== '없음') {
    wrap.querySelector('[data-slot="avoid-wrap"]').style.display = 'block';
    wrap.querySelector('[data-slot="avoid"]').textContent = data.avoid;
  }
}

/* ── AI API 호출 (DB 미등록 메뉴) ───────────────── */
async function _getFruitByAI(menuName) {
  try {
    const res = await fetch("https://pickfood.kr/api/fruit-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuName })
    });
    const { data } = await res.json();
    return data;
  } catch(e) {
    return null;
  }
}

/* ── 메인 함수: 궁합 과일 찾기 ─────────────────── */
async function openFruitMatch() {
  if (!curMenu) {
    toast("먼저 메뉴를 추천받아 주세요!");
    return;
  }
  snd("click");

  // 카드 열기
  const section = document.getElementById("fruitSection");
  if (section) {
    section.style.display = "block";
    setTimeout(() => section.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
  }

  // 1순위: 개별 메뉴 DB
  const dbData = FRUIT_DB[curMenu.n];
  if (dbData) {
    _renderFruitCard(curMenu.n, dbData);
    return;
  }

  // 2순위: 카테고리 공통 DB
  const catDB = (typeof FRUIT_DB_CAT !== "undefined") ? FRUIT_DB_CAT : null;
  const catData = catDB ? catDB[curMenu.cat] : null;
  if (catData) {
    _renderFruitCard(curMenu.n, catData);
    return;
  }

  // 3순위: 카테고리 기본값 (최후 보루)
  const fallback = {
    risk: "음식별 영양 불균형 가능",
    fruits: [
      { name:"사과",     emoji:"🍎", reason:"펙틴·식이섬유로 소화 촉진·혈당 안정화", q:"사과 신선" },
      { name:"바나나",   emoji:"🍌", reason:"칼륨·마그네슘으로 영양 균형 보완", q:"바나나 신선" },
      { name:"키위",     emoji:"🥝", reason:"비타민C·효소로 면역력·소화 도움", q:"키위 제스프리" }
    ],
    avoid: "없음"
  };
  _renderFruitCard(curMenu.n, fallback);
}

/* ── 로딩바 애니메이션 CSS 삽입 ─────────────────── */
(function() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes loadBar {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    #fruitSection {
      display: none;
      margin-top: 12px;
      animation: popIn .4s cubic-bezier(.34,1.56,.64,1);
    }
  `;
  document.head.appendChild(style);
})();

/* ── DB 로드 확인 ───────────────────────────────── */
window.addEventListener('load', function() {
  if (typeof FRUIT_DB === 'undefined') {
    console.warn('⚠️ fruit-db.js 로드 실패');
  }
  if (typeof FRUIT_DB_CAT === 'undefined') {
    console.warn('⚠️ FRUIT_DB_CAT 로드 실패 - fruit-db.js 순서 확인 필요');
  }
});
