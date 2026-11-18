// 蔴竹坑福德祠 3D 場景建構引擎 (Three.js)
window.Temple3D = (function () {
  let scene, camera, renderer, controls;
  let sunLight, ambientLight, hemiLight, lotusLight, canopyLight, furnaceLight;
  let smokeParticles = [];
  let blessingCards = [];
  let cardRackGroup = null;
  let isNightMode = false;
  let onCardClickCallback = null;
  let offeringsMap = {};
  let offeringsRoot = null;
  let bweiAnim = {
    active: false,
    group: null,
    left: null,
    right: null,
    progress: 0,
    duration: 0.95,
    leftEndRotX: 0,
    rightEndRotX: Math.PI
  };

  // 平滑鏡頭轉場狀態
  let camAnim = {
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
    duration: 1.2
  };

  // 6 個導覽熱點與預設視角
  const SPOTS = [
    {
      id: 0,
      title: '蔴竹坑福德祠全景',
      icon: 'fa-eye',
      tags: ['新北市立雙溪高中', '光緒十八年', '校園古蹟'],
      hotspotPos: new THREE.Vector3(0, 2.95, 2.4),
      camPos: new THREE.Vector3(0.4, 2.25, 6.2),
      target: new THREE.Vector3(0, 1.15, 0.3),
      html: `
        <p>座落於<strong>新北市立雙溪高中</strong>校園內的「蔴竹坑福德祠」，建於清光緒十八年（西元 1892 年）壬辰冬月，坐東向西，是一座見證北臺灣開墾史與雙溪校園發展的百年石造小土地公廟。</p>
        <p>民國 84 年土地徵收時，學校將其保留於校園中妥善維護。外圍半圓弧綠色遮雨棚由營造商陳朝松先生捐贈，正面懸掛「蔴竹坑福德祠」看板，內懸「金玉滿堂」八仙彩。</p>
      `
    },
    {
      id: 1,
      title: '七面式石造小土地公廟',
      icon: 'fa-archway',
      tags: ['堂寬 105cm', '祠高 164cm', '殿深 99cm'],
      hotspotPos: new THREE.Vector3(0, 1.85, 0),
      camPos: new THREE.Vector3(1.55, 1.45, 2.15),
      target: new THREE.Vector3(0, 0.95, 0),
      html: `
        <p>本廟採閩式建築玄關縮小之<strong>「七面式」石造結構</strong>，由兩層石板底座、正立面、左右立面、後立面及前後屋簷與燕尾屋脊構成。</p>
        <p>前屋簷中軸微凹象徵「微笑朝天」，屋脊兩端如燕尾翹起，廟身披掛紅綵帶，門柱刻有對聯：</p>
        <div class="info-quote">橫批：福德祠<br/>上聯：福添沾厚澤　下聯：神佑慶長春</div>
      `
    },
    {
      id: 2,
      title: '神龕內部：土地公與土地婆',
      icon: 'fa-place-of-worship',
      tags: ['石雕神像', '福德正神', '紅蓮花燈'],
      hotspotPos: new THREE.Vector3(0, 0.95, 0.35),
      camPos: new THREE.Vector3(0.05, 0.92, 1.48),
      target: new THREE.Vector3(0, 0.78, -0.1),
      html: `
        <p>神龕內同時供奉兩尊百年<strong>石雕神像</strong>：右側為頭戴官帽、手持拐杖的土地公；左側為頸戴珠串、雙手捧盤的土地婆，兩尊神像皆披著橘紅神袍，慈祥守護學子。</p>
        <p>背牆陰刻「福德正神」四字，龕內設有石香爐、紅色蓮花長明燈、燭台與三只紅色聖杯，廟口兩側紅花瓶插著翠綠萬年青。</p>
      `
    },
    {
      id: 3,
      title: '天公爐與「旺旺」祈晴供桌',
      icon: 'fa-fire-flame-curved',
      tags: ['雙龍耳金鼎', '賴含笑女士捐贈', '運動會祈晴'],
      hotspotPos: new THREE.Vector3(0, 1.35, 2.05),
      camPos: new THREE.Vector3(-1.35, 1.5, 3.35),
      target: new THREE.Vector3(0, 0.75, 1.65),
      html: `
        <p>廟前金色三足雙龍耳<strong>天公爐（金鼎）</strong>繫有紅綵，由校內清潔工賴含笑女士發願捐贈，香火終年不斷。</p>
        <p>後方貼著白色磁磚的供桌上，擺放著雙溪高中特有的<strong>「旺旺」餅乾</strong>！每逢學校運動會或大型活動，承辦師生必以旺旺祭拜祈求天晴，往往原本陰雨的天氣在活動當天便萬里無雲。</p>
      `
    },
    {
      id: 4,
      title: 'SXHS 藍色水滴祈福卡牆',
      icon: 'fa-tags',
      tags: ['學子心願', '建築構造圖', '考試順利'],
      hotspotPos: new THREE.Vector3(-1.55, 1.7, 1.5),
      camPos: new THREE.Vector3(-0.15, 1.45, 2.25),
      target: new THREE.Vector3(-1.55, 1.3, 1.45),
      html: `
        <p>遮雨棚左側黃框黑網架上，掛滿印有可愛微笑 Q 版土地公與「<strong>SXHS 蔴竹坑福德祠</strong>」字樣的藍色水滴形壓克力祈福卡。</p>
        <p>無論是段考、大考或是生活心願，雙中師生常來此誠心祈禱並掛上祈福卡。上方內壁還設有「七面式石造小土地公廟建築構造」解說圖。</p>
      `
    },
    {
      id: 5,
      title: '感恩的心碑文與環保金爐',
      icon: 'fa-scroll',
      tags: ['一甲子的守護', '章慶名先生捐金爐', '校園壁畫'],
      hotspotPos: new THREE.Vector3(1.06, 1.48, -0.58),
      camPos: new THREE.Vector3(2.15, 1.38, -1.95),
      target: new THREE.Vector3(1.06, 0.98, -0.58),
      html: `
        <p>廟右後方立有「<strong>感恩的心—一甲子的守護－雙中土地公</strong>」不鏽鋼解說碑（民國 95 年 6 月立誌），詳細記載蔴竹坑福德祠的歷史與校園奇聞。</p>
        <p>右側校舍旁設有家長章慶名先生捐贈的不鏽鋼環保金爐、磨石子長椅，以及牆面上描繪土地公慈祥庇佑雙中學子的彩色壁畫。</p>
      `
    }
  ];

  function init(container, onLoaded) {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fd0f2);
    scene.fog = new THREE.FogExp2(0x9fd0f2, 0.016);

    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 160);
    camera.position.copy(SPOTS[0].camPos);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.copy(SPOTS[0].target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 0.8;
    controls.maxDistance = 16;

    // 玩家手動操作時取消自動飛鏡
    controls.addEventListener('start', () => {
      camAnim.active = false;
    });

    setupLights();
    buildEnvironment();
    buildTemple();
    buildCanopy();
    buildOfferingsAndBurner();
    buildBlessingRack();
    buildPlaqueAndFurnace();
    buildSmokeParticles();

    window.addEventListener('resize', onResize);

    // 點擊 3D 祈福卡時放大檢視願望
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };
    renderer.domElement.addEventListener('pointerdown', (e) => {
      downPos = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6 || !onCardClickCallback) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(blessingCards, false);
      if (hits.length > 0) {
        const hitCard = hits[0].object;
        const slotIdx = hitCard.userData.slotIndex;
        if (typeof slotIdx === 'number') {
          const slots = cardRackGroup.userData.cardSlots || [];
          const s = slots[slotIdx];
          if (s) onCardClickCallback(slotIdx, { index: s.index, wishText: s.wishText, isUser: s.isUser });
        }
      }
    });

    if (onLoaded) setTimeout(onLoaded, 450);
    animate();
  }

  function setupLights() {
    hemiLight = new THREE.HemisphereLight(0xdff2ff, 0x5c6e4e, 0.75);
    scene.add(hemiLight);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfff5e0, 1.35);
    sunLight.position.set(8, 12, 7);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 35;
    const d = 9;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 神龕內部紅色蓮花燈
    lotusLight = new THREE.PointLight(0xff4422, 1.2, 2.2);
    lotusLight.position.set(-0.19, 0.76, -0.05);
    scene.add(lotusLight);

    // 遮雨棚下方暖白照明燈（夜間開啟）
    canopyLight = new THREE.PointLight(0xffe6b3, 0.0, 8);
    canopyLight.position.set(0, 2.5, 0.8);
    scene.add(canopyLight);

    // 金爐暖光
    furnaceLight = new THREE.PointLight(0xff7722, 0.0, 3);
    furnaceLight.position.set(2.55, 0.85, -1.1);
    scene.add(furnaceLight);
  }

  function buildEnvironment() {
    const group = new THREE.Group();

    // 1. 校園綠色 PU 鋪面基底
    const puGeo = new THREE.PlaneGeometry(45, 45);
    const puMat = new THREE.MeshStandardMaterial({ color: 0x3b6e52, roughness: 0.85 });
    const puGround = new THREE.Mesh(puGeo, puMat);
    puGround.rotation.x = -Math.PI / 2;
    puGround.receiveShadow = true;
    group.add(puGround);

    // 2. 廟前白色正方形磁磚參拜區
    const tileTex = TempleTextures.createTileFloorTexture();
    const tileGeo = new THREE.BoxGeometry(2.7, 0.03, 3.6);
    const tileMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.55 });
    const tileFloor = new THREE.Mesh(tileGeo, tileMat);
    tileFloor.position.set(0, 0.015, 1.45);
    tileFloor.receiveShadow = true;
    group.add(tileFloor);

    // 洗石子邊框平台
    const concreteGeo = new THREE.BoxGeometry(3.3, 0.025, 4.7);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x7b7d7a, roughness: 0.9 });
    const concreteBase = new THREE.Mesh(concreteGeo, concreteMat);
    concreteBase.position.set(0, 0.01, 1.0);
    concreteBase.receiveShadow = true;
    group.add(concreteBase);

    // 3. 右側紅灰方磚步道與校舍牆面
    const rightTileGeo = new THREE.BoxGeometry(3.2, 0.02, 7.5);
    const rightTileMat = new THREE.MeshStandardMaterial({ color: 0x878b8e, roughness: 0.8 });
    const rightPath = new THREE.Mesh(rightTileGeo, rightTileMat);
    rightPath.position.set(3.25, 0.01, 0.5);
    rightPath.receiveShadow = true;
    group.add(rightPath);

    // 右側校舍建築牆
    const wallGeo = new THREE.BoxGeometry(0.4, 3.2, 8.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd0d4d6, roughness: 0.8 });
    const schoolWall = new THREE.Mesh(wallGeo, wallMat);
    schoolWall.position.set(3.9, 1.6, 0.8);
    schoolWall.castShadow = true;
    schoolWall.receiveShadow = true;
    group.add(schoolWall);

    // 牆上百葉窗
    const louverMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.3, roughness: 0.6 });
    for (let z = -1.6; z <= 0.6; z += 1.1) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.9), louverMat);
      win.position.set(3.68, 1.9, z);
      group.add(win);
    }

    // 校舍牆面土地公與學童彩繪壁畫
    const muralTex = TempleTextures.createWallMuralTexture();
    const muralGeo = new THREE.PlaneGeometry(3.4, 1.7);
    const muralMat = new THREE.MeshStandardMaterial({ map: muralTex, roughness: 0.7 });
    const mural = new THREE.Mesh(muralGeo, muralMat);
    mural.position.set(3.68, 1.05, 2.75);
    mural.rotation.y = -Math.PI / 2;
    group.add(mural);

    // 校舍旁磨石子長條石椅
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x5c5f63, roughness: 0.7 });
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 1.45), benchMat);
    benchTop.position.set(3.35, 0.44, 1.15);
    benchTop.castShadow = true;
    group.add(benchTop);
    [-0.5, 0.5].forEach((dz) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.2), benchMat);
      leg.position.set(3.35, 0.2, 1.15 + dz);
      leg.castShadow = true;
      group.add(leg);
    });

    // 4. 後方柏油小路與風雨籃球場/操場意象
    const roadGeo = new THREE.PlaneGeometry(36, 3.2);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x45494e, roughness: 0.95 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.008, -3.2);
    road.receiveShadow = true;
    group.add(road);

    // 風雨操場藍色與綠色地坪 + 紅色跑道
    const courtGeo = new THREE.PlaneGeometry(16, 10);
    const courtMat = new THREE.MeshStandardMaterial({ color: 0x2674b5, roughness: 0.75 });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.set(-7.5, 0.012, -10.5);
    group.add(court);

    const trackGeo = new THREE.PlaneGeometry(28, 3.5);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xb84b43, roughness: 0.85 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(-4, 0.01, -17.5);
    group.add(track);

    // 風雨操場藍色柱子保護墊
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0b66c3, roughness: 0.5 });
    [-3.5, -7.5, -11.5].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 2.2, 16), pillarMat);
      p.position.set(px, 1.1, -6.2);
      p.castShadow = true;
      group.add(p);
    });

    // 5. 廟旁九芎樹與遠處大樹
    buildTree(group, -2.55, -2.15, 1.15);
    buildTree(group, 4.5, -4.5, 1.3);
    buildTree(group, -6.5, -3.8, 1.0);

    // 6. 遠處雙溪翠綠群山天際線
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3f, roughness: 1 });
    [
      { x: -18, z: -38, r: 16, h: 11 },
      { x: 0, z: -42, r: 20, h: 14 },
      { x: 20, z: -36, r: 15, h: 10 }
    ].forEach((hill) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(hill.r, hill.h, 12), hillMat);
      cone.position.set(hill.x, hill.h * 0.45, hill.z);
      group.add(cone);
    });

    scene.add(group);
  }

  function buildTree(parent, x, z, scale = 1) {
    const tree = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7c634b, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f7d3a, roughness: 0.8 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.18 * scale, 2.6 * scale, 8), trunkMat);
    trunk.position.y = 1.3 * scale;
    trunk.rotation.z = 0.08;
    trunk.castShadow = true;
    tree.add(trunk);

    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 1.6 * scale, 7), trunkMat);
    branch.position.set(-0.35 * scale, 2.3 * scale, 0);
    branch.rotation.z = 0.55;
    branch.castShadow = true;
    tree.add(branch);

    const foliageOffsets = [
      [0, 3.2, 0, 1.15],
      [-0.85, 2.85, 0.3, 0.85],
      [0.75, 2.95, -0.25, 0.8],
      [0.15, 3.65, 0.2, 0.75]
    ];
    foliageOffsets.forEach(([fx, fy, fz, fr]) => {
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(fr * scale, 1), leafMat);
      canopy.position.set(fx * scale, fy * scale, fz * scale);
      canopy.castShadow = true;
      tree.add(canopy);
    });

    tree.position.set(x, 0, z);
    parent.add(tree);
  }

  // 核心主角：光緒十八年七面式石造小土地公廟
  function buildTemple() {
    const temple = new THREE.Group();
    const stoneTex = TempleTextures.createStoneTexture('#9c907e', 0.25);
    const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92, metalness: 0.02 });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x5c5347, roughness: 0.95 });

    // 1. 兩層石板底座
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.12, 1.28), stoneMat);
    base1.position.set(0, 0.08, 0);
    base1.castShadow = true;
    base1.receiveShadow = true;
    temple.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.10, 1.12), stoneMat);
    base2.position.set(0, 0.19, 0);
    base2.castShadow = true;
    base2.receiveShadow = true;
    temple.add(base2);

    // 2. 廟身主體（寬 1.05, 深 0.99, 牆高 0.95 -> y: 0.24 ~ 1.19）
    // 背牆
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 0.16), stoneMat);
    backWall.position.set(0, 0.715, -0.415);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    temple.add(backWall);

    // 左側牆
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.99), stoneMat);
    leftWall.position.set(-0.435, 0.715, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    temple.add(leftWall);

    // 右側牆
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.99), stoneMat);
    rightWall.position.set(0.435, 0.715, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    temple.add(rightWall);

    // 神龕地板（含前伸小石台）
    const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.85), stoneMat);
    floorSlab.position.set(0, 0.32, 0.04);
    floorSlab.receiveShadow = true;
    temple.add(floorSlab);

    // 正立面門楣「福德祠」
    const lintelTex = TempleTextures.createCarvedStoneTextTexture('祠 德 福', 320, 96, 46, false);
    const lintelMat = new THREE.MeshStandardMaterial({ map: lintelTex, roughness: 0.88 });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.22, 0.18), lintelMat);
    lintel.position.set(0, 1.08, 0.41);
    lintel.castShadow = true;
    temple.add(lintel);

    // 右聯柱「福添沾厚澤」
    const rightPillarTex = TempleTextures.createCarvedStoneTextTexture('福添沾厚澤', 128, 384, 42, true);
    const rightPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.73, 0.18),
      new THREE.MeshStandardMaterial({ map: rightPillarTex, roughness: 0.88 })
    );
    rightPillar.position.set(0.415, 0.605, 0.41);
    rightPillar.castShadow = true;
    temple.add(rightPillar);

    // 左聯柱「神佑慶長春」
    const leftPillarTex = TempleTextures.createCarvedStoneTextTexture('神佑慶長春', 128, 384, 42, true);
    const leftPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.73, 0.18),
      new THREE.MeshStandardMaterial({ map: leftPillarTex, roughness: 0.88 })
    );
    leftPillar.position.set(-0.415, 0.605, 0.41);
    leftPillar.castShadow = true;
    temple.add(leftPillar);

    // 外側多一片石塊（右：光緒壬辰年冬月置 / 左：蔴竹坑庄眾弟子立）
    const yearTex = TempleTextures.createCarvedStoneTextTexture('光緒壬辰年冬月置', 96, 384, 28, true, '#8d8270', 'rgba(65, 52, 42, 0.85)');
    const yearSlab = new THREE.Mesh(
      new THREE.PlaneGeometry(0.11, 0.68),
      new THREE.MeshStandardMaterial({ map: yearTex, roughness: 0.9 })
    );
    yearSlab.position.set(0.495, 0.605, 0.502);
    temple.add(yearSlab);

    const donorTex = TempleTextures.createCarvedStoneTextTexture('蔴竹坑庄眾弟子立', 96, 384, 28, true, '#8d8270', 'rgba(65, 52, 42, 0.85)');
    const donorSlab = new THREE.Mesh(
      new THREE.PlaneGeometry(0.11, 0.68),
      new THREE.MeshStandardMaterial({ map: donorTex, roughness: 0.9 })
    );
    donorSlab.position.set(-0.495, 0.605, 0.502);
    temple.add(donorSlab);

    // 神龕背牆內刻「福德正神」
    const innerSignTex = TempleTextures.createCarvedStoneTextTexture('福德正神', 160, 320, 40, true, '#4a4339');
    const innerSign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.56),
      new THREE.MeshStandardMaterial({ map: innerSignTex, roughness: 0.9 })
    );
    innerSign.position.set(0, 0.72, -0.325);
    temple.add(innerSign);

    // 3. 兩尊精細石雕神像：土地婆(左) 與 土地公(右)
    function createDeity(isLandlord) {
      const deity = new THREE.Group();
      const carvedStoneMat = new THREE.MeshStandardMaterial({
        color: 0x35373a,
        roughness: 0.48,
        metalness: 0.12
      });
      const robeTex = TempleTextures.createDeityRobeTexture(isLandlord);
      const robeFrontMat = new THREE.MeshStandardMaterial({
        map: robeTex,
        roughness: 0.45,
        metalness: 0.1
      });

      // 石雕寶座
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.065, 0.18), carvedStoneMat);
      seat.position.y = 0.0325;
      deity.add(seat);

      // 雙腳鞋履
      [-0.042, 0.042].forEach((fx) => {
        const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), carvedStoneMat);
        shoe.scale.set(0.9, 0.6, 1.4);
        shoe.position.set(fx, 0.075, 0.065);
        deity.add(shoe);
      });

      // 坐姿軀幹與官服前擺
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.102, 0.21, 14), carvedStoneMat);
      body.position.y = 0.175;
      deity.add(body);

      const robeFront = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.19), robeFrontMat);
      robeFront.position.set(0, 0.165, 0.088);
      robeFront.rotation.x = -0.1;
      deity.add(robeFront);

      // 寬袖手臂
      [-1, 1].forEach((dir) => {
        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.12, 10), carvedStoneMat);
        sleeve.position.set(dir * 0.082, 0.195, 0.035);
        sleeve.rotation.z = dir * 0.35;
        sleeve.rotation.x = -0.45;
        deity.add(sleeve);
      });

      // 橘紅滾金邊神袍披風 + 胸前紅結
      const capeMat = new THREE.MeshStandardMaterial({ color: 0xc94228, roughness: 0.65, side: THREE.DoubleSide });
      const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xe6b44c, roughness: 0.35, metalness: 0.4 });
      const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.114, 0.185, 14, 1, true, 0.55, Math.PI * 1.45), capeMat);
      cape.position.y = 0.175;
      cape.rotation.y = Math.PI * 0.78;
      deity.add(cape);

      const collarTrim = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.005, 6, 16), goldTrimMat);
      collarTrim.position.set(0, 0.268, 0.015);
      collarTrim.rotation.x = Math.PI / 2 + 0.15;
      deity.add(collarTrim);

      const redBow = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd92121 }));
      redBow.position.set(0, 0.262, 0.072);
      deity.add(redBow);

      // 頭部與五官
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.325, 0.01);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 16), carvedStoneMat);
      head.scale.set(0.95, 1.05, 0.95);
      headGroup.add(head);

      // 雙耳
      [-1, 1].forEach((dir) => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), carvedStoneMat);
        ear.scale.set(0.5, 1.2, 0.7);
        ear.position.set(dir * 0.052, -0.004, 0);
        headGroup.add(ear);
      });

      // 雙眼、鼻樑與慈祥嘴唇
      const featureMat = new THREE.MeshStandardMaterial({ color: 0x222326, roughness: 0.6 });
      [-0.018, 0.018].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), featureMat);
        eye.position.set(ex, 0.008, 0.049);
        headGroup.add(eye);
      });
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.018, 6), carvedStoneMat);
      nose.position.set(0, -0.003, 0.055);
      nose.rotation.x = 0.3;
      headGroup.add(nose);

      const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.01, 0.0025, 6, 10, Math.PI), featureMat);
      mouth.position.set(0, -0.018, 0.05);
      mouth.rotation.z = Math.PI;
      headGroup.add(mouth);

      deity.add(headGroup);

      if (isLandlord) {
        // 土地公：方形員外官帽 + 長鬍鬚 + 彎頭長拐杖
        const hatBase = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.042, 0.092), carvedStoneMat);
        hatBase.position.set(0, 0.382, 0.008);
        deity.add(hatBase);

        const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.022, 0.075), carvedStoneMat);
        hatTop.position.set(0, 0.405, 0.008);
        deity.add(hatTop);

        // 鬍鬚
        const beard = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.075, 8), carvedStoneMat);
        beard.position.set(0, 0.258, 0.062);
        beard.rotation.x = Math.PI;
        beard.scale.set(1.1, 1, 0.5);
        deity.add(beard);

        // 彎頭長拐杖
        const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.31, 8), carvedStoneMat);
        staffShaft.position.set(-0.075, 0.2, 0.075);
        staffShaft.rotation.z = 0.14;
        deity.add(staffShaft);

        const staffHook = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.007, 8, 12, Math.PI), carvedStoneMat);
        staffHook.position.set(-0.088, 0.352, 0.075);
        staffHook.rotation.z = 0.14;
        deity.add(staffHook);
      } else {
        // 土地婆：盤髮髮髻 + 一顆顆珍珠項鍊 + 雙手捧壽龜盤
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), carvedStoneMat);
        bun.position.set(0, 0.375, -0.02);
        deity.add(bun);

        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xf7eed7, roughness: 0.2, metalness: 0.1 });
        for (let i = -5; i <= 5; i++) {
          const ang = (i / 5) * 0.95;
          const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.0048, 8, 8), pearlMat);
          pearl.position.set(
            Math.sin(ang) * 0.056,
            0.255 - Math.cos(ang) * 0.022,
            0.052 + Math.cos(ang) * 0.022
          );
          deity.add(pearl);
        }

        // 雙手捧著橢圓形壽龜盤
        const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.048, 0.016, 14), carvedStoneMat);
        tray.scale.set(1.25, 1, 0.85);
        tray.position.set(0, 0.17, 0.095);
        deity.add(tray);

        const turtleCake = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), carvedStoneMat);
        turtleCake.scale.set(1.25, 0.45, 0.85);
        turtleCake.position.set(0, 0.184, 0.095);
        deity.add(turtleCake);
      }
      return deity;
    }

    const landLady = createDeity(false);
    landLady.position.set(-0.14, 0.4, -0.18);
    temple.add(landLady);

    const landLord = createDeity(true);
    landLord.position.set(0.14, 0.4, -0.18);
    temple.add(landLord);

    // 4. 神龕內小石香爐 + 紅香 + 紅色蓮花燈 + 三只紅聖杯
    const smallPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.09, 14),
      new THREE.MeshStandardMaterial({ color: 0x706c64, roughness: 0.6, metalness: 0.2 })
    );
    smallPot.position.set(0, 0.445, 0.03);
    temple.add(smallPot);

    // 小紅香
    const incMat = new THREE.MeshBasicMaterial({ color: 0xd93829 });
    [-0.02, 0, 0.02].forEach((ix) => {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.11, 5), incMat);
      stick.position.set(ix, 0.52, 0.03);
      stick.rotation.z = ix * 2;
      temple.add(stick);
    });

    // 紅色蓮花燈（左右對稱：土地婆前方與土地公前方各一盞）
    const lotusBulbMat = new THREE.MeshStandardMaterial({
      color: 0xff2200,
      emissive: 0xff3300,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const lotusBaseMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.7, roughness: 0.3 });
    [-0.22, 0.22].forEach((lx) => {
      const lotusGroup = new THREE.Group();
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.032, 0.08, 10), lotusBaseMat);
      lotusBase.position.y = 0.04;
      lotusGroup.add(lotusBase);

      const lotusBulb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), lotusBulbMat);
      lotusBulb.scale.y = 1.3;
      lotusBulb.position.y = 0.11;
      lotusGroup.add(lotusBulb);

      lotusGroup.position.set(lx, 0.4, -0.02);
      temple.add(lotusGroup);
    });

    // 三只紅色聖杯
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xd12621, roughness: 0.3 });
    [-0.08, 0, 0.08].forEach((cx) => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.038, 10), cupMat);
      cup.position.set(cx, 0.42, 0.24);
      temple.add(cup);
    });

    // 5. 廟前兩側紅花瓶與萬年青
    const vaseMat = new THREE.MeshStandardMaterial({ color: 0xb51d38, roughness: 0.25 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x6ea832, roughness: 0.6 });
    [-0.36, 0.36].forEach((vx) => {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.18, 12), vaseMat);
      vase.position.set(vx, 0.33, 0.56);
      vase.castShadow = true;
      temple.add(vase);

      for (let b = 0; b < 3; b++) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.32, 6), leafMat);
        stem.position.set(vx + (b - 1) * 0.015, 0.52, 0.56);
        stem.rotation.z = (b - 1) * 0.22;
        temple.add(stem);
      }
    });

    // 6. 七面式屋頂與連貫弧形燕尾屋脊
    const roofGroup = new THREE.Group();
    const ridgeCarveTex = TempleTextures.createRidgeCarvingTexture();
    const ridgeMat = new THREE.MeshStandardMaterial({ map: ridgeCarveTex, roughness: 0.88 });

    // 輔助函式：建立中軸微凹（微笑朝天）的屋頂斜坡板
    function createCurvedRoofSlope(zSign) {
      const segsX = 16;
      const geo = new THREE.BoxGeometry(1.24, 0.085, 0.72, segsX, 1, 1);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        // 兩端略微上揚、中軸下凹（微笑弧度）
        const curveY = 0.055 * (vx * vx);
        pos.setY(i, pos.getY(i) + curveY);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, stoneMat);
      mesh.position.set(0, 1.31, zSign * 0.29);
      mesh.rotation.x = zSign * 0.43;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    // 實心三角形石造山牆（封閉左右兩側牆頂與屋頂間的三角形空隙，兩邊皆不鏤空）
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-0.495, 1.18);
    gableShape.lineTo(0.495, 1.18);
    gableShape.lineTo(0, 1.44);
    gableShape.closePath();

    const gableGeo = new THREE.ExtrudeGeometry(gableShape, {
      depth: 1.05,
      bevelEnabled: false
    });
    const gableMesh = new THREE.Mesh(gableGeo, stoneMat);
    gableMesh.rotation.y = Math.PI / 2;
    gableMesh.position.set(-0.525, 0, 0);
    gableMesh.castShadow = true;
    gableMesh.receiveShadow = true;
    roofGroup.add(gableMesh);

    roofGroup.add(createCurvedRoofSlope(1));
    roofGroup.add(createCurvedRoofSlope(-1));

    // 前屋簷雙數石雕筒瓦楞（10條竹節狀瓦楞，左右各5條對稱）
    for (let i = -4.5; i <= 4.5; i += 1) {
      const rx = i * 0.122;
      const curveY = 0.055 * (rx * rx);
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.68, 8), stoneMat);
      rib.rotation.x = Math.PI / 2 + 0.43;
      rib.position.set(rx, 1.345 + curveY, 0.30);
      rib.castShadow = true;
      roofGroup.add(rib);
    }

    // 連貫弧形燕尾屋脊（中軸低、兩端向上平滑彎曲翹起）
    const ridgeGeo = new THREE.BoxGeometry(1.38, 0.23, 0.13, 24, 1, 1);
    const rPos = ridgeGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      const vx = rPos.getX(i);
      const vy = rPos.getY(i);
      // 拋物線翹起，越靠近兩端越高且頂端略尖
      const lift = 0.42 * Math.pow(Math.abs(vx), 2.1);
      const taper = Math.abs(vx) > 0.52 ? (vy > 0 ? 0.03 : 0) : 0;
      rPos.setY(i, vy + lift + taper);
    }
    ridgeGeo.computeVertexNormals();

    const swallowtailRidge = new THREE.Mesh(ridgeGeo, [
      stoneMat, stoneMat, stoneMat, stoneMat, ridgeMat, ridgeMat
    ]);
    swallowtailRidge.position.set(0, 1.48, 0);
    swallowtailRidge.castShadow = true;
    roofGroup.add(swallowtailRidge);

    // 7. 廟頂屋脊下方披掛的鮮紅綵帶
    const redClothMat = new THREE.MeshStandardMaterial({ color: 0xd61e1e, roughness: 0.72, side: THREE.DoubleSide });
    const clothBand = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.13, 0.46), redClothMat);
    clothBand.position.set(0, 1.39, 0.02);
    roofGroup.add(clothBand);

    // 右側垂墜紅布結
    const clothDrop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.22), redClothMat);
    clothDrop.position.set(0.56, 1.06, 0.05);
    clothDrop.rotation.z = -0.08;
    roofGroup.add(clothDrop);

    temple.add(roofGroup);
    scene.add(temple);
  }

  // 圓弧拱頂綠色遮雨棚與文化看板
  function buildCanopy() {
    const canopy = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xbac2c7, metalness: 0.75, roughness: 0.28 });

    // 四根不鏽鋼立柱
    const pillarCoords = [
      [-1.55, -0.9],
      [1.55, -0.9],
      [-1.55, 2.35],
      [1.55, 2.35]
    ];
    pillarCoords.forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 0.08), steelMat);
      col.position.set(px, 1.075, pz);
      col.castShadow = true;
      canopy.add(col);
    });

    // 計算遮雨棚拱頂橫切面曲線點（x: -1.58 ~ +1.58, y: 2.02 往上圓弧至 2.98）
    function getArchPoint(t) {
      // t in [0, 1] 從左到右
      const angle = (1 - t) * Math.PI; // PI -> 0
      const x = Math.cos(angle) * 1.58;
      // 使用超橢圓/圓角拱形公式，讓兩側先垂直向上圓弧轉彎，頂部微圓拱
      const y = 2.02 + Math.pow(Math.sin(angle), 0.58) * 0.96;
      return { x, y };
    }

    // 建構半透明綠色圓拱採光罩
    const segU = 28;
    const zStart = -0.96;
    const zEnd = 2.48;
    const roofGeo = new THREE.PlaneGeometry(1, 1, segU, 1);
    const rPos = roofGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      const u = rPos.getX(i) + 0.5; // 0..1
      const v = rPos.getY(i) + 0.5; // 0..1
      const pt = getArchPoint(u);
      const z = zStart + v * (zEnd - zStart);
      rPos.setXYZ(i, pt.x, pt.y, z);
    }
    roofGeo.computeVertexNormals();

    const roofMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b8c6e,
      transparent: true,
      opacity: 0.44,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const archRoof = new THREE.Mesh(roofGeo, roofMat);
    canopy.add(archRoof);

    // 遮雨棚鋼骨橫樑肋條（前後及中間共 5 道）
    [-0.92, -0.1, 0.72, 1.54, 2.38].forEach((rz) => {
      const pts = [];
      for (let s = 0; s <= 24; s++) {
        const pt = getArchPoint(s / 24);
        pts.push(new THREE.Vector3(pt.x, pt.y - 0.015, rz));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 6, false), steelMat);
      canopy.add(tube);
    });

    // 輔助函式：建立上緣貼合遮雨棚拱頂弧線、下緣水平的看板幾何體（使用平面投影 UV，使標題文字端正不隨弧形歪斜）
    function createArchTopPanelGeometry(yBottom, zPos) {
      const geo = new THREE.PlaneGeometry(1, 1, 28, 1);
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      const xLeft = getArchPoint(0).x;
      const xRight = getArchPoint(1).x;
      const xSpan = xRight - xLeft || 1;
      const yMaxArch = getArchPoint(0.5).y + 0.01;
      const ySpan = Math.max(0.1, yMaxArch - yBottom);
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) + 0.5;
        const v = pos.getY(i) + 0.5;
        const pt = getArchPoint(u);
        const yTop = Math.max(yBottom + 0.06, pt.y + 0.01);
        const y = yBottom + v * (yTop - yBottom);
        pos.setXYZ(i, pt.x, y, zPos);
        uv.setXY(i, (pt.x - xLeft) / xSpan, (y - yBottom) / ySpan);
      }
      geo.computeVertexNormals();
      return geo;
    }

    // 正面「蔴竹坑福德祠」上緣弧形看板（貼合遮雨棚拱頂曲線）
    const signTex = TempleTextures.createCanopySignTexture();
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, side: THREE.DoubleSide });
    const signBoard = new THREE.Mesh(createArchTopPanelGeometry(2.24, 2.47), signMat);
    canopy.add(signBoard);

    // 棚內懸掛「金玉滿堂」紅色八仙彩
    const bannerTex = TempleTextures.createEightImmortalsBannerTexture();
    const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.7, side: THREE.DoubleSide });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.46), bannerMat);
    banner.position.set(0, 2.28, 1.05);
    canopy.add(banner);

    // 輔助函式：將連貫內貼海報貼合在左/右圓弧內壁上（t 範圍從側緣往上圓弧轉入）
    function createCurvedSideBanner(tex, isLeft) {
      const bGeo = new THREE.PlaneGeometry(1, 1, 16, 12);
      const bPos = bGeo.attributes.position;
      for (let i = 0; i < bPos.count; i++) {
        const u = bPos.getX(i) + 0.5; // 0..1 沿 Z 軸
        const v = bPos.getY(i) + 0.5; // 0..1 沿圓弧往上
        const z = isLeft ? (zEnd - 0.1 - u * 3.25) : (zStart + 0.05 + u * 3.25);
        const tArc = isLeft ? (v * 0.22) : (1.0 - v * 0.22);
        const pt = getArchPoint(tArc);
        const inset = isLeft ? 0.04 : -0.04;
        bPos.setXYZ(i, pt.x + inset, pt.y - 0.05, z);
      }
      bGeo.computeVertexNormals();
      return new THREE.Mesh(
        bGeo,
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, side: THREE.DoubleSide })
      );
    }

    // 左側弧形內壁（順序從前到後：臺灣千餘座土地公 -> 淡蘭古道上的土地公 -> 建築構造1~7）
    const leftBannerTex = TempleTextures.createLeftCanopyBannerTexture();
    canopy.add(createCurvedSideBanner(leftBannerTex, true));

    // 右側弧形內壁（順序從前到後：梅竹古道 -> 油桐花風景 -> 囊螢映雪）
    const rightBannerTex = TempleTextures.createRightCanopyBannerTexture();
    canopy.add(createCurvedSideBanner(rightBannerTex, false));

    // 後方橫樑內貼（上緣同樣貼合遮雨棚拱頂弧線）
    const backBannerTex = TempleTextures.createBackCanopyBannerTexture();
    const backBoard = new THREE.Mesh(
      createArchTopPanelGeometry(2.22, -0.90),
      new THREE.MeshStandardMaterial({ map: backBannerTex, roughness: 0.55, side: THREE.FrontSide })
    );
    canopy.add(backBoard);

    // 後方橫樑外側看板（從廟後方觀看顯示與正面相同的「蔴竹坑福德祠」標題字）
    const backBacking = new THREE.Mesh(
      createArchTopPanelGeometry(2.24, 0),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, side: THREE.FrontSide })
    );
    backBacking.position.z = -0.905;
    backBacking.rotation.y = Math.PI;
    canopy.add(backBacking);

    // 遮雨棚頂部中央圓形吸頂燈
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xe6e4dc, roughness: 0.4 })
    );
    lampBase.position.set(0, 2.95, 1.05);
    canopy.add(lampBase);

    const lampDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfff8e7, emissive: 0xffebaa, emissiveIntensity: 0.35 })
    );
    lampDome.position.set(0, 2.93, 1.05);
    canopy.add(lampDome);

    scene.add(canopy);
  }

  // 供桌、旺旺餅乾與金色三足雙龍耳天公爐
  function buildOfferingsAndBurner() {
    const group = new THREE.Group();

    // 1. 白色磁磚長方形供桌
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xebede8, roughness: 0.45 });
    const tableBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.36, 0.48), tableMat);
    tableBase.position.set(0, 0.18, 1.15);
    tableBase.castShadow = true;
    tableBase.receiveShadow = true;
    group.add(tableBase);

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.06, 0.54), tableMat);
    tableTop.position.set(0, 0.39, 1.15);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // 動態 3D 供品群組（預設擺放旺旺祈晴餅乾禮盒）
    offeringsRoot = new THREE.Group();
    group.add(offeringsRoot);
    setOffering('wang', true);

    // 供桌前方地面 3D 紅木雙筊群組
    bweiAnim.group = buildBweiPair3D();
    bweiAnim.group.position.set(0, 0.03, 1.7);
    bweiAnim.group.visible = false;
    group.add(bweiAnim.group);

    // 2. 金色三足雙龍耳天公爐
    const burner = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a938, metalness: 0.82, roughness: 0.25 });

    // 底座圓盤
    const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.06, 20), goldMat);
    bBase.position.y = 0.03;
    burner.add(bBase);

    // 三足
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3 + Math.PI / 6;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.45, 8), goldMat);
      leg.position.set(Math.cos(ang) * 0.14, 0.25, Math.sin(ang) * 0.14);
      leg.castShadow = true;
      burner.add(leg);
    }

    // 爐肚與爐口
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), goldMat);
    pot.scale.y = 0.88;
    pot.position.y = 0.58;
    pot.castShadow = true;
    burner.add(pot);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 10, 24), goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.74;
    burner.add(rim);

    // 爐內香灰
    const ash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x8c8a84, roughness: 1 })
    );
    ash.position.y = 0.73;
    burner.add(ash);

    // 雙龍耳（完整封閉圓環手把，兩端穩固嵌入爐肚不中斷）
    [-1, 1].forEach((dir) => {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.02, 12, 28, Math.PI * 2), goldMat);
      ear.position.set(dir * 0.18, 0.615, 0);
      ear.scale.set(1, 1.16, 1);
      ear.castShadow = true;
      burner.add(ear);
    });

    // 繫在天公爐上的紅綵帶結
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc91e1e, roughness: 0.7 });
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 8, 20), redMat);
    tie.rotation.x = Math.PI / 2;
    tie.position.y = 0.62;
    burner.add(tie);

    const ribbonTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.02), redMat);
    ribbonTail.position.set(0, 0.44, 0.21);
    ribbonTail.rotation.z = 0.15;
    burner.add(ribbonTail);

    // 天公爐插香
    const incMat = new THREE.MeshBasicMaterial({ color: 0xd93829 });
    for (let i = 0; i < 6; i++) {
      const inc = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.16, 5), incMat);
      inc.position.set((Math.random() - 0.5) * 0.12, 0.81, (Math.random() - 0.5) * 0.12);
      inc.rotation.z = (Math.random() - 0.5) * 0.25;
      burner.add(inc);
    }

    burner.position.set(0, 0.03, 2.05);
    group.add(burner);
    scene.add(group);
  }

  // 左側祈福卡黃框網架
  function buildBlessingRack() {
    cardRackGroup = new THREE.Group();
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xd9c241, roughness: 0.45 });
    const blackWireMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.7 });

    // 黃色外框橫桿（共 5 根，區分出 4 排掛卡空間）
    [0.50, 0.87, 1.24, 1.61, 1.98].forEach((y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.028, 1.92), yellowMat);
      bar.position.set(-1.55, y, 1.45);
      cardRackGroup.add(bar);
    });

    // 規劃整面祈福卡牆 4 排 × 15 欄 = 60 個掛卡槽位（四排皆可掛使用者祈福卡）
    const slotRows = [1.80, 1.43, 1.06, 0.69];
    const slotCols = [];
    for (let i = 0; i < 15; i++) {
      slotCols.push(0.61 + i * 0.12);
    }
    const cardSlots = [];
    let sIdx = 0;
    slotRows.forEach((ry, r) => {
      slotCols.forEach((rz, c) => {
        cardSlots.push({ index: sIdx++, row: r, col: c, y: ry, z: rz, card: null, isUser: false, wishText: '' });
      });
    });
    cardRackGroup.userData.cardSlots = cardSlots;
    cardRackGroup.userData.nextUserSlot = 0;

    // 預設掛上部分 SXHS 藍色水滴裝飾卡（第 2~4 排中段）
    const defaultTex = TempleTextures.createBlessingCardTexture();
    const cardMat = new THREE.MeshPhysicalMaterial({
      map: defaultTex,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    cardSlots.forEach((slot, idx) => {
      if (idx >= 15 && idx % 15 >= 2 && idx % 15 <= 12) {
        const card = new THREE.Mesh(new THREE.PlaneGeometry(0.102, 0.138), cardMat);
        card.position.set(-1.52, slot.y, slot.z);
        card.rotation.y = Math.PI / 2;
        card.userData.phase = Math.random() * Math.PI * 2;
        card.userData.slotIndex = idx;
        cardRackGroup.add(card);
        blessingCards.push(card);
        slot.card = card;
      }
    });

    // 黑色網格底線
    for (let z = 0.56; z <= 2.34; z += 0.12) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.48, 4), blackWireMat);
      wire.position.set(-1.55, 1.24, z);
      cardRackGroup.add(wire);
    }

    scene.add(cardRackGroup);
  }

  function clearSlotMesh(slot) {
    if (!slot || !slot.card) return;
    cardRackGroup.remove(slot.card);
    const bIdx = blessingCards.indexOf(slot.card);
    if (bIdx !== -1) blessingCards.splice(bIdx, 1);
    slot.card = null;
  }

  // 設定／修改指定槽位的祈福卡
  function setBlessingSlot(slotIdx, wishText, isUser = true) {
    const slots = cardRackGroup && cardRackGroup.userData.cardSlots;
    if (!slots || !slots[slotIdx]) return;
    const slot = slots[slotIdx];
    clearSlotMesh(slot);

    const tex = TempleTextures.createBlessingCardTexture(isUser ? wishText : '');
    const mat = isUser
      ? new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.1,
          emissive: 0x2b8cff,
          emissiveIntensity: 0.55,
          side: THREE.DoubleSide
        })
      : new THREE.MeshPhysicalMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.1,
          roughness: 0.2,
          side: THREE.DoubleSide
        });

    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(isUser ? 0.11 : 0.102, isUser ? 0.148 : 0.138),
      mat
    );
    card.position.set(isUser ? -1.50 : -1.52, slot.y, slot.z);
    card.rotation.y = Math.PI / 2;
    card.userData.phase = Math.random() * Math.PI * 2;
    card.userData.slotIndex = slotIdx;
    cardRackGroup.add(card);
    blessingCards.push(card);
    slot.card = card;
    slot.isUser = isUser;
    slot.wishText = isUser ? wishText : '';
  }

  function removeBlessingSlot(slotIdx) {
    const slots = cardRackGroup && cardRackGroup.userData.cardSlots;
    if (!slots || !slots[slotIdx]) return;
    const slot = slots[slotIdx];
    clearSlotMesh(slot);
    slot.isUser = false;
    slot.wishText = '';
  }

  function moveBlessingSlot(fromIdx, toIdx) {
    const slots = cardRackGroup && cardRackGroup.userData.cardSlots;
    if (!slots || !slots[fromIdx] || !slots[toIdx] || fromIdx === toIdx) return;
    const fromSlot = slots[fromIdx];
    const toSlot = slots[toIdx];

    const fromData = {
      hasCard: Boolean(fromSlot.card),
      isUser: fromSlot.isUser,
      wishText: fromSlot.wishText
    };
    const toData = {
      hasCard: Boolean(toSlot.card),
      isUser: toSlot.isUser,
      wishText: toSlot.wishText
    };

    if (toData.hasCard) {
      setBlessingSlot(fromIdx, toData.wishText, toData.isUser);
    } else {
      removeBlessingSlot(fromIdx);
    }

    if (fromData.hasCard) {
      setBlessingSlot(toIdx, fromData.wishText, fromData.isUser);
    } else {
      removeBlessingSlot(toIdx);
    }
  }

  function getBlessingSlots() {
    const slots = (cardRackGroup && cardRackGroup.userData.cardSlots) || [];
    return slots.map((s) => ({
      index: s.index,
      row: s.row,
      col: s.col,
      hasCard: Boolean(s.card),
      isUser: s.isUser,
      wishText: s.wishText
    }));
  }

  function exportBlessings() {
    const slots = (cardRackGroup && cardRackGroup.userData.cardSlots) || [];
    return slots
      .filter((s) => s.isUser && s.wishText)
      .map((s) => ({ slotIndex: s.index, wishText: s.wishText }));
  }

  function importBlessings(items) {
    const slots = (cardRackGroup && cardRackGroup.userData.cardSlots) || [];
    if (!Array.isArray(items) || !slots.length) return;
    // 先清除全部現有使用者卡
    slots.forEach((s) => {
      if (s.isUser) removeBlessingSlot(s.index);
    });
    items.forEach((item, i) => {
      const idx = typeof item.slotIndex === 'number' && slots[item.slotIndex]
        ? item.slotIndex
        : i % slots.length;
      if (item.wishText) {
        setBlessingSlot(idx, String(item.wishText).slice(0, 80), true);
      }
    });
  }

  function setOnCardClick(cb) {
    onCardClickCallback = cb;
  }

  // 使用者線上祈福：動態新增發光祈福卡（自動找尋下一個空位或非使用者槽位）
  function addBlessingCard(wishText) {
    const slots = cardRackGroup.userData.cardSlots || [];
    if (!slots.length) return -1;

    let targetIdx = slots.findIndex((s) => !s.isUser);
    if (targetIdx === -1) {
      targetIdx = cardRackGroup.userData.nextUserSlot % slots.length;
      cardRackGroup.userData.nextUserSlot += 1;
    }

    setBlessingSlot(targetIdx, wishText, true);

    // 飛向祈福牆展示
    focusSpot(4);
    return targetIdx;
  }

  // 右側「感恩的心」解說牌與環保金爐
  function buildPlaqueAndFurnace() {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xc2c8ce, metalness: 0.85, roughness: 0.22 });

    // 1. 不鏽鋼解說牌（立於廟右後方，不卡到屋簷，兩根支腳置於碑面背後）
    const plaqueGroup = new THREE.Group();
    [-0.36, 0.36].forEach((px) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.04, 0.035), steelMat);
      leg.position.set(px, 0.52, -0.045);
      leg.castShadow = true;
      plaqueGroup.add(leg);
    });

    const plaqueTex = TempleTextures.createGratitudePlaqueTexture();
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.60, 0.02),
      new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.35, metalness: 0.3 })
    );
    board.position.set(0, 1.06, 0);
    board.rotation.x = -0.34;
    board.castShadow = true;
    plaqueGroup.add(board);

    plaqueGroup.position.set(1.06, 0, -0.58);
    plaqueGroup.rotation.y = Math.PI * 0.82;
    scene.add(plaqueGroup);

    // 2. 不鏽鋼環保金爐
    const furnace = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.95, 20), steelMat);
    body.position.y = 0.62;
    body.castShadow = true;
    furnace.add(body);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.32, 20), steelMat);
    cone.position.y = 1.25;
    cone.castShadow = true;
    furnace.add(cone);

    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.15, 16), steelMat);
    chimney.position.y = 1.9;
    chimney.castShadow = true;
    furnace.add(chimney);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.12, 16), steelMat);
    cap.position.y = 2.52;
    cap.rotation.x = Math.PI;
    furnace.add(cap);

    // 金爐支腳
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6), steelMat);
      leg.position.set(Math.cos(a) * 0.24, 0.09, Math.sin(a) * 0.24);
      furnace.add(leg);
    }

    furnace.position.set(2.65, 0, -1.2);
    scene.add(furnace);
  }

  // 天公爐與神龕小香爐嬝嬝香煙粒子
  function buildSmokeParticles() {
    const outerGeo = new THREE.SphereGeometry(0.025, 6, 6);
    for (let i = 0; i < 24; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xeaeaea,
        transparent: true,
        opacity: 0.32
      });
      const p = new THREE.Mesh(outerGeo, mat);
      p.userData.source = 'outer';
      resetSmokeParticle(p, i / 24);
      scene.add(p);
      smokeParticles.push(p);
    }

    const innerGeo = new THREE.SphereGeometry(0.011, 6, 6);
    for (let i = 0; i < 16; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf2f2f2,
        transparent: true,
        opacity: 0.28
      });
      const p = new THREE.Mesh(innerGeo, mat);
      p.userData.source = 'inner';
      resetSmokeParticle(p, i / 16);
      scene.add(p);
      smokeParticles.push(p);
    }
  }

  function resetSmokeParticle(p, offset = 0) {
    if (p.userData.source === 'inner') {
      p.position.set(
        (Math.random() - 0.5) * 0.045,
        0.575 + offset * 0.24,
        0.03 + (Math.random() - 0.5) * 0.04
      );
      p.userData.life = offset;
      p.userData.speed = 0.42 + Math.random() * 0.18;
      p.userData.driftX = (Math.random() - 0.5) * 0.035;
      return;
    }

    p.position.set(
      (Math.random() - 0.5) * 0.14,
      0.88 + offset * 1.1,
      2.05 + (Math.random() - 0.5) * 0.14
    );
    p.userData.life = offset;
    p.userData.speed = 0.25 + Math.random() * 0.15;
    p.userData.driftX = (Math.random() - 0.5) * 0.1;
  }

  // 切換導覽點平滑飛鏡
  function focusSpot(index) {
    const spot = SPOTS[index];
    if (!spot) return;

    camAnim.startPos.copy(camera.position);
    camAnim.endPos.copy(spot.camPos);
    camAnim.startTarget.copy(controls.target);
    camAnim.endTarget.copy(spot.target);
    camAnim.progress = 0;
    camAnim.active = true;
  }

  // 切換日間/夜間光影
  function setDayNight(night) {
    isNightMode = night;
    if (night) {
      scene.background.setHex(0x0d1522);
      scene.fog.color.setHex(0x0d1522);
      sunLight.intensity = 0.22;
      sunLight.color.setHex(0x7ca6ff);
      hemiLight.intensity = 0.28;
      ambientLight.intensity = 0.18;
      lotusLight.intensity = 2.6;
      canopyLight.intensity = 1.6;
      furnaceLight.intensity = 1.2;
    } else {
      scene.background.setHex(0x9fd0f2);
      scene.fog.color.setHex(0x9fd0f2);
      sunLight.intensity = 1.35;
      sunLight.color.setHex(0xfff5e0);
      hemiLight.intensity = 0.75;
      ambientLight.intensity = 0.35;
      lotusLight.intensity = 1.2;
      canopyLight.intensity = 0.0;
      furnaceLight.intensity = 0.0;
    }
  }

  // 將 3D 座標投影到 2D 螢幕位置（供熱點標籤使用）
  function getProjectedHotspots() {
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;

    return SPOTS.map((spot) => {
      const vec = spot.hotspotPos.clone().project(camera);
      const isBehind = vec.z > 1;
      const x = (vec.x * 0.5 + 0.5) * width;
      const y = (-vec.y * 0.5 + 0.5) * height;
      return { id: spot.id, title: spot.title, icon: spot.icon, x, y, visible: !isBehind };
    });
  }

  function onResize() {
    if (!renderer || !camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // 建立 6 種 3D 供品模型
  function createOfferingMesh(id) {
    const item = new THREE.Group();
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xf6f4ee, roughness: 0.35 });
    const redPlateMat = new THREE.MeshStandardMaterial({ color: 0xb8241e, roughness: 0.45 });

    if (id === 'wang') {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.13, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xe62e25, roughness: 0.38 })
      );
      box.position.y = 0.065;
      box.castShadow = true;
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.245, 0.032, 0.155),
        new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.35, metalness: 0.25 })
      );
      band.position.y = 0.09;
      item.add(box, band);
      item.position.set(0.36, 0.42, 1.12);
      item.rotation.y = -0.18;
    } else if (id === 'mochi') {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.018, 20), plateMat);
      plate.position.y = 0.009;
      item.add(plate);
      const mochiMat = new THREE.MeshStandardMaterial({ color: 0xf2c86b, roughness: 0.72 });
      const offsets = [
        [0, 0.036, 0],
        [-0.042, 0.028, 0.028],
        [0.042, 0.028, 0.028],
        [-0.04, 0.028, -0.03],
        [0.04, 0.028, -0.03]
      ];
      offsets.forEach(([ox, oy, oz]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), mochiMat);
        m.scale.set(1.15, 0.78, 1.15);
        m.position.set(ox, oy, oz);
        m.castShadow = true;
        item.add(m);
      });
      item.position.set(-0.36, 0.42, 1.14);
    } else if (id === 'peach') {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.08, 0.018, 20), redPlateMat);
      plate.position.y = 0.009;
      item.add(plate);
      const peachMat = new THREE.MeshStandardMaterial({ color: 0xff8da1, roughness: 0.55 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b8c3b, roughness: 0.6 });
      [[-0.036, 0.042, 0.02], [0.036, 0.042, 0.02], [0, 0.046, -0.036]].forEach(([px, py, pz]) => {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), peachMat);
        p.scale.set(0.95, 1.25, 0.95);
        p.position.set(px, py, pz);
        p.castShadow = true;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.006, 0.014), leafMat);
        leaf.position.set(px + 0.018, py - 0.02, pz);
        leaf.rotation.z = 0.4;
        item.add(p, leaf);
      });
      item.position.set(-0.12, 0.42, 1.02);
    } else if (id === 'fruit') {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.02, 20), plateMat);
      plate.position.y = 0.01;
      item.add(plate);
      const appleMat = new THREE.MeshStandardMaterial({ color: 0xd93025, roughness: 0.42 });
      const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.52 });
      [
        { pos: [-0.036, 0.042, 0.02], mat: appleMat },
        { pos: [0.036, 0.042, 0.02], mat: orangeMat },
        { pos: [0, 0.042, -0.038], mat: appleMat },
        { pos: [0, 0.075, -0.004], mat: orangeMat }
      ].forEach((f) => {
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), f.mat);
        fruit.position.set(...f.pos);
        fruit.castShadow = true;
        item.add(fruit);
      });
      item.position.set(0.13, 0.42, 1.02);
    } else if (id === 'tea') {
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.014, 0.085), redPlateMat);
      tray.position.y = 0.007;
      item.add(tray);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xc92a2a, roughness: 0.32 });
      const teaMat = new THREE.MeshStandardMaterial({ color: 0x9c6b1f, roughness: 0.2 });
      [-0.072, 0, 0.072].forEach((cx) => {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.036, 12), cupMat);
        cup.position.set(cx, 0.032, 0);
        cup.castShadow = true;
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 12), teaMat);
        liquid.position.set(cx, 0.049, 0);
        item.add(cup, liquid);
      });
      item.position.set(0, 0.42, 1.29);
    } else if (id === 'pineapple') {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.068, 0.016, 18), redPlateMat);
      plate.position.y = 0.008;
      item.add(plate);
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xe6a117, roughness: 0.65 })
      );
      body.scale.set(0.95, 1.35, 0.95);
      body.position.y = 0.075;
      body.castShadow = true;
      item.add(body);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f8536, roughness: 0.58 });
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.075, 5), leafMat);
        leaf.position.set(Math.cos(ang) * 0.016, 0.155, Math.sin(ang) * 0.016);
        leaf.rotation.z = -Math.cos(ang) * 0.42;
        leaf.rotation.x = Math.sin(ang) * 0.42;
        item.add(leaf);
      }
      item.position.set(0.36, 0.42, 1.28);
    }

    item.userData.popAnim = 0;
    item.scale.setScalar(0.01);
    return item;
  }

  function setOffering(id, enabled) {
    if (!offeringsRoot) return;
    if (enabled) {
      if (offeringsMap[id]) return;
      const mesh = createOfferingMesh(id);
      offeringsRoot.add(mesh);
      offeringsMap[id] = mesh;
    } else if (offeringsMap[id]) {
      offeringsRoot.remove(offeringsMap[id]);
      delete offeringsMap[id];
    }
  }

  function clearOfferings() {
    Object.keys(offeringsMap).forEach((id) => setOffering(id, false));
  }

  function getActiveOfferings() {
    return Object.keys(offeringsMap);
  }

  // 建立 3D 紅木半月形雙筊與落地光環
  function buildBweiPair3D() {
    const pair = new THREE.Group();
    const redWoodMat = new THREE.MeshStandardMaterial({ color: 0xb21e18, roughness: 0.36 });
    const flatWoodMat = new THREE.MeshStandardMaterial({ color: 0xf0cfa0, roughness: 0.52 });

    function makeSingleBwei() {
      const g = new THREE.Group();
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.088, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        redWoodMat
      );
      dome.scale.set(1.38, 0.48, 0.72);
      dome.castShadow = true;
      const flatBase = new THREE.Mesh(new THREE.CircleGeometry(0.088, 18), flatWoodMat);
      flatBase.rotation.x = Math.PI / 2;
      flatBase.scale.set(1.38, 0.72, 1);
      g.add(dome, flatBase);
      return g;
    }

    const left = makeSingleBwei();
    left.position.set(-0.12, 0.02, 0);
    left.rotation.y = 0.28;
    const right = makeSingleBwei();
    right.position.set(0.12, 0.02, 0.04);
    right.rotation.y = -0.35;

    // 落地擴散光環
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd54f,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;

    pair.add(left, right, ring);
    bweiAnim.left = left;
    bweiAnim.right = right;
    bweiAnim.ring = ring;
    return pair;
  }

  function throwBwei3D(resultType) {
    if (!bweiAnim.group || !bweiAnim.left || !bweiAnim.right) return;
    bweiAnim.group.visible = true;
    bweiAnim.active = true;
    bweiAnim.progress = 0;
    bweiAnim.duration = 0.92;
    bweiAnim.resultType = resultType;

    // 設定光環顏色（聖筊金光、笑筊暖橘、陰筊淡銀）
    if (bweiAnim.ring) {
      bweiAnim.ring.material.color.setHex(
        resultType === 'sheng' ? 0xffd54f : resultType === 'xiao' ? 0xfb923c : 0x94a3b8
      );
      bweiAnim.ring.material.opacity = 0;
      bweiAnim.ring.scale.setScalar(1);
    }

    // 凸面朝上 (rotX = 0) / 平面朝上 (rotX = Math.PI)
    const turns = Math.PI * 6;
    if (resultType === 'sheng') {
      bweiAnim.leftEndRotX = turns + 0;
      bweiAnim.rightEndRotX = turns + Math.PI;
    } else if (resultType === 'xiao') {
      bweiAnim.leftEndRotX = turns + Math.PI;
      bweiAnim.rightEndRotX = turns + Math.PI;
    } else {
      bweiAnim.leftEndRotX = turns + 0;
      bweiAnim.rightEndRotX = turns + 0;
    }
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();

    // 平滑相機轉場
    if (camAnim.active) {
      camAnim.progress += dt / camAnim.duration;
      const t = Math.min(camAnim.progress, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease);
      controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease);
      if (t >= 1) camAnim.active = false;
    }

    // 供品彈跳登場動畫
    Object.values(offeringsMap).forEach((item) => {
      if (item.userData.popAnim < 1) {
        item.userData.popAnim = Math.min(1, item.userData.popAnim + dt * 3.8);
        const p = item.userData.popAnim;
        const s = 1 + Math.sin(p * Math.PI) * 0.22 * (1 - p);
        item.scale.setScalar(p < 0.05 ? 0.05 : p * s);
      }
    });

    // 3D 雙筊拋擲翻滾與二次彈跳落地動畫
    if (bweiAnim.active && bweiAnim.left && bweiAnim.right) {
      bweiAnim.progress += dt / bweiAnim.duration;
      const t = Math.min(bweiAnim.progress, 1);

      function bounceHeight(p, peak) {
        if (p < 0.66) {
          const u = p / 0.66;
          return Math.sin(u * Math.PI) * peak;
        }
        if (p < 0.88) {
          const u = (p - 0.66) / 0.22;
          return Math.sin(u * Math.PI) * (peak * 0.22);
        }
        const u = (p - 0.88) / 0.12;
        return Math.sin(u * Math.PI) * (peak * 0.06);
      }

      bweiAnim.left.position.y = 0.02 + bounceHeight(t, 0.68);
      bweiAnim.right.position.y = 0.02 + bounceHeight(Math.max(0, t - 0.03), 0.62);

      const spinEase = Math.min(1, t / 0.88);
      bweiAnim.left.rotation.x = bweiAnim.leftEndRotX * spinEase;
      bweiAnim.right.rotation.x = bweiAnim.rightEndRotX * spinEase;
      bweiAnim.left.rotation.z = Math.sin(t * Math.PI * 3) * 0.25 * (1 - t);
      bweiAnim.right.rotation.z = -Math.sin(t * Math.PI * 3) * 0.25 * (1 - t);

      if (bweiAnim.ring && t >= 0.66) {
        const rt = (t - 0.66) / 0.34;
        bweiAnim.ring.scale.setScalar(1 + rt * 1.9);
        bweiAnim.ring.material.opacity = (1 - rt) * 0.72;
      }

      if (t >= 1) {
        bweiAnim.active = false;
        bweiAnim.left.position.y = 0.02;
        bweiAnim.right.position.y = 0.02;
        bweiAnim.left.rotation.x = bweiAnim.leftEndRotX;
        bweiAnim.right.rotation.x = bweiAnim.rightEndRotX;
        bweiAnim.left.rotation.z = 0;
        bweiAnim.right.rotation.z = 0;
        if (bweiAnim.ring) bweiAnim.ring.material.opacity = 0;
      }
    }

    // 祈福卡微風輕擺
    blessingCards.forEach((card) => {
      card.rotation.z = Math.sin(elapsed * 2.1 + card.userData.phase) * 0.06;
    });

    // 香煙粒子上升（天公爐與神龕內小香爐）
    smokeParticles.forEach((p) => {
      p.userData.life += dt * p.userData.speed;
      if (p.userData.life >= 1) {
        resetSmokeParticle(p, 0);
      } else {
        const isInner = p.userData.source === 'inner';
        p.position.y += dt * (isInner ? 0.14 : 0.38);
        p.position.x += Math.sin(elapsed * 2 + p.userData.life * 6) * (isInner ? 0.0005 : 0.0012) + p.userData.driftX * dt;
        const s = 1 + p.userData.life * (isInner ? 1.3 : 2.2);
        p.scale.set(s, s, s);
        p.material.opacity = (1 - p.userData.life) * (isInner ? 0.24 : 0.28);
      }
    });

    controls.update();
    renderer.render(scene, camera);

    if (window.onSceneFrame) {
      window.onSceneFrame();
    }
  }

  return {
    init,
    SPOTS,
    focusSpot,
    setDayNight,
    addBlessingCard,
    setBlessingSlot,
    removeBlessingSlot,
    moveBlessingSlot,
    getBlessingSlots,
    exportBlessings,
    importBlessings,
    setOnCardClick,
    setOffering,
    clearOfferings,
    getActiveOfferings,
    throwBwei3D,
    getProjectedHotspots
  };
})();
