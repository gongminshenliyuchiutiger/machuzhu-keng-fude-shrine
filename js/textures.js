// 程式化 Canvas 貼圖生成器（完全不使用真實照片，純手繪程式還原細節與詳實文字）
window.TempleTextures = (function () {
  function makeCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return { canvas, ctx: canvas.getContext('2d') };
  }

  // 工具函式：繪製直書文字（由右至左換行）
  function drawVerticalTextColumns(ctx, columns, startX, startY, colGap, charStep, font, color) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    columns.forEach((colStr, colIdx) => {
      const x = startX - colIdx * colGap;
      let y = startY;
      for (const ch of colStr) {
        if (ch === '（' || ch === '）' || ch === '「' || ch === '」' || ch === '／') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(ch, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(ch, x, y);
        }
        y += charStep;
      }
    });
    ctx.restore();
  }

  // 1. 百年風化砂岩與青苔紋理
  function createStoneTexture(baseColor = '#9b9180', mossAmount = 0.15) {
    const { canvas, ctx } = makeCanvas(512, 512);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 6500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 2.5 + 0.5;
      const shade = Math.random() > 0.5 ? 'rgba(255,250,240,0.08)' : 'rgba(40,35,28,0.12)';
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(55, 48, 38, 0.22)';
    for (let i = 0; i < 18; i++) {
      ctx.lineWidth = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      let cx = Math.random() * 512;
      let cy = Math.random() * 512;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (Math.random() - 0.5) * 60;
        cy += (Math.random() - 0.5) * 60;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    const mossCount = Math.floor(25 * mossAmount);
    for (let i = 0; i < mossCount; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const rad = 18 + Math.random() * 40;
      const grad = ctx.createRadialGradient(x, y, 2, x, y, rad);
      grad.addColorStop(0, 'rgba(78, 102, 48, 0.35)');
      grad.addColorStop(1, 'rgba(78, 102, 48, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 2. 石刻對聯、年分與匾額文字
  function createCarvedStoneTextTexture(text, w = 256, h = 512, fontSize = 48, isVertical = true, bgColor = '#938876', inkColor = 'rgba(182, 96, 86, 0.85)') {
    const { canvas, ctx } = makeCanvas(w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px "Noto Serif TC", serif`;

    if (isVertical) {
      const chars = text.split('');
      const step = (h - 36) / chars.length;
      chars.forEach((ch, idx) => {
        const y = 18 + step * (idx + 0.5);
        ctx.fillStyle = 'rgba(40, 30, 25, 0.65)';
        ctx.fillText(ch, w / 2 + 2, y + 2);
        ctx.fillStyle = inkColor;
        ctx.fillText(ch, w / 2, y);
      });
    } else {
      ctx.fillStyle = 'rgba(40, 30, 25, 0.65)';
      ctx.fillText(text, w / 2 + 2, h / 2 + 2);
      ctx.fillStyle = inkColor;
      ctx.fillText(text, w / 2, h / 2);
    }

    return new THREE.CanvasTexture(canvas);
  }

  // 3. 遮雨棚正面「蔴竹坑福德祠」看板
  function createCanopySignTexture() {
    const { canvas, ctx } = makeCanvas(1024, 220);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 220);
    bgGrad.addColorStop(0, '#dfe3de');
    bgGrad.addColorStop(1, '#cdd3ce');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 220);

    function drawLantern(x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#6d4c41';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.lineTo(0, 45);
      ctx.stroke();

      ctx.fillStyle = '#d4a359';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8b261d';
      ctx.stroke();

      ctx.fillStyle = '#8b261d';
      ctx.fillRect(-10, -20, 20, 5);
      ctx.fillRect(-10, 15, 20, 5);
      ctx.restore();
    }
    drawLantern(75, 78, 0.9);
    drawLantern(118, 62, 0.72);

    function drawFlower(cx, cy, r, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.arc(0, -r * 0.65, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f6d55c';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawFlower(165, 58, 18, '#c96f82');
    drawFlower(900, 155, 24, '#d97b93');
    drawFlower(945, 130, 16, '#8da4c9');

    // 六個圓圈紅字：蔴 竹 坑 福 德 祠
    const chars = ['蔴', '竹', '坑', '福', '德', '祠'];
    const startX = 225;
    const gap = 114;
    chars.forEach((ch, idx) => {
      const cx = startX + idx * gap;
      const cy = 138;

      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#e7d7b0';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#c26b62';
      ctx.stroke();

      ctx.fillStyle = '#9e2629';
      ctx.font = '900 56px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, cx, cy + 3);
    });

    return new THREE.CanvasTexture(canvas);
  }

  // 4. 紅色八仙彩
  function createEightImmortalsBannerTexture() {
    const { canvas, ctx } = makeCanvas(512, 160);

    ctx.fillStyle = '#b92623';
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = '#e6c35c';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 496, 120);

    ctx.fillStyle = '#d9b54a';
    ctx.fillRect(8, 118, 496, 8);

    const colors = ['#48a999', '#3f6ca8', '#e5c158', '#689f38', '#1e5b94', '#e07a5f', '#e58ab4', '#81c784'];
    for (let i = 0; i < 8; i++) {
      const x = 42 + i * 60;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(x - 12, 50, 24, 58, 8);
      ctx.fill();
      ctx.fillStyle = '#f5cfa0';
      ctx.beginPath();
      ctx.arc(x, 40, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    const words = ['堂', '滿', '玉', '金'];
    words.forEach((w, i) => {
      const wx = 72 + i * 118;
      ctx.fillStyle = '#2d4b2d';
      ctx.beginPath();
      ctx.arc(wx, 26, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f3d06b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f3d06b';
      ctx.font = 'bold 14px "Noto Serif TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(w, wx, 27);
    });

    ctx.strokeStyle = '#a9c46c';
    ctx.lineWidth = 2;
    for (let x = 16; x < 500; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 126);
      ctx.lineTo(x + 8, 140);
      ctx.lineTo(x, 158);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // 5. 詳實還原《七面式石造小土地公廟 建築構造》高解析直書看板 (1400 x 560)
  function createStructureBoardTexture() {
    const { canvas, ctx } = makeCanvas(1400, 560);

    // 淡灰青綠紙質底色
    const bgGrad = ctx.createLinearGradient(0, 0, 1400, 560);
    bgGrad.addColorStop(0, '#cfd8ca');
    bgGrad.addColorStop(1, '#bec8b8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1400, 560);

    // 青山梯田波紋背景
    const hills = [
      { x: 260, y: 560, r: 240, c: '#7d9874' },
      { x: 640, y: 560, r: 280, c: '#8aa482' },
      { x: 1080, y: 560, r: 260, c: '#75916d' }
    ];
    hills.forEach((h) => {
      ctx.fillStyle = h.c;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 3;
      for (let rad = h.r - 35; rad > 50; rad -= 35) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, rad, Math.PI, 0);
        ctx.stroke();
      }
    });

    // 右側大標題：七面式石造小土地公廟 / 建築構造
    drawVerticalTextColumns(
      ctx,
      ['七面式石造小土地公廟'],
      1335,
      62,
      44,
      42,
      'bold 34px "Noto Serif TC", serif',
      '#1a241b'
    );
    drawVerticalTextColumns(
      ctx,
      ['建築構造'],
      1275,
      310,
      40,
      44,
      'bold 34px "Noto Serif TC", serif',
      '#1a241b'
    );

    // 直書條列內文（由右向左逐行呈現）
    const textCols = [
      '1.屋脊面：雕樑畫棟、兩端似燕尾翹起。',
      '2.前屋簷：中軸下凹，象徵微笑朝天，屋稜多為雙數',
      '　　　　　設計，但少部分為單數，可能是工匠疏忽。',
      '3.後屋簷：少部分會同前屋簷，大部分會簡化或忽略。',
      '4.正立面：一般由上方「楣板」、下方「門檻」、左',
      '　　　　　右各一對「聯柱」共四片石塊組成，惟本',
      '　　　　　座左右各多一片，此外通常門口應有內縮',
      '　　　　　稱為「凹壽」，本座亦未內縮較為特殊，',
      '　　　　　石塊上刻有廟名、年分、對聯、起造／奉',
      '　　　　　祀人。',
      '　本座廟名：「蔴竹坑」福德祠。',
      '　年分：光緒壬辰年冬月置（西元1892年）。',
      '　對聯：上聯「福添沾厚澤」，',
      '　　　　下聯「神佑慶長春」。',
      '　起造／奉祀人：蔴竹坑庄眾弟子立。',
      '5.後立面',
      '6.左立面',
      '7.右立面',
      '　底座：為一塊大石板，通常大於小廟面積，',
      '　　　　本座則偏小且有兩層。'
    ];

    drawVerticalTextColumns(
      ctx,
      textCols,
      1195,
      46,
      43,
      21.5,
      '600 18px "Noto Serif TC", serif',
      '#192119'
    );

    // 左側小廟構造線稿示意圖與標號 ②、⑦
    ctx.save();
    ctx.strokeStyle = '#1f261f';
    ctx.lineWidth = 3;
    // 屋脊與斜頂
    ctx.beginPath();
    ctx.moveTo(45, 220);
    ctx.lineTo(175, 220);
    ctx.lineTo(225, 310);
    ctx.lineTo(95, 310);
    ctx.closePath();
    ctx.stroke();
    // 屋稜線
    for (let x = 65; x < 175; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 220);
      ctx.lineTo(x + 48, 310);
      ctx.stroke();
    }
    // 廟身與底座
    ctx.strokeRect(85, 310, 125, 110);
    ctx.strokeRect(70, 420, 155, 28);
    ctx.strokeRect(60, 448, 175, 24);

    // 紅色圓圈標號 2 與 7
    function drawBadgeNum(bx, by, num) {
      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#f2ede4';
      ctx.fill();
      ctx.strokeStyle = '#b92b27';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#b92b27';
      ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(num, bx, by + 1);
    }
    drawBadgeNum(155, 255, '2');
    drawBadgeNum(165, 435, '7');
    ctx.restore();

    // 左下角指導與繪製署名
    ctx.fillStyle = '#1d241d';
    ctx.font = 'bold 17px "Noto Serif TC", serif';
    ctx.textAlign = 'left';
    ctx.fillText('指導：劉憲宗建築師', 28, 514);
    ctx.fillText('模型繪製：邱意萱老師', 28, 540);

    return new THREE.CanvasTexture(canvas);
  }

  // 5b. 遮雨棚左側前半段：淡蘭古道與土地公信仰解說
  function createLeftFrontBoardTexture() {
    const { canvas, ctx } = makeCanvas(800, 400);
    ctx.fillStyle = '#cbd4c6';
    ctx.fillRect(0, 0, 800, 400);

    ctx.fillStyle = '#859f7e';
    ctx.beginPath();
    ctx.arc(400, 420, 320, Math.PI, 0);
    ctx.fill();

    const cols = [
      '沿途的石造土地公見證',
      '了北臺灣篳路藍縷的',
      '開墾史。',
      '漢人除了祈求原鄉神',
      '祇的保佑，也需要「',
      '親民」的神祇來守護',
      '平安，而土地公就是',
      '最親近生活的精神寄',
      '託。',
      '臺灣千餘座的石造',
      '土地公廟當中，淡蘭',
      '古道即佔了兩百五十',
      '座，其中百餘座位於',
      '雙溪，外觀仿閩式建',
      '築玄關縮小的七面式',
      '結構，各具特色！'
    ];

    drawVerticalTextColumns(
      ctx,
      cols,
      740,
      45,
      44,
      26,
      '600 20px "Noto Serif TC", serif',
      '#192119'
    );

    return new THREE.CanvasTexture(canvas);
  }

  // 6. 淡蘭古道與雙溪地圖看板
  function createMapBoardTexture() {
    const { canvas, ctx } = makeCanvas(1024, 420);
    ctx.fillStyle = '#409172';
    ctx.fillRect(0, 0, 1024, 420);

    ctx.fillStyle = '#1f5e48';
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.quadraticCurveTo(260, 140, 520, 270);
    ctx.quadraticCurveTo(780, 120, 1024, 260);
    ctx.lineTo(1024, 420);
    ctx.lineTo(0, 420);
    ctx.fill();

    // 公路橘紅帶 (台2丙) 與藍線
    ctx.strokeStyle = '#c45b3b';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(70, 220);
    ctx.lineTo(470, 220);
    ctx.moveTo(560, 255);
    ctx.lineTo(940, 255);
    ctx.stroke();

    ctx.strokeStyle = '#255c99';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(510, 120);
    ctx.lineTo(510, 200);
    ctx.stroke();

    ctx.fillStyle = '#fff5d6';
    ctx.font = 'bold 30px "Noto Serif TC", serif';
    ctx.fillText('雙溪、貢寮 石造小土地公廟分布圖', 40, 56);

    ctx.font = 'bold 26px "Noto Serif TC", serif';
    ctx.fillText('蔴竹坑福德祠（雙溪高中）', 360, 110);

    ctx.font = '22px "Noto Sans TC", sans-serif';
    ctx.fillText('平溪 ← 台2丙 → 牡丹（102）→ 雙溪車站 → 三忠廟 → 貢寮', 175, 345);

    return new THREE.CanvasTexture(canvas);
  }

  // 7. 詳實還原「感恩的心 — 一甲子的守護－雙中土地公」不鏽鋼解說牌 (1024 x 768)
  function createGratitudePlaqueTexture() {
    const { canvas, ctx } = makeCanvas(1024, 768);
    const grad = ctx.createLinearGradient(0, 0, 1024, 768);
    grad.addColorStop(0, '#d5dade');
    grad.addColorStop(0.5, '#eef1f4');
    grad.addColorStop(1, '#c3c8cd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 996, 740);

    ctx.fillStyle = '#181c20';
    ctx.textAlign = 'center';
    ctx.font = 'bold 42px "Noto Serif TC", serif';
    ctx.fillText('感  恩  的  心', 512, 74);
    ctx.font = 'bold 28px "Noto Serif TC", serif';
    ctx.fillText('— 一甲子的守護－雙中土地公 —', 512, 120);

    ctx.textAlign = 'left';
    ctx.font = '20px "Noto Sans TC", sans-serif';
    const paragraphs = [
      '　　為天下求福報功，人非土不立，非穀不食，故封土立社——福德正神「土地公」。',
      '　　本校校址原是一片耕地，立有土地公廟，名為「蔴竹坑福德祠」，建於光緒十',
      '八年（西元一八九二年）壬辰冬月，坐東向西，供奉土地公、土地婆，兩尊神像俱',
      '為石雕，祠宇為石造，聯曰：「福添沾厚澤，神佑慶長春」，堂寬一百零五公分，',
      '祠高一百六十四公分，殿深九十九公分，內鐫「福德正神」四大字。',
      '　　民國八十四年土地被本校徵收，學校認為此祠乃先民文化遺產，保存於校園中',
      '具有傳承鄉土意識的精神。營造商陳朝松先生捐贈廟頂上方的遮雨棚，家長章慶名',
      '先生與清潔工賴含笑女士分別發願捐獻金爐及金鼎（俗稱天公爐）。',
      '　　走過一甲子的雙中，每當學校或鄉內要辦運動會、大型活動，承辦人員必以「',
      '旺旺」餅乾祭拜祈求天晴，說也奇怪即使連日陰雨，活動當天卻是萬里無雲。每日',
      '清晨或黃昏，常常可見許多師生來祠前膜拜，自創校以來，「蔴竹坑福德祠」日日',
      '夜夜守護著校園中的人、事、物，是我們最珍貴的資產，也是雙中永遠的精神支柱。'
    ];
    paragraphs.forEach((line, idx) => {
      ctx.fillText(line, 56, 178 + idx * 38);
    });

    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Noto Serif TC", serif';
    ctx.fillText('中 華 民 國 九 十 五 年 六 月', 420, 686);

    ctx.textAlign = 'right';
    ctx.font = 'bold 21px "Noto Serif TC", serif';
    ctx.fillText('江正富老師  追述', 960, 650);
    ctx.fillText('陳月英老師  書記', 960, 684);
    ctx.fillText('黃棋楓校長  立誌', 960, 718);

    return new THREE.CanvasTexture(canvas);
  }

  // 8. SXHS 水滴形藍色祈福卡貼圖
  function createBlessingCardTexture(wishText = '') {
    const { canvas, ctx } = makeCanvas(192, 256);
    ctx.clearRect(0, 0, 192, 256);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(96, 12);
    ctx.bezierCurveTo(160, 110, 180, 175, 162, 212);
    ctx.bezierCurveTo(144, 245, 48, 245, 30, 212);
    ctx.bezierCurveTo(12, 175, 32, 110, 96, 12);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 20, 0, 240);
    grad.addColorStop(0, 'rgba(220, 240, 255, 0.85)');
    grad.addColorStop(0.55, 'rgba(72, 165, 235, 0.85)');
    grad.addColorStop(1, 'rgba(12, 102, 194, 0.92)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.roundRect(72, 54, 48, 20, 8);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(72, 68, 48, 8);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(91, 58, 10, 10);

    ctx.fillStyle = '#fde3c8';
    ctx.beginPath();
    ctx.arc(96, 92, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(87, 90, 4, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(105, 90, 4, Math.PI, 0);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(80, 96);
    ctx.quadraticCurveTo(96, 130, 112, 96);
    ctx.fill();

    if (wishText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(36, 136, 120, 52);
      ctx.fillStyle = '#1b3b6f';
      ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      const line1 = wishText.slice(0, 8);
      const line2 = wishText.slice(8, 16);
      ctx.fillText(line1, 96, 158);
      if (line2) ctx.fillText(line2, 96, 178);
    }

    ctx.fillStyle = '#0a1f3d';
    ctx.font = 'bold 12px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SXHS 蔴竹坑福德祠', 96, 222);

    return new THREE.CanvasTexture(canvas);
  }

  // 9. 右側校舍牆面土地公壁畫
  function createWallMuralTexture() {
    const { canvas, ctx } = makeCanvas(768, 384);
    ctx.fillStyle = '#e5e7e6';
    ctx.fillRect(0, 0, 768, 384);

    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(460, 110, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 4;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(460 + Math.cos(a) * 38, 110 + Math.sin(a) * 38);
      ctx.lineTo(460 + Math.cos(a) * 180, 110 + Math.sin(a) * 180);
      ctx.stroke();
    }

    ctx.fillStyle = '#5ca376';
    ctx.beginPath();
    ctx.arc(520, 384, 210, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#7bb8c9';
    ctx.beginPath();
    ctx.arc(160, 384, 180, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#c89b2b';
    ctx.beginPath();
    ctx.roundRect(495, 190, 95, 125, 22);
    ctx.fill();
    ctx.fillStyle = '#f2cfa8';
    ctx.beginPath();
    ctx.arc(542, 155, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(542, 175, 22, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#2d4b7a';
    ctx.beginPath();
    ctx.roundRect(220, 260, 50, 80, 12);
    ctx.fill();
    ctx.fillStyle = '#f2cfa8';
    ctx.beginPath();
    ctx.arc(245, 240, 18, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // 10. 白色磁磚參拜道
  function createTileFloorTexture() {
    const { canvas, ctx } = makeCanvas(256, 256);
    ctx.fillStyle = '#e8eae6';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#9aa09a';
    ctx.lineWidth = 3;
    const step = 64;
    for (let i = 0; i <= 256; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  // 11. 遮雨棚右側內壁「梅竹古道・囊螢映雪」解說看板
  function createRightFrontBoardTexture() {
    const { canvas, ctx } = makeCanvas(1024, 400);
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 400);
    bgGrad.addColorStop(0, '#1f4f38');
    bgGrad.addColorStop(0.55, '#3b7d54');
    bgGrad.addColorStop(1, '#92b58e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 400);

    // 竹林剪影
    ctx.strokeStyle = 'rgba(25, 65, 40, 0.45)';
    ctx.lineWidth = 10;
    for (let x = 680; x < 980; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 400);
      ctx.lineTo(x + 25, 0);
      ctx.stroke();
    }

    // 右半：梅竹古道
    drawVerticalTextColumns(
      ctx,
      ['梅竹古道'],
      960,
      70,
      44,
      46,
      'bold 34px "Noto Serif TC", serif',
      '#152218'
    );
    const meizhuCols = [
      '梅竹坪，舊稱蔴竹坑，因本地',
      '蔴竹茂盛而得名。',
      '清治時期雙溪地區文風鼎盛，',
      '當地秀才莊廷燦及其弟莊燦彰',
      '曾在此設立「梅竹園私塾」，',
      '供人就學，後人便稱此小徑為',
      '梅竹古道。'
    ];
    drawVerticalTextColumns(
      ctx,
      meizhuCols,
      890,
      48,
      36,
      23,
      '600 18px "Noto Serif TC", serif',
      '#162118'
    );

    // 左半：囊螢映雪
    drawVerticalTextColumns(
      ctx,
      ['囊螢映雪'],
      310,
      70,
      44,
      46,
      'bold 34px "Noto Serif TC", serif',
      '#eef4ea'
    );
    const fireflyCols = [
      '形容人在艱困的環境中',
      '勤奮讀書。',
      '每年四～五月是雙溪',
      '螢火蟲季，昔日學子沿',
      '著古道夜行求學。'
    ];
    drawVerticalTextColumns(
      ctx,
      fireflyCols,
      245,
      58,
      38,
      24,
      '500 18px "Noto Serif TC", serif',
      '#e2ebe0'
    );

    return new THREE.CanvasTexture(canvas);
  }

  // 12. 土地公／土地婆石雕官服前擺與雕花紋理
  function createDeityRobeTexture(isLandlord) {
    const { canvas, ctx } = makeCanvas(256, 256);
    ctx.fillStyle = '#333538';
    ctx.fillRect(0, 0, 256, 256);

    // 青斗石細緻顆粒感
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    // 中央朝服垂帶（補子與衣褶）
    ctx.fillStyle = '#25272a';
    ctx.fillRect(96, 18, 64, 220);
    ctx.strokeStyle = '#686c72';
    ctx.lineWidth = 3;
    ctx.strokeRect(98, 20, 60, 216);

    // 官服雕花（壽字或雲紋）
    ctx.fillStyle = '#7e838a';
    ctx.font = 'bold 28px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLandlord ? '福' : '壽', 128, 74);

    // 衣褶對稱曲線
    ctx.strokeStyle = '#4e5257';
    ctx.lineWidth = 2.5;
    for (let y = 115; y < 220; y += 26) {
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.quadraticCurveTo(85, y + 14, 96, y + 6);
      ctx.moveTo(211, y);
      ctx.quadraticCurveTo(171, y + 14, 160, y + 6);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // 13. 屋脊面傳統雙龍／卷草石雕浮雕紋理
  function createRidgeCarvingTexture() {
    const { canvas, ctx } = makeCanvas(512, 128);
    ctx.fillStyle = '#928570';
    ctx.fillRect(0, 0, 512, 128);

    // 砂岩斑駁與青苔
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,250,240,0.07)' : 'rgba(40,35,28,0.12)';
      ctx.fillRect(Math.random() * 512, Math.random() * 128, 2, 2);
    }

    // 邊框線條
    ctx.strokeStyle = 'rgba(55, 45, 32, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 12, 496, 104);

    // 傳統對稱卷草／火珠浮雕線條
    ctx.strokeStyle = 'rgba(65, 55, 40, 0.65)';
    ctx.lineWidth = 4;
    // 中央火珠
    ctx.beginPath();
    ctx.arc(256, 64, 16, 0, Math.PI * 2);
    ctx.stroke();

    // 左右對稱卷草波紋
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(256 + dir * 24, 64);
      ctx.bezierCurveTo(256 + dir * 70, 22, 256 + dir * 110, 106, 256 + dir * 155, 58);
      ctx.bezierCurveTo(256 + dir * 190, 25, 256 + dir * 215, 95, 256 + dir * 235, 45);
      ctx.stroke();
    });

    return new THREE.CanvasTexture(canvas);
  }

  // 14. 遮雨棚左側內壁連貫長幅（順序從前到後：臺灣千餘座土地公 -> 淡蘭古道上的土地公 -> 建築構造1~7）
  function createLeftCanopyBannerTexture() {
    const { canvas, ctx } = makeCanvas(2560, 460);
    const bg = ctx.createLinearGradient(0, 0, 2560, 460);
    bg.addColorStop(0, '#cfd8ca');
    bg.addColorStop(1, '#bcc6b6');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 2560, 460);

    // 青山梯田波紋背景
    [240, 740, 1260, 1800, 2320].forEach((hx, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#7d9874' : '#8aa482';
      ctx.beginPath();
      ctx.arc(hx, 460, 250, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 2.5;
      for (let r = 210; r > 50; r -= 38) {
        ctx.beginPath();
        ctx.arc(hx, 460, r, Math.PI, 0);
        ctx.stroke();
      }
    });

    // 前段（左，靠近入口）：臺灣千餘座石造土地公廟...
    const frontCols = [
      '臺灣千餘座的石造',
      '土地公廟當中，淡蘭',
      '古道即佔了兩百五十',
      '座，其中百餘座位於',
      '雙溪，外觀仿閩式建',
      '築玄關縮小的七面式',
      '結構，各具特色！',
      '　',
      '漢人除了祈求原鄉神',
      '祇的保佑，也需要「',
      '親民」的神祇來守護',
      '平安，而土地公就是',
      '最親近生活的精神寄',
      '託。',
      '　',
      '淡蘭古道是清朝先民',
      '往來淡水廳與噶瑪蘭',
      '廳的交通要道，約分',
      '為北中南三路網，沿',
      '途的石造土地公見證',
      '了北臺灣篳路藍縷的',
      '開墾史。'
    ];
    drawVerticalTextColumns(ctx, frontCols, 690, 44, 29, 23, '600 17.5px "Noto Serif TC", serif', '#192119');

    // 中段：淡蘭古道上的土地公 + 七面式立體構造線圖 + 紅圈標號 ①～⑦ + 署名
    drawVerticalTextColumns(ctx, ['淡蘭古道上的', '　　土地公'], 815, 52, 38, 29, 'bold 25px "Noto Serif TC", serif', '#182218');

    ctx.save();
    // 立體等角小廟線稿（中心約 x=980, y=245）
    ctx.strokeStyle = '#1f261f';
    ctx.lineWidth = 2.4;
    ctx.fillStyle = 'rgba(245, 245, 240, 0.72)';

    // 雙層底座
    ctx.beginPath();
    ctx.moveTo(885, 342);
    ctx.lineTo(1015, 342);
    ctx.lineTo(1075, 314);
    ctx.lineTo(1075, 336);
    ctx.lineTo(1015, 366);
    ctx.lineTo(885, 366);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 廟身正面與右側立面
    ctx.beginPath();
    ctx.moveTo(902, 238);
    ctx.lineTo(1002, 238);
    ctx.lineTo(1002, 342);
    ctx.lineTo(902, 342);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1002, 238);
    ctx.lineTo(1056, 212);
    ctx.lineTo(1056, 314);
    ctx.lineTo(1002, 342);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 廟門框線
    ctx.strokeRect(928, 265, 48, 77);

    // 前屋簷與後屋簷
    ctx.beginPath();
    ctx.moveTo(880, 242);
    ctx.lineTo(940, 168);
    ctx.lineTo(1012, 168);
    ctx.lineTo(1018, 242);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 屋脊弧線與燕尾
    ctx.beginPath();
    ctx.moveTo(934, 164);
    ctx.quadraticCurveTo(975, 174, 1020, 160);
    ctx.lineTo(1068, 198);
    ctx.lineTo(1018, 242);
    ctx.stroke();

    // 繪製紅圈白底標號 ①～⑦
    const badges = [
      { num: '1', x: 968, y: 146 },  // 屋脊面
      { num: '2', x: 938, y: 205 },  // 前屋簷
      { num: '3', x: 1034, y: 184 }, // 後屋簷
      { num: '4', x: 952, y: 304 },  // 正立面
      { num: '5', x: 1082, y: 248 }, // 後立面
      { num: '6', x: 874, y: 294 },  // 左立面
      { num: '7', x: 1030, y: 282 }  // 右立面
    ];
    badges.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#c62828';
      ctx.stroke();
      ctx.fillStyle = '#c62828';
      ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.num, b.x, b.y + 1);
    });

    // 署名
    ctx.fillStyle = '#1f271f';
    ctx.font = '600 14.5px "Noto Serif TC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('構造解說引自：劉憲宗建築師', 882, 405);
    ctx.fillText('蔴竹坑福德祠模型繪製：邱意萱老師', 882, 430);
    ctx.restore();

    // 後段（右，靠近廟後方）：七面式石造小土地公廟 建築構造 1~7 完整內容
    drawVerticalTextColumns(ctx, ['七面式石造小土地公廟'], 2500, 36, 36, 32, 'bold 25px "Noto Serif TC", serif', '#182218');
    drawVerticalTextColumns(ctx, ['建築構造'], 2452, 220, 32, 32, 'bold 25px "Noto Serif TC", serif', '#182218');

    const backCols = [
      '1.屋脊面：雕樑畫棟、兩端似燕尾翹起。',
      '2.前屋簷：中軸下凹，象徵微笑朝天，屋稜多為雙數',
      '　　　　　設計，但少部分為單數，可能是工匠疏忽。',
      '3.後屋簷：少部分會同前屋簷，大部分會簡化或忽略。',
      '4.正立面：一般由上方「楣板」、下方「門檻」、',
      '　　　　　左右各一對「聯柱」共四片石塊組成，',
      '　　　　　惟本座左右各多一片，此外通常門口應有',
      '　　　　　內縮，稱為「凹壽」，本座亦未內縮較為',
      '　　　　　特殊，石塊上刻有廟名、年分、對聯、',
      '　　　　　起造／奉祀人。',
      '　本座廟名：「蔴竹坑」福德祠。',
      '　年分：光緒壬辰年冬月置（西元1892年）。',
      '　對聯：上聯「福添沾厚澤」，下聯「神佑慶長春」。',
      '　起造／奉祀人：蔴竹坑庄眾弟子立。',
      '5.後立面　6.左立面　7.右立面',
      '　底座：為一塊大石板，通常大於小廟面積，',
      '　　　　本座則偏小且有兩層。'
    ];
    drawVerticalTextColumns(ctx, backCols, 2388, 32, 44, 17, '600 15px "Noto Serif TC", serif', '#192119');

    return new THREE.CanvasTexture(canvas);
  }

  // 15. 遮雨棚後方橫樑連貫長幅（面對正面入口：左鄰近景點 -> 中路線圖 -> 右土地公分布圖）
  function createBackCanopyBannerTexture() {
    const { canvas, ctx } = makeCanvas(2048, 420);

    // 左區：藍色鄰近景點地形圖
    ctx.fillStyle = '#4c99b8';
    ctx.fillRect(0, 0, 560, 420);
    ctx.fillStyle = '#48886a';
    ctx.beginPath();
    ctx.moveTo(0, 260);
    ctx.quadraticCurveTo(220, 120, 480, 210);
    ctx.lineTo(560, 420);
    ctx.lineTo(0, 420);
    ctx.fill();
    ctx.fillStyle = '#12263a';
    ctx.font = 'bold 26px "Noto Serif TC", serif';
    ctx.fillText('雙溪、貢寮地區', 290, 95);
    ctx.fillText('鄰近景點', 325, 130);

    // 中區：台2丙與雙溪路線圖
    ctx.fillStyle = '#409172';
    ctx.fillRect(560, 0, 928, 420);
    ctx.fillStyle = '#1f5e48';
    ctx.beginPath();
    ctx.moveTo(560, 290);
    ctx.quadraticCurveTo(800, 140, 1040, 270);
    ctx.quadraticCurveTo(1280, 120, 1488, 260);
    ctx.lineTo(1488, 420);
    ctx.lineTo(560, 420);
    ctx.fill();

    ctx.strokeStyle = '#c45b3b';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(610, 220);
    ctx.lineTo(980, 220);
    ctx.moveTo(1060, 255);
    ctx.lineTo(1430, 255);
    ctx.stroke();

    ctx.fillStyle = '#fff5d6';
    ctx.font = 'bold 26px "Noto Serif TC", serif';
    ctx.fillText('平溪 ← 台2丙 → 牡丹(102) → 蔴竹坑福德祠 → 雙溪車站 → 貢寮', 625, 345);
    ctx.fillText('蔴竹坑福德祠（雙溪高中）', 880, 115);

    // 右區：綠藍地形石造小土地公廟分布圖
    ctx.fillStyle = '#427f8c';
    ctx.fillRect(1488, 0, 560, 420);
    ctx.fillStyle = '#4e7b63';
    ctx.beginPath();
    ctx.moveTo(1488, 180);
    ctx.quadraticCurveTo(1760, 90, 2000, 240);
    ctx.lineTo(2048, 420);
    ctx.lineTo(1488, 420);
    ctx.fill();
    ctx.fillStyle = '#14241e';
    ctx.font = 'bold 24px "Noto Serif TC", serif';
    ctx.fillText('雙溪、貢寮地區', 1530, 130);
    ctx.fillText('石造小土地公廟', 1530, 162);
    ctx.fillText('分布圖', 1565, 194);

    return new THREE.CanvasTexture(canvas);
  }

  // 16. 遮雨棚右側內壁連貫長幅（從左到右對應「從後到前」：囊螢映雪 -> 油桐花風景 -> 梅竹古道）
  function createRightCanopyBannerTexture() {
    const { canvas, ctx } = makeCanvas(2048, 420);

    // 後段（左）：囊螢映雪深綠夜空
    const leftGrad = ctx.createLinearGradient(0, 0, 620, 0);
    leftGrad.addColorStop(0, '#132a20');
    leftGrad.addColorStop(1, '#20523c');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 620, 420);

    // 螢火蟲微光
    ctx.fillStyle = '#d9ff70';
    [[440, 120], [510, 90], [390, 180], [490, 210], [550, 145]].forEach(([fx, fy]) => {
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    drawVerticalTextColumns(ctx, ['囊螢映雪'], 315, 80, 40, 44, 'bold 34px "Noto Serif TC", serif', '#eef4ea');
    const fireflyCols = [
      '形容人在艱困的環境中',
      '勤奮讀書。',
      '每年四～五月是雙溪',
      '螢火蟲季，昔日學子沿',
      '著古道夜行求學。'
    ];
    drawVerticalTextColumns(ctx, fireflyCols, 245, 58, 34, 23, '500 17px "Noto Serif TC", serif', '#d7e3d4');

    // 中段：茶花莊、莊貢生古厝、土地公廟與油桐花小徑
    ctx.fillStyle = '#2d6e4e';
    ctx.fillRect(620, 0, 928, 420);
    ctx.fillStyle = '#4e9665';
    ctx.beginPath();
    ctx.arc(1080, 420, 380, Math.PI, 0);
    ctx.fill();

    // 桐花小徑
    ctx.strokeStyle = '#d8e3d5';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(640, 200);
    ctx.quadraticCurveTo(1080, 260, 1520, 190);
    ctx.stroke();

    // 油桐花點綴
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 65; i++) {
      const fx = 650 + Math.random() * 860;
      const fy = 155 + Math.random() * 110;
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fff8dc';
    ctx.font = 'bold 22px "Noto Serif TC", serif';
    ctx.fillText('莊貢生古厝　　茶花莊　　土地公廟　　清水坑', 820, 200);

    // 前段（右，靠近入口）：梅竹古道
    const rightGrad = ctx.createLinearGradient(1548, 0, 2048, 0);
    rightGrad.addColorStop(0, '#7ba87a');
    rightGrad.addColorStop(1, '#9fc29b');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(1548, 0, 500, 420);

    ctx.strokeStyle = 'rgba(30, 75, 42, 0.35)';
    ctx.lineWidth = 10;
    for (let x = 1580; x < 2020; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 420);
      ctx.lineTo(x + 25, 0);
      ctx.stroke();
    }

    drawVerticalTextColumns(ctx, ['梅竹古道'], 1990, 75, 40, 46, 'bold 34px "Noto Serif TC", serif', '#132015');
    const meizhuCols = [
      '梅竹坪，舊稱蔴竹坑，因本地',
      '蔴竹茂盛而得名。',
      '清治時期雙溪地區文風鼎盛，',
      '當地秀才莊廷燦及其弟莊燦彰',
      '曾在此設立「梅竹園私塾」，',
      '供人就學，後人便稱此小徑為',
      '梅竹古道。'
    ];
    drawVerticalTextColumns(ctx, meizhuCols, 1920, 46, 36, 22, '600 17px "Noto Serif TC", serif', '#162118');

    return new THREE.CanvasTexture(canvas);
  }

  return {
    createStoneTexture,
    createCarvedStoneTextTexture,
    createCanopySignTexture,
    createEightImmortalsBannerTexture,
    createStructureBoardTexture,
    createLeftFrontBoardTexture,
    createRightFrontBoardTexture,
    createMapBoardTexture,
    createGratitudePlaqueTexture,
    createBlessingCardTexture,
    createWallMuralTexture,
    createTileFloorTexture,
    createDeityRobeTexture,
    createRidgeCarvingTexture,
    createLeftCanopyBannerTexture,
    createBackCanopyBannerTexture,
    createRightCanopyBannerTexture
  };
})();
