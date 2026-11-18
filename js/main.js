// 蔴竹坑福德祠 3D 導覽主控制腳本
document.addEventListener('DOMContentLoaded', () => {
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBar = document.getElementById('loader-bar');
  const canvasContainer = document.getElementById('canvas-container');
  const hotspotsLayer = document.getElementById('hotspots-layer');

  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoIcon = document.getElementById('info-icon');
  const infoBadges = document.getElementById('info-badges');
  const infoContent = document.getElementById('info-content');
  const spotCounter = document.getElementById('spot-counter');

  const btnAutoTour = document.getElementById('btn-auto-tour');
  const btnPray = document.getElementById('btn-pray');
  const btnToggleHotspots = document.getElementById('btn-toggle-hotspots');
  const btnDayNight = document.getElementById('btn-day-night');
  const btnInfoModal = document.getElementById('btn-info-modal');
  const btnCloseInfo = document.getElementById('btn-close-info');
  const btnPrevSpot = document.getElementById('btn-prev-spot');
  const btnNextSpot = document.getElementById('btn-next-spot');
  const dockBtns = document.querySelectorAll('.dock-btn');

  const prayModal = document.getElementById('pray-modal');
  const btnClosePray = document.getElementById('btn-close-pray');
  const btnSubmitPray = document.getElementById('btn-submit-pray');
  const btnExportPrayCard = document.getElementById('btn-export-pray-card');
  const wishNameInput = document.getElementById('wish-name');
  const wishTextInput = document.getElementById('wish-text');
  const wishChips = document.querySelectorAll('.wish-chip');

  const aboutModal = document.getElementById('about-modal');
  const btnCloseAbout = document.getElementById('btn-close-about');

  const controlsHint = document.getElementById('controls-hint');
  const btnCloseHint = document.getElementById('btn-close-hint');
  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  let currentSpotIndex = 0;
  let showHotspots = false;
  hotspotsLayer.style.display = 'none';
  let isNight = false;
  let autoTourTimer = null;
  let hotspotElements = [];

  // 模擬載入進度條
  loaderBar.style.width = '65%';

  // 初始化 3D 場景
  Temple3D.init(canvasContainer, () => {
    loadBlessingsFromStorage();
    Temple3D.setOnCardClick((slotIdx) => {
      openCardZoomModal(slotIdx);
    });
    loaderBar.style.width = '100%';
    setTimeout(() => {
      loaderOverlay.classList.add('fade-out');
      selectSpot(0, false);
    }, 350);
  });

  // 建立 3D 空間熱點按鈕
  Temple3D.SPOTS.forEach((spot) => {
    const btn = document.createElement('button');
    btn.className = 'hotspot-pin';
    btn.innerHTML = `<i class="fa-solid ${spot.icon}"></i><span>${spot.title}</span>`;
    btn.addEventListener('click', () => {
      stopAutoTour();
      selectSpot(spot.id, true);
    });
    hotspotsLayer.appendChild(btn);
    hotspotElements.push(btn);
  });

  // 每幀更新熱點螢幕座標
  window.onSceneFrame = function () {
    if (!showHotspots) return;
    const projected = Temple3D.getProjectedHotspots();
    projected.forEach((p, idx) => {
      const el = hotspotElements[idx];
      if (!p.visible || p.x < -50 || p.x > window.innerWidth + 50 || p.y < -50 || p.y > window.innerHeight + 50) {
        el.classList.add('hidden-spot');
      } else {
        el.classList.remove('hidden-spot');
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.classList.toggle('active', idx === currentSpotIndex);
      }
    });
  };

  // 選擇導覽視角與更新解說卡
  function selectSpot(index, openPanel = true) {
    const total = Temple3D.SPOTS.length;
    currentSpotIndex = (index + total) % total;
    const spot = Temple3D.SPOTS[currentSpotIndex];

    Temple3D.focusSpot(currentSpotIndex);

    dockBtns.forEach((b, i) => b.classList.toggle('active', i === currentSpotIndex));

    infoTitle.textContent = spot.title;
    infoIcon.className = `fa-solid ${spot.icon}`;
    infoBadges.innerHTML = spot.tags.map((t) => `<span class="info-tag">${t}</span>`).join('');
    infoContent.innerHTML = spot.html;
    spotCounter.textContent = `${currentSpotIndex + 1} / ${total}`;

    if (openPanel) {
      infoPanel.classList.remove('hidden');
    }
  }

  // 底部導覽列點擊
  dockBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stopAutoTour();
      const idx = parseInt(btn.dataset.spot, 10);
      selectSpot(idx, true);
    });
  });

  btnPrevSpot.addEventListener('click', () => {
    stopAutoTour();
    selectSpot(currentSpotIndex - 1, true);
  });

  btnNextSpot.addEventListener('click', () => {
    stopAutoTour();
    selectSpot(currentSpotIndex + 1, true);
  });

  btnCloseInfo.addEventListener('click', () => {
    infoPanel.classList.add('hidden');
  });

  // 自動導覽功能
  function startAutoTour() {
    btnAutoTour.classList.add('active');
    btnAutoTour.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    btnAutoTour.title = '暫停導覽';
    selectSpot(currentSpotIndex, true);
    autoTourTimer = setInterval(() => {
      selectSpot(currentSpotIndex + 1, true);
    }, 5500);
  }

  function stopAutoTour() {
    if (!autoTourTimer) return;
    clearInterval(autoTourTimer);
    autoTourTimer = null;
    btnAutoTour.classList.remove('active');
    btnAutoTour.innerHTML = `<i class="fa-solid fa-route"></i>`;
    btnAutoTour.title = '自動導覽';
  }

  btnAutoTour.addEventListener('click', () => {
    if (autoTourTimer) {
      stopAutoTour();
    } else {
      startAutoTour();
    }
  });

  // 熱點開關
  btnToggleHotspots.addEventListener('click', () => {
    showHotspots = !showHotspots;
    btnToggleHotspots.classList.toggle('active', showHotspots);
    hotspotsLayer.style.display = showHotspots ? 'block' : 'none';
  });

  // 日夜光影切換
  btnDayNight.addEventListener('click', () => {
    isNight = !isNight;
    Temple3D.setDayNight(isNight);
    if (isNight) {
      btnDayNight.classList.add('active');
      btnDayNight.innerHTML = `<i class="fa-solid fa-moon"></i>`;
      btnDayNight.title = '切換為日間光影';
    } else {
      btnDayNight.classList.remove('active');
      btnDayNight.innerHTML = `<i class="fa-solid fa-sun"></i>`;
      btnDayNight.title = '切換為夜間光影';
    }
  });

  // 操作提示條關閉
  if (btnCloseHint) {
    btnCloseHint.addEventListener('click', () => {
      controlsHint.classList.add('hidden');
    });
  }

  // 關於與歷史彈窗
  btnInfoModal.addEventListener('click', () => {
    aboutModal.classList.remove('hidden');
  });
  btnCloseAbout.addEventListener('click', () => {
    aboutModal.classList.add('hidden');
  });
  aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) aboutModal.classList.add('hidden');
  });

  // 線上祈福彈窗
  btnPray.addEventListener('click', () => {
    stopAutoTour();
    prayModal.classList.remove('hidden');
  });
  btnClosePray.addEventListener('click', () => {
    prayModal.classList.add('hidden');
  });
  prayModal.addEventListener('click', (e) => {
    if (e.target === prayModal) prayModal.classList.add('hidden');
  });

  wishChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      wishTextInput.value = chip.dataset.wish;
    });
  });

  btnSubmitPray.addEventListener('click', () => {
    const name = wishNameInput.value.trim();
    const wish = wishTextInput.value.trim() || '平安順心・學業進步';
    const fullText = name ? `${name}：${wish}` : wish;

    Temple3D.addBlessingCard(fullText);
    saveBlessingsToStorage();
    prayModal.classList.add('hidden');
    wishTextInput.value = '';
    showToast('已誠心奉香！您的水滴祈福卡已掛上 3D 祈福牆');
  });

  if (btnExportPrayCard) {
    btnExportPrayCard.addEventListener('click', () => {
      const name = wishNameInput.value.trim();
      const wish = wishTextInput.value.trim() || '平安順心・學業進步';
      exportSquareBlessingCardImage({
        name,
        wish,
        slotLabel: '誠心祈福御守'
      });
    });
  }

  function showToast(message) {
    toastText.textContent = message;
    toastMsg.classList.remove('hidden');
    setTimeout(() => {
      toastMsg.classList.add('hidden');
    }, 3500);
  }

  // ===== 祈福卡牆管理（編輯、刪除、拖曳換位、放大檢視、匯出/匯入） =====
  const STORAGE_KEY = 'mazhukeng_blessings_v1';
  const btnWallManage = document.getElementById('btn-wall-manage');
  const wallModal = document.getElementById('wall-modal');
  const btnCloseWall = document.getElementById('btn-close-wall');
  const wallGridEl = document.getElementById('wall-grid');
  const btnToggleSwap = document.getElementById('btn-toggle-swap');
  const swapModeLabel = document.getElementById('swap-mode-label');
  const btnExportWishes = document.getElementById('btn-export-wishes');
  const btnImportWishes = document.getElementById('btn-import-wishes');
  const importWishesFile = document.getElementById('import-wishes-file');

  const cardZoomModal = document.getElementById('card-zoom-modal');
  const btnCloseZoom = document.getElementById('btn-close-zoom');
  const zoomSlotLabel = document.getElementById('zoom-slot-label');
  const zoomWishPreview = document.getElementById('zoom-wish-preview');
  const zoomNameInput = document.getElementById('zoom-name-input');
  const zoomWishInput = document.getElementById('zoom-wish-input');
  const btnSaveCard = document.getElementById('btn-save-card');
  const btnDeleteCard = document.getElementById('btn-delete-card');
  const btnExportCardImage = document.getElementById('btn-export-card-image');

  let activeZoomSlotIndex = null;
  let swapMode = false;
  let swapSourceIndex = null;
  let dragSourceIndex = null;

  // 繪製並匯出 1080x1080 正方形單張祈福小卡 PNG 圖片
  function exportSquareBlessingCardImage({ name = '', wish = '', slotLabel = '誠心祈福御守' }) {
    const size = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cleanName = (name || '').trim();
    const cleanWish = (wish || '').trim() || '平安順心・萬事如意';
    const SERIF_FONT = '"Noto Serif TC", serif';

    // 像素級精準垂直與水平置中文字繪製工具
    function drawCenteredText(c, text, cx, cy) {
      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      const m = c.measureText(text);
      const ascent = m.actualBoundingBoxAscent !== undefined ? m.actualBoundingBoxAscent : 0;
      const descent = m.actualBoundingBoxDescent !== undefined ? m.actualBoundingBoxDescent : 0;
      if (ascent || descent) {
        c.fillText(text, cx, cy + (ascent - descent) / 2);
      } else {
        c.textBaseline = 'middle';
        c.fillText(text, cx, cy);
      }
      c.restore();
    }

    // 1. 背景漸層（典雅深邃祈福夜空與暖金光暈）
    const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
    bgGrad.addColorStop(0, '#0d1829');
    bgGrad.addColorStop(0.5, '#152642');
    bgGrad.addColorStop(1, '#1b3556');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 中心神聖暖金柔光
    const glowGrad = ctx.createRadialGradient(size / 2, 520, 40, size / 2, 520, 520);
    glowGrad.addColorStop(0, 'rgba(250, 204, 21, 0.24)');
    glowGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    glowGrad.addColorStop(1, 'rgba(13, 24, 41, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, size, size);

    // 底部雙溪山巒層疊剪影
    ctx.save();
    ctx.fillStyle = 'rgba(20, 45, 58, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, 880);
    ctx.quadraticCurveTo(270, 770, 560, 855);
    ctx.quadraticCurveTo(830, 750, 1080, 840);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(14, 30, 46, 0.78)';
    ctx.beginPath();
    ctx.moveTo(0, 930);
    ctx.quadraticCurveTo(340, 845, 680, 920);
    ctx.quadraticCurveTo(900, 865, 1080, 915);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 祈福星火光點（固定種子座標讓每次輸出穩定美觀）
    const sparkles = [
      [130, 180, 3.5], [950, 195, 4], [180, 340, 2.5], [910, 360, 3],
      [115, 540, 4.2], [965, 520, 3.8], [165, 720, 3], [920, 710, 4.5],
      [245, 250, 2.2], [835, 265, 2.8], [220, 820, 3.2], [860, 835, 3.2],
      [330, 165, 2], [750, 160, 2.5], [140, 890, 2.6], [940, 895, 2.6]
    ];
    sparkles.forEach(([sx, sy, sr]) => {
      const spGrad = ctx.createRadialGradient(sx, sy, 0.5, sx, sy, sr * 4);
      spGrad.addColorStop(0, 'rgba(255, 235, 160, 0.95)');
      spGrad.addColorStop(0.4, 'rgba(244, 196, 93, 0.45)');
      spGrad.addColorStop(1, 'rgba(244, 196, 93, 0)');
      ctx.fillStyle = spGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. 古典描金雙層邊框與四角裝飾
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 196, 93, 0.65)';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, size - 56, size - 56);

    ctx.strokeStyle = 'rgba(255, 225, 141, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, size - 84, size - 84);

    // 四角中式回紋角花
    const corners = [
      [28, 28, 1, 1],
      [size - 28, 28, -1, 1],
      [28, size - 28, 1, -1],
      [size - 28, size - 28, -1, -1]
    ];
    ctx.strokeStyle = '#f4c45d';
    ctx.lineWidth = 4;
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * 48);
      ctx.lineTo(cx + dx * 28, cy + dy * 48);
      ctx.lineTo(cx + dx * 28, cy + dy * 28);
      ctx.lineTo(cx + dx * 48, cy + dy * 28);
      ctx.lineTo(cx + dx * 48, cy);
      ctx.stroke();
    });
    ctx.restore();

    // 3. 頂部學校與古蹟資訊標題（全採用思源宋體襯線字體並精準置中）
    ctx.save();
    ctx.font = `bold 22px ${SERIF_FONT}`;
    const topBadgeText = '新北市立雙溪高中｜光緒十八年 (1892)';
    const topBadgeW = Math.max(500, Math.ceil(ctx.measureText(topBadgeText).width) + 64);
    const topBadgeX = (size - topBadgeW) / 2;
    const topBadgeY = 58;
    const topBadgeH = 44;

    ctx.fillStyle = 'rgba(200, 50, 40, 0.88)';
    ctx.strokeStyle = '#f4c45d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(topBadgeX, topBadgeY, topBadgeW, topBadgeH, topBadgeH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffe18d';
    drawCenteredText(ctx, topBadgeText, size / 2, topBadgeY + topBadgeH / 2);

    ctx.fillStyle = '#ffe8a3';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 10;
    ctx.font = `900 44px ${SERIF_FONT}`;
    drawCenteredText(ctx, '蔴竹坑福德祠・祈福小卡', size / 2, 142);
    ctx.restore();

    // 4. 繪製頂部祈福紅繩與雙中藍色水滴祈福卡本體
    ctx.save();
    // 祈福紅繩與雙結
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(size / 2, 168);
    ctx.lineTo(size / 2, 212);
    ctx.stroke();

    // 紅繩蝴蝶結耳
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(size / 2 - 20, 192, 16, 8, -0.3, 0, Math.PI * 2);
    ctx.ellipse(size / 2 + 20, 192, 16, 8, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // 金色扣環
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(size / 2, 200, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 水滴形卡片路徑定義
    function traceDropPath(c) {
      c.beginPath();
      c.moveTo(540, 196);
      c.bezierCurveTo(790, 425, 868, 645, 795, 790);
      c.bezierCurveTo(725, 928, 355, 928, 285, 790);
      c.bezierCurveTo(212, 645, 290, 425, 540, 196);
      c.closePath();
    }

    // 水滴外陰影與漸層填色
    ctx.save();
    ctx.shadowColor = 'rgba(2, 132, 199, 0.55)';
    ctx.shadowBlur = 38;
    ctx.shadowOffsetY = 16;
    traceDropPath(ctx);
    const dropGrad = ctx.createLinearGradient(0, 200, 0, 910);
    dropGrad.addColorStop(0, '#e0f2fe');
    dropGrad.addColorStop(0.48, '#7dd3fc');
    dropGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = dropGrad;
    ctx.fill();
    ctx.restore();

    // 水滴內部高光與白色立體外框
    ctx.save();
    traceDropPath(ctx);
    ctx.clip();

    // 水滴內部柔光雲紋點綴
    const innerGlow = ctx.createRadialGradient(540, 440, 20, 540, 440, 320);
    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(200, 190, 680, 740);
    ctx.restore();

    ctx.save();
    traceDropPath(ctx);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // 5. 水滴卡內：掛位標籤膠囊（精準置中）
    ctx.save();
    ctx.font = `bold 22px ${SERIF_FONT}`;
    const slotBadgeText = `❖ ${slotLabel} ❖`;
    const slotBadgeW = Math.max(250, Math.ceil(ctx.measureText(slotBadgeText).width) + 52);
    const slotBadgeH = 44;
    const slotBadgeX = (size - slotBadgeW) / 2;
    const slotBadgeY = 282;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = 'rgba(12, 74, 110, 0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(slotBadgeX, slotBadgeY, slotBadgeW, slotBadgeH, slotBadgeH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0c4a6e';
    drawCenteredText(ctx, slotBadgeText, size / 2, slotBadgeY + slotBadgeH / 2);
    ctx.restore();

    // 6. 水滴卡內：可愛雙中 Q 版土地公插圖（向量放大繪製）
    ctx.save();
    ctx.translate(540, 440);
    ctx.scale(2.25, 2.25);
    ctx.translate(-60, -52);

    // 官帽左右帽翅
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(14, 34, 22, 10, 5);
    ctx.roundRect(84, 34, 22, 10, 5);
    ctx.fill();

    // 官帽本體與金邊
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(34, 38);
    ctx.bezierCurveTo(34, 18, 86, 18, 86, 38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(31, 34, 58, 9, 4.5);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(60, 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // 圓潤臉龐
    ctx.fillStyle = '#fde6d0';
    ctx.beginPath();
    ctx.arc(60, 57, 21, 0, Math.PI * 2);
    ctx.fill();

    // 笑瞇瞇彎眼
    ctx.strokeStyle = '#3f2a1d';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(47, 54);
    ctx.quadraticCurveTo(51, 49, 55, 54);
    ctx.moveTo(65, 54);
    ctx.quadraticCurveTo(69, 49, 73, 54);
    ctx.stroke();

    // 腮紅
    ctx.fillStyle = 'rgba(253, 164, 175, 0.85)';
    ctx.beginPath();
    ctx.arc(44, 60, 3.6, 0, Math.PI * 2);
    ctx.arc(76, 60, 3.6, 0, Math.PI * 2);
    ctx.fill();

    // 雪白長鬍鬚與微笑小嘴
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(40, 65);
    ctx.quadraticCurveTo(60, 95, 80, 65);
    ctx.quadraticCurveTo(68, 62, 60, 64);
    ctx.quadraticCurveTo(52, 62, 40, 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 61);
    ctx.quadraticCurveTo(60, 66, 65, 61);
    ctx.stroke();
    ctx.restore();

    // 7. 水滴卡內：祈福人與祈福心願文字框
    ctx.save();
    const wishBoxX = 310;
    const wishBoxY = 548;
    const wishBoxW = 460;
    const wishBoxH = 236;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(12, 74, 110, 0.18)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(wishBoxX, wishBoxY, wishBoxW, wishBoxH, 28);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 祈福人標籤（置中於上半部標題帶）
    const displayAuthor = cleanName ? `祈福人：${cleanName}` : '誠心祈願';
    ctx.fillStyle = '#0369a1';
    ctx.font = `bold 24px ${SERIF_FONT}`;
    drawCenteredText(ctx, displayAuthor, size / 2, 582);

    // 細分隔線
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(360, 610);
    ctx.lineTo(720, 610);
    ctx.stroke();

    // 祈福心願多行自動換行排版（全採用思源宋體襯線字體並精準置中）
    const fontSize = cleanWish.length > 28 ? 27 : cleanWish.length > 16 ? 31 : 35;
    ctx.font = `bold ${fontSize}px ${SERIF_FONT}`;
    ctx.fillStyle = '#082f49';

    const maxLineWidth = 408;
    const lines = [];
    let currentLine = '';
    for (const ch of cleanWish) {
      const testLine = currentLine + ch;
      if (ctx.measureText(testLine).width > maxLineWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = ch;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const displayLines = lines.slice(0, 4);
    const lineHeight = fontSize * 1.38;
    const contentCenterY = (610 + (wishBoxY + wishBoxH)) / 2;
    const startY = contentCenterY - ((displayLines.length - 1) * lineHeight) / 2;

    displayLines.forEach((lineText, idx) => {
      drawCenteredText(ctx, lineText, size / 2, startY + idx * lineHeight);
    });
    ctx.restore();

    // 8. 水滴卡底部品牌字樣
    ctx.save();
    ctx.fillStyle = '#f0f9ff';
    ctx.font = `bold 24px ${SERIF_FONT}`;
    ctx.shadowColor = 'rgba(8, 47, 73, 0.55)';
    ctx.shadowBlur = 6;
    drawCenteredText(ctx, 'SXHS 蔴竹坑福德祠', size / 2, 838);
    ctx.restore();

    // 9. 底部對聯、朱印與日期戳記（整體水平與垂直精準置中）
    ctx.save();
    const coupletText = '「福添沾厚澤・神佑慶長春」';
    ctx.font = `bold 27px ${SERIF_FONT}`;
    const coupletW = ctx.measureText(coupletText).width;
    const sealSize = 56;
    const gapBetween = 16;
    const groupTotalW = coupletW + gapBetween + sealSize;
    const groupStartX = (size - groupTotalW) / 2;
    const rowCenterY = 954;

    // 繪製對聯（與方印同高置中）
    ctx.fillStyle = '#fde68a';
    drawCenteredText(ctx, coupletText, groupStartX + coupletW / 2, rowCenterY);

    // 繪製朱紅「福德正神」方印（四字象限精準對稱置中）
    const sealX = groupStartX + coupletW + gapBetween;
    const sealY = rowCenterY - sealSize / 2;
    const sealCenterX = sealX + sealSize / 2;
    const sealCenterY = rowCenterY;

    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sealX, sealY, sealSize, sealSize, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff5f5';
    ctx.font = `bold 19px ${SERIF_FONT}`;
    const quadOffset = 12.5;
    drawCenteredText(ctx, '福', sealCenterX - quadOffset, sealCenterY - quadOffset);
    drawCenteredText(ctx, '德', sealCenterX + quadOffset, sealCenterY - quadOffset);
    drawCenteredText(ctx, '正', sealCenterX - quadOffset, sealCenterY + quadOffset);
    drawCenteredText(ctx, '神', sealCenterX + quadOffset, sealCenterY + quadOffset);

    // 日期與頁尾標記（採用同款襯線字體並置中）
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `600 20px ${SERIF_FONT}`;
    drawCenteredText(ctx, `${todayStr} 誠心祈福｜新北市立雙溪高中百年古蹟導覽`, size / 2, 1012);
    ctx.restore();

    // 觸發下載正方形 PNG
    const safeTag = (cleanName || cleanWish).replace(/[\\/:*?"<>|\s]/g, '').slice(0, 10) || '祈福卡';
    const dateTag = new Date().toISOString().slice(0, 10);
    const filename = `蔴竹坑福德祠_祈福小卡_${safeTag}_${dateTag}.png`;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('已匯出正方形祈福小卡圖片 (1080×1080 PNG)！');
    }, 'image/png');
  }

  function saveBlessingsToStorage() {
    try {
      const data = Temple3D.exportBlessings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // 忽略瀏覽器儲存限制
    }
  }

  function loadBlessingsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        Temple3D.importBlessings(items);
      }
    } catch (err) {
      // 忽略損毀資料
    }
  }

  function openCardZoomModal(slotIdx) {
    const slots = Temple3D.getBlessingSlots();
    const slot = slots[slotIdx];
    if (!slot) return;

    activeZoomSlotIndex = slotIdx;
    const rowNum = Math.floor(slotIdx / 15) + 1;
    const colNum = (slotIdx % 15) + 1;
    zoomSlotLabel.textContent = `第 ${rowNum} 排 第 ${colNum} 格`;

    const displayText = slot.isUser && slot.wishText
      ? slot.wishText
      : slot.hasCard
        ? 'SXHS 藍色水滴祈福卡（可編輯寫入您的願望）'
        : '空掛位（輸入願望即可掛上此處）';

    zoomWishPreview.textContent = displayText;
    if (slot.isUser && slot.wishText) {
      const sepIdx = slot.wishText.indexOf('：') !== -1 ? slot.wishText.indexOf('：') : slot.wishText.indexOf(':');
      if (sepIdx !== -1) {
        zoomNameInput.value = slot.wishText.slice(0, sepIdx).trim();
        zoomWishInput.value = slot.wishText.slice(sepIdx + 1).trim();
      } else {
        zoomNameInput.value = '';
        zoomWishInput.value = slot.wishText;
      }
    } else {
      zoomNameInput.value = '';
      zoomWishInput.value = '';
    }
    btnDeleteCard.disabled = !slot.hasCard;
    cardZoomModal.classList.remove('hidden');
  }

  function renderWallGrid() {
    if (!wallGridEl) return;
    const slots = Temple3D.getBlessingSlots();
    wallGridEl.innerHTML = '';

    slots.forEach((slot) => {
      const cell = document.createElement('div');
      cell.className = 'wall-slot';
      if (slot.hasCard) cell.classList.add('has-card');
      if (slot.isUser) cell.classList.add('is-user');
      if (swapSourceIndex === slot.index) cell.classList.add('swap-selected');
      cell.draggable = slot.hasCard;

      const rowNum = slot.row + 1;
      const colNum = slot.col + 1;
      const labelText = slot.isUser
        ? slot.wishText
        : slot.hasCard
          ? '預設祈福卡'
          : '空位';

      cell.innerHTML = `
        <span class="wall-slot-pos">${rowNum}-${colNum}</span>
        <i class="fa-solid ${slot.hasCard ? 'fa-droplet' : 'fa-plus'} wall-slot-icon"></i>
        <span class="wall-slot-text">${labelText}</span>
      `;

      // 桌機拖曳換位
      cell.addEventListener('dragstart', (e) => {
        if (!slot.hasCard) {
          e.preventDefault();
          return;
        }
        dragSourceIndex = slot.index;
        e.dataTransfer.effectAllowed = 'move';
      });

      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        cell.classList.add('drag-over');
      });

      cell.addEventListener('dragleave', () => {
        cell.classList.remove('drag-over');
      });

      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        if (dragSourceIndex !== null && dragSourceIndex !== slot.index) {
          Temple3D.moveBlessingSlot(dragSourceIndex, slot.index);
          saveBlessingsToStorage();
          renderWallGrid();
          showToast('已更換祈福卡位置！');
        }
        dragSourceIndex = null;
      });

      // 點擊行為：換位模式（互換）或放大檢視/編輯
      cell.addEventListener('click', () => {
        if (swapMode) {
          if (swapSourceIndex === null) {
            if (!slot.hasCard) {
              showToast('請先點選一張有祈福卡的格子');
              return;
            }
            swapSourceIndex = slot.index;
            renderWallGrid();
            showToast('請再點選目標位置以完成換位');
          } else {
            if (swapSourceIndex !== slot.index) {
              Temple3D.moveBlessingSlot(swapSourceIndex, slot.index);
              saveBlessingsToStorage();
              showToast('已完成祈福卡換位！');
            }
            swapSourceIndex = null;
            renderWallGrid();
          }
          return;
        }
        openCardZoomModal(slot.index);
      });

      wallGridEl.appendChild(cell);
    });
  }

  if (btnWallManage && wallModal) {
    btnWallManage.addEventListener('click', () => {
      stopAutoTour();
      selectSpot(4, false);
      swapSourceIndex = null;
      renderWallGrid();
      wallModal.classList.remove('hidden');
    });
    btnCloseWall.addEventListener('click', () => wallModal.classList.add('hidden'));
    wallModal.addEventListener('click', (e) => {
      if (e.target === wallModal) wallModal.classList.add('hidden');
    });

    btnToggleSwap.addEventListener('click', () => {
      swapMode = !swapMode;
      swapSourceIndex = null;
      btnToggleSwap.classList.toggle('active', swapMode);
      swapModeLabel.textContent = swapMode ? '點選換位：開啟中' : '點選換位：關閉';
      renderWallGrid();
    });

    btnExportWishes.addEventListener('click', () => {
      const data = Temple3D.exportBlessings();
      if (!data.length) {
        showToast('目前尚無使用者自訂祈福願望可匯出');
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `蔴竹坑福德祠_祈福願望_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`已匯出 ${data.length} 筆祈福願望！`);
    });

    btnImportWishes.addEventListener('click', () => {
      importWishesFile.value = '';
      importWishesFile.click();
    });

    importWishesFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!Array.isArray(parsed)) throw new Error('格式不符');
          Temple3D.importBlessings(parsed);
          saveBlessingsToStorage();
          renderWallGrid();
          selectSpot(4, false);
          showToast(`已成功匯入 ${parsed.length} 筆祈福願望！`);
        } catch (err) {
          showToast('匯入失敗：請確認為正確的願望 JSON 檔案');
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  if (cardZoomModal) {
    btnCloseZoom.addEventListener('click', () => cardZoomModal.classList.add('hidden'));
    cardZoomModal.addEventListener('click', (e) => {
      if (e.target === cardZoomModal) cardZoomModal.classList.add('hidden');
    });

    function updateZoomPreview() {
      const name = zoomNameInput.value.trim();
      const wish = zoomWishInput.value.trim();
      if (!wish && !name) {
        zoomWishPreview.textContent = '請輸入願望內容';
      } else {
        zoomWishPreview.textContent = name ? `${name}：${wish || '（請輸入心願）'}` : wish;
      }
    }

    zoomNameInput.addEventListener('input', updateZoomPreview);
    zoomWishInput.addEventListener('input', updateZoomPreview);

    btnSaveCard.addEventListener('click', () => {
      if (activeZoomSlotIndex === null) return;
      const name = zoomNameInput.value.trim();
      const wish = zoomWishInput.value.trim();
      if (!wish) {
        showToast('請輸入祈福心願，或點擊「刪除此卡」移除');
        return;
      }
      const nextText = name ? `${name}：${wish}` : wish;
      Temple3D.setBlessingSlot(activeZoomSlotIndex, nextText, true);
      saveBlessingsToStorage();
      renderWallGrid();
      cardZoomModal.classList.add('hidden');
      showToast('已更新並同步至 3D 祈福牆！');
    });

    btnDeleteCard.addEventListener('click', () => {
      if (activeZoomSlotIndex === null) return;
      Temple3D.removeBlessingSlot(activeZoomSlotIndex);
      saveBlessingsToStorage();
      renderWallGrid();
      cardZoomModal.classList.add('hidden');
      showToast('已從祈福牆移除該張祈福卡');
    });

    if (btnExportCardImage) {
      btnExportCardImage.addEventListener('click', () => {
        const name = zoomNameInput.value.trim();
        let wish = zoomWishInput.value.trim();
        if (!wish && activeZoomSlotIndex !== null) {
          const slots = Temple3D.getBlessingSlots();
          const slot = slots[activeZoomSlotIndex];
          if (slot && slot.isUser && slot.wishText) {
            wish = slot.wishText;
          } else {
            wish = '福添沾厚澤・平安順心';
          }
        }
        const slotLabel = zoomSlotLabel ? zoomSlotLabel.textContent.trim() : '誠心祈福御守';
        exportSquareBlessingCardImage({
          name,
          wish: wish || '福添沾厚澤・平安順心',
          slotLabel
        });
      });
    }
  }

  // ===== 擲筊問事互動 =====
  const btnBwei = document.getElementById('btn-bwei');
  const bweiModal = document.getElementById('bwei-modal');
  const btnCloseBwei = document.getElementById('btn-close-bwei');
  const btnThrowBwei = document.getElementById('btn-throw-bwei');
  const bweiPairEl = document.getElementById('bwei-pair');
  const bweiLeftEl = document.getElementById('bwei-left');
  const bweiRightEl = document.getElementById('bwei-right');
  const bweiBadgeEl = document.getElementById('bwei-badge');
  const bweiFortuneEl = document.getElementById('bwei-fortune');
  const bweiShengCountEl = document.getElementById('bwei-sheng-count');
  const bweiStreakCountEl = document.getElementById('bwei-streak-count');

  let bweiShengTotal = 0;
  let bweiStreak = 0;
  let bweiBusy = false;

  const BWEI_MESSAGES = {
    sheng: [
      '土地公點頭應允！保持平常心與穩健步調，所求之事必能順利推進！',
      '聖筊大吉！福添沾厚澤，土地公與土地婆會保佑你平安順遂！',
      '雙中土地公微笑讚許！勇敢照著心中的方向前進，貴人就在身旁！'
    ],
    xiao: [
      '土地公土地婆笑呵呵～這件事答案其實已經很明朗了，別再猶豫啦！',
      '笑筊！土地公說：「問題再說清楚一點，或者放輕鬆順其自然就好喔！」',
      '土地公微微一笑，提醒你先深呼吸、換個角度想一想會更清楚！'
    ],
    yin: [
      '陰筊（蓋筊）！土地公搖搖頭，表示現在時機未到，先沉澱準備再行動！',
      '蓋筊提醒：這件事還有需要再三確認的小細節，緩一緩會更穩妥喔！',
      '土地公先按兵不動，建議調整一下做法或稍後再誠心請示一次！'
    ]
  };

  // Web Audio API 擲筊木質撞擊與鐘磬音效引擎（純前端合成）
  const BweiAudio = (function () {
    let ctx = null;
    function getCtx() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function playToss() {
      const c = getCtx();
      if (!c) return;
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    function playWoodClack(delaySec, freq, vol) {
      const c = getCtx();
      if (!c) return;
      const t = c.currentTime + delaySec;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.42, t + 0.055);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.075);

      // 加入木質短促清脆敲擊高頻
      const osc2 = c.createOscillator();
      const gain2 = c.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.1, t);
      osc2.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.03);
      gain2.gain.setValueAtTime(vol * 0.55, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc2.connect(gain2);
      gain2.connect(c.destination);
      osc2.start(t);
      osc2.stop(t + 0.04);
    }

    function playChime(notes, baseDelay) {
      const c = getCtx();
      if (!c) return;
      notes.forEach((freq, i) => {
        const t = c.currentTime + baseDelay + i * 0.11;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.58);
      });
    }

    return {
      playThrowSequence(resultType, nextStreak) {
        playToss();
        // 模擬左右雙筊主落地與二次小彈跳「喀、喀、噠」
        playWoodClack(0.58, 760, 0.24);
        playWoodClack(0.62, 690, 0.22);
        playWoodClack(0.79, 820, 0.12);
        playWoodClack(0.83, 730, 0.10);

        if (resultType === 'sheng') {
          if (nextStreak >= 3) {
            playChime([523.25, 659.25, 783.99, 1046.5], 0.90);
          } else {
            playChime([587.33, 880.0], 0.90);
          }
        } else if (resultType === 'xiao') {
          playChime([523.25, 659.25], 0.90);
        }
      }
    };
  })();

  if (btnBwei && bweiModal) {
    btnBwei.addEventListener('click', () => {
      stopAutoTour();
      selectSpot(3, false);
      bweiModal.classList.remove('hidden');
    });
    btnCloseBwei.addEventListener('click', () => bweiModal.classList.add('hidden'));
    bweiModal.addEventListener('click', (e) => {
      if (e.target === bweiModal) bweiModal.classList.add('hidden');
    });

    btnThrowBwei.addEventListener('click', () => {
      if (bweiBusy) return;
      bweiBusy = true;
      btnThrowBwei.disabled = true;

      bweiPairEl.classList.remove('throwing');
      void bweiPairEl.offsetWidth;
      bweiPairEl.classList.add('throwing');

      // 依真實機率開筊：聖筊 50%、笑筊 25%、陰筊 25%
      const r = Math.random();
      const resultType = r < 0.5 ? 'sheng' : r < 0.75 ? 'xiao' : 'yin';
      const nextStreak = resultType === 'sheng' ? bweiStreak + 1 : 0;

      Temple3D.throwBwei3D(resultType);
      BweiAudio.playThrowSequence(resultType, nextStreak);

      bweiBadgeEl.className = 'bwei-badge ready';
      bweiBadgeEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 誠心擲筊中…';
      bweiFortuneEl.textContent = '雙筊凌空翻轉，請靜候土地公指示…';

      setTimeout(() => {
        bweiPairEl.classList.remove('throwing');
        bweiLeftEl.classList.remove('flat', 'convex');
        bweiRightEl.classList.remove('flat', 'convex');

        if (resultType === 'sheng') {
          bweiLeftEl.classList.add('flat');
          bweiRightEl.classList.add('convex');
          bweiShengTotal += 1;
          bweiStreak += 1;

          const pool = BWEI_MESSAGES.sheng;
          const msg = pool[Math.floor(Math.random() * pool.length)];

          bweiBadgeEl.className = 'bwei-badge sheng';
          if (bweiStreak >= 3) {
            bweiBadgeEl.innerHTML = `<i class="fa-solid fa-crown"></i> 連 ${bweiStreak} 聖筊・土地公大力加持！`;
            showToast(`太神啦！連續擲出 ${bweiStreak} 個聖筊，土地公大力保佑！`);
          } else {
            bweiBadgeEl.innerHTML = '<i class="fa-solid fa-check-circle"></i> 聖筊（一正一反）';
          }
          bweiFortuneEl.textContent = msg;
        } else if (resultType === 'xiao') {
          bweiLeftEl.classList.add('flat');
          bweiRightEl.classList.add('flat');
          bweiStreak = 0;

          const msg = BWEI_MESSAGES.xiao[Math.floor(Math.random() * BWEI_MESSAGES.xiao.length)];
          bweiBadgeEl.className = 'bwei-badge xiao';
          bweiBadgeEl.innerHTML = '<i class="fa-solid fa-face-laugh-beam"></i> 笑筊（兩平面朝上）';
          bweiFortuneEl.textContent = msg;
        } else {
          bweiLeftEl.classList.add('convex');
          bweiRightEl.classList.add('convex');
          bweiStreak = 0;

          const msg = BWEI_MESSAGES.yin[Math.floor(Math.random() * BWEI_MESSAGES.yin.length)];
          bweiBadgeEl.className = 'bwei-badge yin';
          bweiBadgeEl.innerHTML = '<i class="fa-solid fa-rotate-left"></i> 陰筊／蓋筊（兩凸面朝上）';
          bweiFortuneEl.textContent = msg;
        }

        bweiShengCountEl.textContent = String(bweiShengTotal);
        bweiStreakCountEl.textContent = String(bweiStreak);
        bweiBusy = false;
        btnThrowBwei.disabled = false;
      }, 920);
    });
  }

  // ===== 線上獻供互動 =====
  const btnOfferings = document.getElementById('btn-offerings');
  const offeringsModal = document.getElementById('offerings-modal');
  const btnCloseOfferings = document.getElementById('btn-close-offerings');
  const offeringCards = document.querySelectorAll('.offering-card');
  const btnClearOfferings = document.getElementById('btn-clear-offerings');
  const btnAllOfferings = document.getElementById('btn-all-offerings');

  function syncOfferingCardsUI() {
    const active = Temple3D.getActiveOfferings();
    offeringCards.forEach((card) => {
      card.classList.toggle('active', active.includes(card.dataset.offering));
    });
  }

  if (btnOfferings && offeringsModal) {
    btnOfferings.addEventListener('click', () => {
      stopAutoTour();
      selectSpot(3, false);
      syncOfferingCardsUI();
      offeringsModal.classList.remove('hidden');
    });
    btnCloseOfferings.addEventListener('click', () => offeringsModal.classList.add('hidden'));
    offeringsModal.addEventListener('click', (e) => {
      if (e.target === offeringsModal) offeringsModal.classList.add('hidden');
    });

    offeringCards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.offering;
        const willEnable = !card.classList.contains('active');
        Temple3D.setOffering(id, willEnable);
        syncOfferingCardsUI();
        const title = card.querySelector('strong').textContent;
        showToast(willEnable ? `已將「${title}」誠心擺上 3D 供桌！` : `已從供桌收起「${title}」`);
      });
    });

    btnClearOfferings.addEventListener('click', () => {
      Temple3D.clearOfferings();
      syncOfferingCardsUI();
      showToast('已將供桌供品整理收起');
    });

    btnAllOfferings.addEventListener('click', () => {
      offeringCards.forEach((card) => {
        Temple3D.setOffering(card.dataset.offering, true);
      });
      syncOfferingCardsUI();
      showToast('澎湃六大供品已全數擺上 3D 供桌，福添沾厚澤！');
    });
  }

  // ===== 左下角吉祥物自由拖曳功能 (滑鼠 + 觸控) =====
  const mascot = document.getElementById('mascot-container');
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function startDrag(clientX, clientY) {
    isDragging = true;
    mascot.classList.add('dragging');
    const rect = mascot.getBoundingClientRect();
    dragOffsetX = clientX - rect.left;
    dragOffsetY = clientY - rect.top;
    // 解除原本的 bottom 定位，改用 top/left 絕對座標
    mascot.style.bottom = 'auto';
    mascot.style.left = `${rect.left}px`;
    mascot.style.top = `${rect.top}px`;
  }

  function moveDrag(clientX, clientY) {
    if (!isDragging) return;
    const maxW = window.innerWidth - mascot.offsetWidth;
    const maxH = window.innerHeight - mascot.offsetHeight;
    const nextX = Math.max(0, Math.min(clientX - dragOffsetX, maxW));
    const nextY = Math.max(0, Math.min(clientY - dragOffsetY, maxH));
    mascot.style.left = `${nextX}px`;
    mascot.style.top = `${nextY}px`;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    mascot.classList.remove('dragging');
  }

  mascot.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  mascot.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  window.addEventListener('touchend', endDrag);
});
