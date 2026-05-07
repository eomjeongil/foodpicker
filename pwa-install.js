/* PWA 홈화면 추가 안내 — 공통 모듈
   사용법: 페이지에서 window.PWA_OPTIONS={name,color} 설정 후 이 스크립트 로드.
   - localStorage 'pwa_install_dismissed' = '1' 이면 영구 숨김
   - PC / 이미 설치(standalone) 시 표시 안 함
   - Android: beforeinstallprompt 이벤트 시 표시 → 클릭 시 prompt() 트리거
   - iOS Safari: 이벤트 없이 단계 안내 (공유 → 홈 화면에 추가) */
(function () {
  var LS_KEY = 'pwa_install_dismissed';
  try { if (localStorage.getItem(LS_KEY) === '1') return; } catch (_) {}

  // 이미 설치된 PWA(standalone) — 안내 불필요
  var isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /Android/.test(ua);
  var isSafari = /Safari/.test(ua) && !/CriOS|Chrome|Edg|FxiOS/.test(ua);
  if (!isIOS && !isAndroid) return; // PC 안내 X

  var opt = window.PWA_OPTIONS || {};
  var appName = opt.name || (document.title ? document.title.split(/[—\-|·]/)[0].trim() : '이 앱');
  var btnColor = opt.color || '#FF6B35';
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBanner('android');
  });

  if (isIOS && isSafari) {
    setTimeout(function () { showBanner('ios'); }, 3000);
  }

  function showBanner(type) {
    if (document.getElementById('pwa-install-banner')) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () { showBanner(type); });
      return;
    }

    // 키프레임은 한 번만 주입
    if (!document.getElementById('pwa-install-style')) {
      var s = document.createElement('style');
      s.id = 'pwa-install-style';
      s.textContent = '@keyframes pwaSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}#pwa-install-banner *{box-sizing:border-box}';
      document.head.appendChild(s);
    }

    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#fff', 'border-top:1px solid #eee',
      'padding:12px 16px', 'z-index:9999',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.12)',
      'font-family:sans-serif',
      'animation:pwaSlideUp 0.3s ease'
    ].join(';');

    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    }); }

    if (type === 'android') {
      banner.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="flex:1;">' +
            '<div style="font-size:13px;font-weight:700;color:#1F1C18;margin-bottom:2px;">홈화면에 추가하기</div>' +
            '<div style="font-size:11px;color:#888;line-height:1.4;">' + esc(appName) + '을(를) 앱처럼 빠르게 열 수 있어요</div>' +
          '</div>' +
          '<button id="pwa-install-btn" style="padding:8px 14px;background:' + btnColor +
            ';color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:inherit;">추가하기</button>' +
          '<button id="pwa-dismiss-btn" style="background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;padding:0 4px;flex-shrink:0;line-height:1;font-family:inherit;">×</button>' +
        '</div>';
      document.body.appendChild(banner);
      document.getElementById('pwa-install-btn').addEventListener('click', function () {
        if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (r) {
            if (r && r.outcome === 'accepted') {
              try { localStorage.setItem(LS_KEY, '1'); } catch (_) {}
              banner.remove();
            }
            deferredPrompt = null;
          }).catch(function () {});
        }
      });
    } else {
      // iOS Safari
      banner.innerHTML =
        '<div style="display:flex;align-items:flex-start;gap:10px;">' +
          '<div style="flex:1;">' +
            '<div style="font-size:13px;font-weight:700;color:#1F1C18;margin-bottom:6px;">홈화면에 추가하면 앱처럼 사용할 수 있어요!</div>' +
            '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#555;flex-wrap:wrap;">' +
              '<span style="background:#f5f5f5;border-radius:6px;padding:4px 8px;white-space:nowrap;">① 하단 <strong>공유</strong></span>' +
              '<span style="color:#aaa;">→</span>' +
              '<span style="background:#f5f5f5;border-radius:6px;padding:4px 8px;white-space:nowrap;">② <strong>홈 화면에 추가</strong></span>' +
            '</div>' +
          '</div>' +
          '<button id="pwa-dismiss-btn" style="background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;padding:0 4px;flex-shrink:0;line-height:1;font-family:inherit;">×</button>' +
        '</div>';
      document.body.appendChild(banner);
    }

    var dismissBtn = document.getElementById('pwa-dismiss-btn');
    if (dismissBtn) dismissBtn.addEventListener('click', function () {
      try { localStorage.setItem(LS_KEY, '1'); } catch (_) {}
      banner.remove();
    });
  }
})();
