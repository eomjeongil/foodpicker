/* ============================================================
   🍎 fruit-card.js — 음식 궁합 과일 카드 UI + AI API 연동
   FoodPicker v6 | 쿠팡 파트너스 연계
   ============================================================ */

/* ── 쿠팡 파트너스 과일 URL 생성 ────────────────── */
function _fruitUrl(q) {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(q)}&channel=user&partner=${_cfg.p}&subId=${_cfg.s}_fruit`;
}

/* ── 과일 카드 클릭 카운팅 ─────────────────────── */
function _trackFruitClick() {
  const cc = parseInt(localStorage.getItem("fp6_click_coupang") || "0") + 1;
  localStorage.setItem("fp6_click_coupang", String(cc));
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

/* ── 과일 카드 HTML 생성 ────────────────────────── */
function _renderFruitCard(menuName, data) {
  const wrap = document.getElementById("fruitCardWrap");
  if (!wrap) return;

  const fruitsHTML = data.fruits.map((f, i) => `
    <a href="${_fruitUrl(f.q || FRUIT_SEARCH[f.name] || f.name + ' 신선')}"
       target="_blank"
       onclick="_trackFruitClick()"
       style="display:flex;align-items:center;gap:12px;padding:12px 14px;
              background:var(--card2);border-radius:12px;text-decoration:none;
              border:1px solid rgba(255,255,255,.08);transition:all .18s;
              cursor:pointer;"
       onmouseover="this.style.borderColor='rgba(137,233,0,.4)'"
       onmouseout="this.style.borderColor='rgba(255,255,255,.08)'">
      <span style="font-size:28px;flex-shrink:0;">${f.emoji}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:2px;">${f.name}</div>
        <div style="font-size:11px;color:var(--text2);line-height:1.5;">${f.reason}</div>
      </div>
      <div style="flex-shrink:0;font-size:11px;font-weight:700;
                  color:#89E900;background:rgba(137,233,0,.1);
                  padding:4px 10px;border-radius:50px;white-space:nowrap;">
        🛒 보러가기
      </div>
    </a>`).join("");

  const avoidHTML = data.avoid && data.avoid !== "없음" ? `
    <div style="margin-top:12px;padding:10px 14px;background:rgba(232,0,61,.08);
                border:1px solid rgba(232,0,61,.2);border-radius:10px;
                font-size:12px;color:rgba(255,100,100,.9);">
      ⚠️ <strong>피해야 할 과일:</strong> ${data.avoid}
    </div>` : "";

  wrap.innerHTML = `
    <div style="background:var(--card);border-radius:16px;padding:16px;
                border:1px solid rgba(137,233,0,.2);
                box-shadow:0 4px 20px rgba(137,233,0,.08);">

      <!-- 헤더 -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:20px;">🍎</span>
        <div>
          <div style="font-size:13px;font-weight:800;color:#89E900;letter-spacing:-.3px;">
            ${menuName}과 궁합 과일
          </div>
          <div style="font-size:11px;color:var(--text2);margin-top:1px;">
            영양 시너지 · 소화 촉진 · 건강 보완
          </div>
        </div>
      </div>

      <!-- 리스크 -->
      <div style="padding:8px 12px;background:rgba(255,209,102,.06);
                  border:1px solid rgba(255,209,102,.15);border-radius:10px;
                  font-size:11px;color:#9A7A10;margin-bottom:12px;line-height:1.6;">
        ⚡ <strong>이 음식의 주의점:</strong> ${data.risk}
      </div>

      <!-- 궁합 과일 목록 -->
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${fruitsHTML}
      </div>

      ${avoidHTML}

      <!-- 하단 -->
      <div style="margin-top:12px;text-align:center;font-size:10px;color:var(--text2);
                  padding-top:10px;border-top:1px solid rgba(255,255,255,.06);">
        🛒 쿠팡 파트너스 링크 · 클릭 시 수수료 발생 가능
      </div>
    </div>`;
}

/* ── AI API 호출 (DB 미등록 메뉴) ───────────────── */
async function _getFruitByAI(menuName) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `한국 음식 "${menuName}"과 궁합이 좋은 과일 3가지를 영양학적 근거와 함께 알려줘.
반드시 아래 JSON 형식으로만 답해줘. 다른 텍스트 없이 JSON만:
{"risk":"이 음식의 영양 리스크 (나트륨/지방/당분 등 간결하게)","fruits":[{"name":"과일명","emoji":"이모지","reason":"궁합 이유 (소화·영양 흡수·건강 효능 근거)","q":"쿠팡 검색 키워드 (예: 파인애플 신선)"},{"name":"과일명2","emoji":"이모지2","reason":"이유2","q":"키워드2"},{"name":"과일명3","emoji":"이모지3","reason":"이유3","q":"키워드3"}],"avoid":"피해야 할 과일과 이유 (없으면 없음)"}`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
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
  const catData = FRUIT_DB_CAT[curMenu.cat];
  if (catData) {
    _renderFruitCard(curMenu.n, catData);
    return;
  }

  // 3순위: AI API 호출
  _showFruitLoading();
  const aiData = await _getFruitByAI(curMenu.n);
  if (aiData) {
    _renderFruitCard(curMenu.n, aiData);
  } else {
    // API 실패 시 기본 메시지
    const wrap = document.getElementById("fruitCardWrap");
    if (wrap) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:20px;color:var(--text2);font-size:13px;">
          😅 궁합 과일 정보를 불러오지 못했어요.<br>잠시 후 다시 시도해주세요.
        </div>`;
    }
  }
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
