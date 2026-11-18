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

  let activeZoomSlotIndex = null;
  let swapMode = false;
  let swapSourceIndex = null;
  let dragSourceIndex = null;

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
