(function () {
  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");
  const badgeRack = document.querySelector("#badgeRack");
  const heartMeter = document.querySelector("#heartMeter");
  const scoreMeter = document.querySelector("#scoreMeter");
  const timeMeter = document.querySelector("#timeMeter");
  const toast = document.querySelector("#toast");
  const overlay = document.querySelector("#overlay");
  const overlayTitle = document.querySelector("#overlayTitle");
  const overlayText = document.querySelector("#overlayText");
  const overlayBadges = document.querySelector("#overlayBadges");
  const overlayMeaning = document.querySelector("#overlayMeaning");
  const startButton = document.querySelector("#startButton");
  const orientationContinue = document.querySelector("#orientationContinue");

  const view = { width: 960, height: 540 };
  const render = { scale: 1, offsetX: 0, offsetY: 0, width: view.width, height: view.height };
  const world = { width: 13200, height: 540, ground: 462 };
  const finishX = 12960;
  const gravity = 1850;
  const moveSpeed = 285;
  const jumpSpeed = 670;
  const maxJumps = 2;
  const storageKey = "forestValueAdventureBestRun";

  const values = [
    {
      id: "customer",
      name: "客户第一",
      short: "客",
      color: "#1665d8",
      image: "assets/optimized/value-badges/客户第一.webp",
      x: 620,
      y: 308,
      text: "把真实需求放在前面",
    },
    {
      id: "teamwork",
      name: "团队协作",
      short: "协",
      color: "#18a99a",
      image: "assets/optimized/value-badges/团队协作.webp",
      x: 3000,
      y: 268,
      text: "彼此补位一起抵达",
    },
    {
      id: "strive",
      name: "拼搏进取",
      short: "搏",
      color: "#f0643c",
      image: "assets/optimized/value-badges/拼搏进取.webp",
      x: 5900,
      y: 250,
      text: "关键时刻再向前一步",
    },
    {
      id: "learn",
      name: "持续学习",
      short: "学",
      color: "#24a76d",
      image: "assets/optimized/value-badges/持续学习.webp",
      x: 9100,
      y: 250,
      text: "每天升级一点点",
    },
    {
      id: "innovate",
      name: "创新创业",
      short: "创",
      color: "#6f4ce6",
      image: "assets/optimized/value-badges/创新创业.webp",
      x: 12280,
      y: 205,
      text: "敢想敢试创造新解法",
    },
  ];

  const badgeImages = new Map(
    values.map((badge) => {
      const image = new Image();
      image.decoding = "async";
      image.src = badge.image;
      image.addEventListener("load", draw);
      return [badge.id, image];
    }),
  );
  const playerImage = new Image();
  playerImage.decoding = "async";
  playerImage.src = "assets/optimized/opossum-q-sprite.webp";
  playerImage.addEventListener("load", draw);
  const forestBackgroundImage = new Image();
  forestBackgroundImage.decoding = "async";
  forestBackgroundImage.src = "assets/backgrounds/healing-forest-bg.webp";
  forestBackgroundImage.addEventListener("load", draw);
  const requiredAssetImages = [...badgeImages.values(), playerImage, forestBackgroundImage];
  const assetState = {
    ready: false,
    failed: false,
    loaded: 0,
    total: requiredAssetImages.length,
  };
  const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
  let orientationBypass = false;

  const platforms = [
    { x: 0, y: world.ground, w: 820, h: 90 },
    { x: 960, y: world.ground, w: 740, h: 90 },
    { x: 1840, y: world.ground, w: 810, h: 90 },
    { x: 2820, y: world.ground, w: 680, h: 90 },
    { x: 3650, y: world.ground, w: 750, h: 90 },
    { x: 4560, y: world.ground, w: 690, h: 90 },
    { x: 5430, y: world.ground, w: 690, h: 90 },
    { x: 6320, y: world.ground, w: 730, h: 90 },
    { x: 7240, y: world.ground, w: 660, h: 90 },
    { x: 8120, y: world.ground, w: 730, h: 90 },
    { x: 9040, y: world.ground, w: 690, h: 90 },
    { x: 9950, y: world.ground, w: 730, h: 90 },
    { x: 10900, y: world.ground, w: 720, h: 90 },
    { x: 11860, y: world.ground, w: 1240, h: 90 },
    { x: 410, y: 360, w: 240, h: 26 },
    { x: 1080, y: 382, w: 190, h: 26 },
    { x: 1340, y: 326, w: 240, h: 26 },
    { x: 1940, y: 370, w: 210, h: 26 },
    { x: 2220, y: 318, w: 210, h: 26 },
    { x: 2490, y: 270, w: 240, h: 26 },
    { x: 2890, y: 318, w: 260, h: 26 },
    { x: 3240, y: 372, w: 210, h: 26 },
    { x: 3770, y: 380, w: 230, h: 26 },
    { x: 4090, y: 328, w: 230, h: 26 },
    { x: 4380, y: 284, w: 190, h: 26 },
    { x: 4700, y: 372, w: 220, h: 26 },
    { x: 5000, y: 322, w: 210, h: 26 },
    { x: 5320, y: 276, w: 220, h: 26 },
    { x: 5810, y: 300, w: 260, h: 26 },
    { x: 6420, y: 374, w: 220, h: 26 },
    { x: 6730, y: 326, w: 210, h: 26 },
    { x: 7030, y: 284, w: 210, h: 26 },
    { x: 7340, y: 392, w: 180, h: 26 },
    { x: 7600, y: 340, w: 190, h: 26 },
    { x: 8180, y: 374, w: 230, h: 26 },
    { x: 8650, y: 320, w: 220, h: 26 },
    { x: 8950, y: 306, w: 300, h: 26 },
    { x: 9410, y: 376, w: 210, h: 26 },
    { x: 10080, y: 374, w: 230, h: 26 },
    { x: 10410, y: 318, w: 230, h: 26 },
    { x: 11080, y: 372, w: 210, h: 26 },
    { x: 11400, y: 320, w: 220, h: 26 },
    { x: 11710, y: 270, w: 220, h: 26 },
    { x: 12110, y: 255, w: 330, h: 26 },
    { x: 12550, y: 342, w: 220, h: 26 },
  ];

  const hazards = [
    { x: 824, y: 506, w: 132, h: 34 },
    { x: 1704, y: 506, w: 132, h: 34 },
    { x: 2654, y: 506, w: 162, h: 34 },
    { x: 3504, y: 506, w: 142, h: 34 },
    { x: 4410, y: 506, w: 146, h: 34 },
    { x: 5254, y: 506, w: 172, h: 34 },
    { x: 6124, y: 506, w: 192, h: 34 },
    { x: 7054, y: 506, w: 182, h: 34 },
    { x: 7904, y: 506, w: 212, h: 34 },
    { x: 8854, y: 506, w: 182, h: 34 },
    { x: 9734, y: 506, w: 212, h: 34 },
    { x: 10684, y: 506, w: 212, h: 34 },
    { x: 11624, y: 506, w: 232, h: 34 },
    { x: 1390, y: 308, w: 86, h: 18, spikes: true },
    { x: 4100, y: 310, w: 86, h: 18, spikes: true },
    { x: 6748, y: 308, w: 78, h: 18, spikes: true },
    { x: 8665, y: 302, w: 78, h: 18, spikes: true },
    { x: 11424, y: 302, w: 86, h: 18, spikes: true },
  ];

  const springs = [
    { x: 1720, y: 430, w: 36, h: 34, power: 790 },
    { x: 3548, y: 430, w: 36, h: 34, power: 800 },
    { x: 5275, y: 430, w: 36, h: 34, power: 810 },
    { x: 7078, y: 430, w: 36, h: 34, power: 805 },
    { x: 9768, y: 430, w: 36, h: 34, power: 815 },
    { x: 11648, y: 430, w: 36, h: 34, power: 825 },
  ];

  const enemies = [
    { x: 1120, y: 424, w: 44, h: 34, min: 990, max: 1580, speed: 88, dir: 1, sleep: 0 },
    { x: 2240, y: 424, w: 44, h: 34, min: 1880, max: 2560, speed: 84, dir: -1, sleep: 0 },
    { x: 2500, y: 236, w: 44, h: 34, min: 2490, max: 2680, speed: 62, dir: 1, sleep: 0 },
    { x: 3920, y: 424, w: 44, h: 34, min: 3700, max: 4310, speed: 94, dir: 1, sleep: 0 },
    { x: 5020, y: 288, w: 44, h: 34, min: 5000, max: 5160, speed: 68, dir: -1, sleep: 0 },
    { x: 5600, y: 424, w: 44, h: 34, min: 5460, max: 6040, speed: 90, dir: 1, sleep: 0 },
    { x: 6490, y: 424, w: 44, h: 34, min: 6360, max: 6950, speed: 88, dir: -1, sleep: 0 },
    { x: 7650, y: 424, w: 44, h: 34, min: 7280, max: 7850, speed: 96, dir: 1, sleep: 0 },
    { x: 8660, y: 286, w: 44, h: 34, min: 8650, max: 8820, speed: 68, dir: 1, sleep: 0 },
    { x: 9300, y: 424, w: 44, h: 34, min: 9080, max: 9640, speed: 92, dir: -1, sleep: 0 },
    { x: 10320, y: 424, w: 44, h: 34, min: 10000, max: 10600, speed: 92, dir: 1, sleep: 0 },
    { x: 11480, y: 286, w: 44, h: 34, min: 11420, max: 11580, speed: 72, dir: -1, sleep: 0 },
    { x: 12480, y: 424, w: 44, h: 34, min: 11900, max: 12900, speed: 98, dir: 1, sleep: 0 },
  ];

  const shards = createShards();

  const state = {
    running: false,
    complete: false,
    lastTime: 0,
    cameraX: 0,
    elapsed: 0,
    score: 0,
    hearts: 3,
    checkpoint: { x: 72, y: 380 },
    keys: { left: false, right: false, jump: false },
    jumpBuffer: 0,
    coyote: 0,
    toastText: "",
    toastTimer: 0,
    collectedBadges: new Set(),
    collectedShards: new Set(),
    particles: [],
    best: loadBest(),
    player: createPlayer(),
  };

  refreshAppHeight();
  syncMobileOrientation();
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleViewportChange);
  window.visualViewport?.addEventListener("resize", handleViewportChange);
  window.screen?.orientation?.addEventListener?.("change", handleViewportChange);
  coarsePointerQuery.addEventListener?.("change", handleViewportChange);
  orientationContinue?.addEventListener("click", () => {
    orientationBypass = true;
    handleViewportChange();
  });

  buildBadgeUi();
  resetRun();
  setAssetLoadingState(0);
  resizeCanvas();
  renderOverlayBadges();
  draw();
  syncOverlayState();
  prepareAssets();

  startButton.addEventListener("click", () => {
    if (assetState.failed) {
      window.location.reload();
      return;
    }
    startFreshRun();
  });

  function startFreshRun(options = {}) {
    if (!assetState.ready) {
      showToast(assetState.failed ? "素材加载失败，请刷新重试" : "素材加载中，请稍等");
      return;
    }
    if (options.reset || state.complete) resetRun();
    setOverlayVisible(false);
    state.lastTime = performance.now();
    if (!state.running) {
      state.running = true;
      requestAnimationFrame(loop);
    }
  }

  window.addEventListener("resize", queueResizeCanvas);
  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "ArrowLeft" || event.code === "KeyA") state.keys.left = true;
    if (event.code === "ArrowRight" || event.code === "KeyD") state.keys.right = true;
    if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") queueJump();
    if (event.code === "KeyR") startFreshRun({ reset: true });
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") state.keys.left = false;
    if (event.code === "ArrowRight" || event.code === "KeyD") state.keys.right = false;
    if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") state.keys.jump = false;
  });

  const supportsPointerEvents = "PointerEvent" in window;

  document.querySelectorAll("[data-hold]").forEach((button) => {
    const direction = button.dataset.hold;
    const press = (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      state.keys[direction] = true;
    };
    const release = (event) => {
      event?.preventDefault?.();
      state.keys[direction] = false;
      button.blur?.();
    };
    if (supportsPointerEvents) {
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    } else {
      button.addEventListener("touchstart", press, { passive: false });
      button.addEventListener("touchend", release, { passive: false });
      button.addEventListener("touchcancel", release, { passive: false });
      button.addEventListener("mousedown", press);
      button.addEventListener("mouseup", release);
      button.addEventListener("mouseleave", release);
    }
  });

  const jumpButton = document.querySelector("[data-tap='jump']");
  const jump = (event) => {
    event.preventDefault();
    jumpButton.setPointerCapture?.(event.pointerId);
    queueJump();
    jumpButton.blur?.();
  };
  if (supportsPointerEvents) {
    jumpButton.addEventListener("pointerdown", jump);
  } else {
    jumpButton.addEventListener("touchstart", jump, { passive: false });
    jumpButton.addEventListener("mousedown", jump);
  }

  if (isTouchLikeDevice()) {
    window.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
      },
      { passive: false },
    );
    const settleMobileViewport = () => {
      const settle = () => {
        window.scrollTo(0, 0);
        handleViewportChange();
      };
      window.setTimeout(settle, 80);
      window.setTimeout(settle, 260);
      window.setTimeout(settle, 520);
    };
    window.addEventListener("orientationchange", settleMobileViewport);
    window.addEventListener("resize", settleMobileViewport);
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("selectstart", (event) => event.preventDefault());
    window.addEventListener("dragstart", (event) => event.preventDefault());
    document.addEventListener("selectionchange", () => window.getSelection()?.removeAllRanges());
    window.setInterval(pollMobileOrientation, 380);
    settleMobileViewport();
  }

  function handleViewportChange() {
    refreshAppHeight();
    syncMobileOrientation();
    queueResizeCanvas();
  }

  function refreshAppHeight() {
    const { height } = getViewportSize();
    document.documentElement.style.setProperty("--app-height", `${Math.max(1, height)}px`);
  }

  function getViewportSize() {
    const viewport = window.visualViewport;
    return {
      width: viewport?.width || window.innerWidth || document.documentElement.clientWidth || 0,
      height: viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0,
    };
  }

  function isTouchLikeDevice() {
    return coarsePointerQuery.matches || navigator.maxTouchPoints > 0;
  }

  function syncMobileOrientation() {
    const { width, height } = getViewportSize();
    const isTouch = isTouchLikeDevice();
    const hasSize = width > 0 && height > 0;
    const isLandscape =
      orientationBypass || (isTouch && hasSize && (width > height || deviceReportsLandscapeOrientation()));
    const isPortrait = isTouch && hasSize && !isLandscape && height >= width;
    const isForcedLandscape = isLandscape && hasSize && height >= width;
    const wasPortrait = document.body.classList.contains("is-portrait-phone");
    const wasLandscape = document.body.classList.contains("is-landscape-phone");
    const wasForcedLandscape = document.body.classList.contains("is-forced-landscape");
    document.body.classList.toggle("is-portrait-phone", isPortrait);
    document.body.classList.toggle("is-landscape-phone", isLandscape);
    document.body.classList.toggle("is-forced-landscape", isForcedLandscape);
    return wasPortrait !== isPortrait || wasLandscape !== isLandscape || wasForcedLandscape !== isForcedLandscape;
  }

  function pollMobileOrientation() {
    refreshAppHeight();
    if (syncMobileOrientation()) {
      queueResizeCanvas();
    }
  }

  function deviceReportsLandscapeOrientation() {
    const orientation = window.screen?.orientation;
    const angle = Number.isFinite(orientation?.angle) ? orientation.angle : Number(window.orientation);
    const type = String(orientation?.type || "");
    return Math.abs(angle) === 90 || type.includes("landscape");
  }

  function prepareAssets() {
    let loaded = 0;
    Promise.all(
      requiredAssetImages.map((image) =>
        waitForImage(image).then(() => {
          loaded += 1;
          setAssetLoadingState(loaded);
        }),
      ),
    )
      .then(() => {
        assetState.ready = true;
        assetState.failed = false;
        document.body.classList.remove("is-loading-assets");
        startButton.disabled = false;
        if (!state.complete) startButton.textContent = "开始冒险";
        draw();
      })
      .catch(() => {
        assetState.failed = true;
        document.body.classList.remove("is-loading-assets");
        startButton.disabled = false;
        startButton.textContent = "刷新重试";
        showToast("素材加载失败，请刷新重试");
      });
  }

  function setAssetLoadingState(loaded) {
    if (assetState.ready) return;
    assetState.loaded = loaded;
    document.body.classList.add("is-loading-assets");
    startButton.disabled = true;
    startButton.textContent = `素材加载中 ${loaded}/${assetState.total}`;
  }

  function waitForImage(image) {
    if (image.complete) {
      return image.naturalWidth ? decodeImage(image) : Promise.reject(new Error("Image failed"));
    }
    return new Promise((resolve, reject) => {
      const onLoad = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Image failed"));
      };
      const cleanup = () => {
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError);
      };
      image.addEventListener("load", onLoad);
      image.addEventListener("error", onError);
    }).then(() => decodeImage(image));
  }

  function decodeImage(image) {
    if (!image.decode) return Promise.resolve();
    return image.decode().catch(() => undefined);
  }

  function setOverlayVisible(visible) {
    overlay.classList.toggle("is-visible", visible);
    document.body.classList.toggle("has-overlay", visible);
  }

  function syncOverlayState() {
    document.body.classList.toggle("has-overlay", overlay.classList.contains("is-visible"));
  }

  function createPlayer() {
    return {
      x: 72,
      y: 380,
      w: 38,
      h: 54,
      vx: 0,
      vy: 0,
      onGround: false,
      jumpsUsed: 0,
      face: 1,
      invulnerable: 0,
    };
  }

  function resetRun() {
    state.running = false;
    state.complete = false;
    state.cameraX = 0;
    state.elapsed = 0;
    state.score = 0;
    state.hearts = 3;
    state.checkpoint = { x: 72, y: 380 };
    state.jumpBuffer = 0;
    state.coyote = 0;
    state.toastTimer = 0;
    state.toastText = "";
    state.collectedBadges = new Set();
    state.collectedShards = new Set();
    state.particles = [];
    state.player = createPlayer();
    enemies.forEach((enemy, index) => {
      enemy.dir = index % 2 ? -1 : 1;
      enemy.sleep = 0;
    });
    overlay.classList.remove("is-complete");
    overlayTitle.textContent = "价值观森林大冒险";
    overlayText.textContent =
      "穿过绿意林间、木桥和萤火微光，集齐五枚价值观徽章。负鼠支持二段跳，空中再按一次跳跃可以补救落点。";
    overlayMeaning.hidden = true;
    overlayMeaning.innerHTML = "";
    renderOverlayBadges();
    startButton.textContent = "开始冒险";
    updateHud();
    draw();
  }

  function loop(time) {
    if (!state.running) return;
    const dt = Math.min((time - state.lastTime) / 1000, 1 / 28);
    state.lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (state.complete) return;
    state.elapsed += dt;
    state.jumpBuffer = Math.max(0, state.jumpBuffer - dt);
    state.coyote = Math.max(0, state.coyote - dt);
    state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
    state.toastTimer = Math.max(0, state.toastTimer - dt);

    updatePlayer(dt);
    updateEnemies(dt);
    updateCollectibles();
    updateParticles(dt);
    updateCamera();
    updateHud();
  }

  function updatePlayer(dt) {
    const player = state.player;
    const movingLeft = state.keys.left && !state.keys.right;
    const movingRight = state.keys.right && !state.keys.left;

    if (movingLeft) {
      player.vx = approach(player.vx, -moveSpeed, 1780 * dt);
      player.face = -1;
    } else if (movingRight) {
      player.vx = approach(player.vx, moveSpeed, 1780 * dt);
      player.face = 1;
    } else {
      player.vx = approach(player.vx, 0, player.onGround ? 1850 * dt : 620 * dt);
    }

    const canGroundJump = player.onGround || state.coyote > 0;
    const canAirJump = !canGroundJump && player.jumpsUsed < maxJumps;
    if (state.jumpBuffer > 0 && (canGroundJump || canAirJump)) {
      player.vy = canAirJump ? -jumpSpeed * 0.92 : -jumpSpeed;
      player.jumpsUsed = canGroundJump ? 1 : Math.max(player.jumpsUsed, 1) + 1;
      player.onGround = false;
      state.coyote = 0;
      state.jumpBuffer = 0;
      burst(player.x + player.w / 2, player.y + player.h, canAirJump ? "#9ee8ff" : "#ffffff", canAirJump ? 16 : 10);
    }

    player.vy += gravity * dt;
    player.vy = Math.min(player.vy, 900);
    movePlayerX(player.vx * dt);
    movePlayerY(player.vy * dt);

    springs.forEach((spring) => {
      if (overlaps(player, spring) && player.vy >= 0) {
        player.y = spring.y - player.h;
        player.vy = -spring.power;
        player.jumpsUsed = 1;
        player.onGround = false;
        state.coyote = 0;
        showToast("弹力加速");
        burst(spring.x + spring.w / 2, spring.y, "#ffca3a", 16);
      }
    });

    hazards.forEach((hazard) => {
      if (overlaps(player, hazard)) hurtPlayer();
    });

    enemies.forEach((enemy) => {
      if (enemy.sleep > 0 || !overlaps(player, enemy)) return;
      const playerBottom = player.y + player.h;
      const stomp = player.vy > 130 && playerBottom - enemy.y < 24;
      if (stomp) {
        player.vy = -430;
        enemy.sleep = 2.2;
        state.score += 25;
        showToast("漂亮落点");
        burst(enemy.x + enemy.w / 2, enemy.y + 8, "#2ec4b6", 18);
      } else {
        hurtPlayer();
      }
    });

    if (player.y > world.height + 80) hurtPlayer(true);
    updateProgressCheckpoint();

    if (player.x > finishX) {
      if (state.collectedBadges.size === values.length) finishRun();
      else {
        player.x = finishX;
        const left = values.length - state.collectedBadges.size;
        showToast(`还差 ${left} 枚徽章`);
      }
    }
  }

  function movePlayerX(amount) {
    const player = state.player;
    player.x += amount;
    player.x = clamp(player.x, 0, world.width - player.w);
    platforms.forEach((platform) => {
      if (!overlaps(player, platform)) return;
      if (amount > 0) player.x = platform.x - player.w;
      if (amount < 0) player.x = platform.x + platform.w;
      player.vx = 0;
    });
  }

  function movePlayerY(amount) {
    const player = state.player;
    player.y += amount;
    player.onGround = false;
    platforms.forEach((platform) => {
      if (!overlaps(player, platform)) return;
      if (amount > 0) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumpsUsed = 0;
        state.coyote = 0.12;
      }
      if (amount < 0) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      }
    });
  }

  function updateEnemies(dt) {
    enemies.forEach((enemy) => {
      if (enemy.sleep > 0) {
        enemy.sleep = Math.max(0, enemy.sleep - dt);
        return;
      }
      enemy.x += enemy.speed * enemy.dir * dt;
      if (enemy.x < enemy.min) {
        enemy.x = enemy.min;
        enemy.dir = 1;
      }
      if (enemy.x > enemy.max) {
        enemy.x = enemy.max;
        enemy.dir = -1;
      }
    });
  }

  function updateCollectibles() {
    const player = state.player;
    values.forEach((badge, index) => {
      if (state.collectedBadges.has(badge.id)) return;
      const body = { x: badge.x - 44, y: badge.y - 44, w: 88, h: 88 };
      if (!overlaps(player, body)) return;
      state.collectedBadges.add(badge.id);
      state.score += 120 + index * 10;
      saveBadgeCheckpoint(badge);
      showToast(`${badge.name}徽章到手`);
      burst(badge.x, badge.y, badge.color, 28);
    });

    shards.forEach((shard, index) => {
      if (state.collectedShards.has(index)) return;
      const body = { x: shard.x - 13, y: shard.y - 13, w: 26, h: 26 };
      if (!overlaps(player, body)) return;
      state.collectedShards.add(index);
      state.score += 10;
      burst(shard.x, shard.y, "#ffffff", 8);
    });
  }

  function updateProgressCheckpoint() {
    const player = state.player;
    if (!player.onGround || player.invulnerable > 0) return;
    const platform = findStandingPlatform();
    if (!platform) return;
    const maxX = Math.max(platform.x + 28, platform.x + platform.w - player.w - 96);
    const candidateX = clamp(player.x - 56, platform.x + 28, maxX);
    const candidateY = platform.y - player.h;
    if (candidateX <= state.checkpoint.x + 300) return;
    if (!isCheckpointSafe(candidateX, candidateY)) return;
    setCheckpoint(candidateX, candidateY);
  }

  function saveBadgeCheckpoint(badge) {
    const platform = findPlatformForCheckpoint(badge.x, badge.y + 60);
    if (platform) {
      const player = state.player;
      const maxX = Math.max(platform.x + 28, platform.x + platform.w - player.w - 68);
      setCheckpoint(clamp(badge.x - 92, platform.x + 28, maxX), platform.y - player.h);
      return;
    }
    setCheckpoint(Math.max(72, badge.x - 92), Math.max(90, badge.y - 100));
  }

  function findStandingPlatform() {
    const player = state.player;
    const feet = player.y + player.h;
    return platforms.find(
      (platform) =>
        Math.abs(feet - platform.y) < 1.5 &&
        player.x + player.w > platform.x + 8 &&
        player.x < platform.x + platform.w - 8,
    );
  }

  function findPlatformForCheckpoint(worldX, targetY) {
    return platforms
      .filter((platform) => worldX >= platform.x + 16 && worldX <= platform.x + platform.w - 16)
      .sort((a, b) => Math.abs(a.y - targetY) - Math.abs(b.y - targetY))[0];
  }

  function isCheckpointSafe(x, y) {
    const player = state.player;
    const body = { x: x - 18, y: y - 8, w: player.w + 36, h: player.h + 16 };
    const nearEnemy = { x: x - 76, y: y - 18, w: player.w + 152, h: player.h + 36 };
    return (
      !hazards.some((hazard) => overlaps(body, hazard)) &&
      !enemies.some((enemy) => enemy.sleep <= 0 && overlaps(nearEnemy, enemy))
    );
  }

  function setCheckpoint(x, y) {
    if (x < state.checkpoint.x) return;
    state.checkpoint = { x: Math.round(x), y: Math.round(y) };
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 520 * dt;
      return particle.life > 0;
    });
  }

  function updateCamera() {
    const desired = state.player.x - view.width * 0.4;
    state.cameraX = approach(state.cameraX, clamp(desired, 0, world.width - view.width), 18);
  }

  function queueJump() {
    state.keys.jump = true;
    state.jumpBuffer = 0.16;
  }

  function hurtPlayer(force) {
    const player = state.player;
    if (!force && player.invulnerable > 0) return;
    state.hearts -= 1;
    if (state.hearts <= 0) {
      restartFromBeginning("三次机会用完，从头再来");
      return;
    }
    showToast("回到最近落点");
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ff595e", 22);
    player.x = state.checkpoint.x;
    player.y = state.checkpoint.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.jumpsUsed = 0;
    player.invulnerable = 1.4;
    state.jumpBuffer = 0;
    state.coyote = 0;
    state.cameraX = clamp(player.x - view.width * 0.4, 0, world.width - view.width);
  }

  function restartFromBeginning(message) {
    state.cameraX = 0;
    state.elapsed = 0;
    state.score = 0;
    state.hearts = 3;
    state.checkpoint = { x: 72, y: 380 };
    state.jumpBuffer = 0;
    state.coyote = 0;
    state.collectedBadges = new Set();
    state.collectedShards = new Set();
    state.particles = [];
    state.player = createPlayer();
    state.player.invulnerable = 1.4;
    enemies.forEach((enemy, index) => {
      enemy.dir = index % 2 ? -1 : 1;
      enemy.sleep = 0;
    });
    showToast(message);
    updateHud();
    draw();
  }

  function finishRun() {
    state.complete = true;
    state.running = false;
    state.score += Math.max(0, 300 - Math.round(state.elapsed));
    const best = state.best;
    const current = { score: state.score, seconds: Math.round(state.elapsed) };
    const isNewBest =
      !best || current.score > best.score || (current.score === best.score && current.seconds < best.seconds);
    if (isNewBest) {
      state.best = current;
      localStorage.setItem(storageKey, JSON.stringify(current));
    }
    updateHud();
    overlay.classList.add("is-complete");
    overlayTitle.textContent = "价值观徽章集齐";
    overlayText.textContent =
      "客户第一、团队协作、拼搏进取、持续学习、创新创业，是我们成功的准则。愿你把这五枚森林徽章带进今后的工作现场，让每一次选择都更清楚、更坚定。";
    renderCompletionContent(current, isNewBest);
    startButton.textContent = "再玩一次";
    setOverlayVisible(true);
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hasPaintedForest = forestBackgroundImage.complete && forestBackgroundImage.naturalWidth;
    fillCanvasBacking();
    ctx.setTransform(render.scale, 0, 0, render.scale, render.offsetX, render.offsetY);
    if (!hasPaintedForest) ctx.clearRect(0, 0, view.width, view.height);
    drawSky();
    ctx.save();
    ctx.translate(-state.cameraX, 0);
    drawDistantCity();
    drawRails();
    drawHazards();
    drawPlatforms();
    drawForestFriends();
    drawSprings();
    drawShards();
    drawBadges();
    drawEnemies();
    drawFinish();
    drawPlayer();
    drawParticles();
    ctx.restore();
  }

  function fillCanvasBacking() {
    if (forestBackgroundImage.complete && forestBackgroundImage.naturalWidth) {
      const imageRatio = forestBackgroundImage.naturalWidth / forestBackgroundImage.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let drawW = canvas.width;
      let drawH = canvas.height;
      let drawX = 0;
      let drawY = 0;
      if (canvasRatio > imageRatio) {
        drawH = canvas.width / imageRatio;
        drawY = (canvas.height - drawH) / 2;
      } else {
        drawW = canvas.height * imageRatio;
        drawX = (canvas.width - drawW) / 2;
      }
      ctx.drawImage(forestBackgroundImage, drawX, drawY, drawW, drawH);
      ctx.fillStyle = "rgba(244, 238, 190, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const backing = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backing.addColorStop(0, "#c8dfbd");
    backing.addColorStop(0.5, "#e5efc8");
    backing.addColorStop(1, "#6c8b55");
    ctx.fillStyle = backing;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawSky() {
    if (forestBackgroundImage.complete && forestBackgroundImage.naturalWidth) {
      drawPaintedForestAtmosphere();
      drawScreenFireflies();
      return;
    }

    const sky = ctx.createLinearGradient(0, 0, 0, view.height);
    sky.addColorStop(0, "#a7d9ca");
    sky.addColorStop(0.45, "#dceecf");
    sky.addColorStop(1, "#fff1c6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, view.width, view.height);

    const glow = ctx.createRadialGradient(138, 76, 8, 138, 76, 250);
    glow.addColorStop(0, "rgba(255, 237, 149, 0.58)");
    glow.addColorStop(1, "rgba(255, 237, 149, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, view.width, view.height);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#fff8d7";
    ctx.lineWidth = 28;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(120 + i * 18, 0);
      ctx.lineTo(250 + i * 90, view.height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    for (let i = 0; i < 6; i += 1) {
      const x = ((i * 210 - state.cameraX * 0.12) % 1180) - 120;
      const y = 46 + (i % 3) * 42;
      drawCloud(x, y, 74 + (i % 2) * 26);
    }

    drawScreenFireflies();
  }

  function drawPaintedForestAtmosphere() {
    const topAir = ctx.createLinearGradient(0, 0, 0, view.height);
    topAir.addColorStop(0, "rgba(235, 255, 230, 0.16)");
    topAir.addColorStop(0.46, "rgba(255, 244, 185, 0.08)");
    topAir.addColorStop(1, "rgba(28, 48, 31, 0.18)");
    ctx.fillStyle = topAir;
    ctx.fillRect(0, 0, view.width, view.height);

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#fff3b7";
    ctx.lineWidth = 34;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(84 + i * 26, -10);
      ctx.lineTo(270 + i * 110, view.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDistantCity() {
    ctx.save();
    const mist = ctx.createLinearGradient(0, 245, 0, 462);
    mist.addColorStop(0, "rgba(233, 247, 215, 0)");
    mist.addColorStop(0.45, "rgba(230, 246, 218, 0.25)");
    mist.addColorStop(1, "rgba(244, 238, 190, 0.08)");
    ctx.fillStyle = mist;
    ctx.fillRect(-state.cameraX, 240, world.width + view.width, 230);

    drawForestWatcher(1180, 416, "round");
    drawForestWatcher(3340, 420, "deer");
    drawForestWatcher(5480, 418, "fox");
    drawForestWatcher(8450, 416, "round");
    drawForestWatcher(11320, 420, "deer");

    for (let i = 0; i < 90; i += 1) {
      const x = ((i * 173 + Math.sin(i) * 40) % world.width) - 100;
      const y = 152 + ((i * 71) % 250);
      drawFirefly(x, y, i, 0.34);
    }
    ctx.restore();
  }

  function drawRails() {
    const soil = ctx.createLinearGradient(0, world.ground + 6, 0, view.height);
    soil.addColorStop(0, "#7b5a33");
    soil.addColorStop(1, "#4f3a25");
    ctx.fillStyle = soil;
    ctx.fillRect(0, world.ground + 18, world.width, view.height - world.ground);

    ctx.fillStyle = "#35583a";
    ctx.fillRect(0, world.ground + 10, world.width, 18);
    ctx.fillStyle = "#7fb76a";
    ctx.fillRect(0, world.ground + 5, world.width, 8);

    for (let x = 0; x < world.width; x += 52) {
      drawGrassTuft(x + 8, world.ground + 11, 0.9 + (x % 5) * 0.08);
    }
    for (let x = 30; x < world.width; x += 150) {
      ctx.fillStyle = x % 300 === 0 ? "#fff0a0" : "#f7b7a3";
      ctx.beginPath();
      ctx.arc(x, world.ground + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPlatforms() {
    platforms.forEach((platform) => {
      const bark = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.h);
      bark.addColorStop(0, "#8b6139");
      bark.addColorStop(0.58, "#6e452a");
      bark.addColorStop(1, "#50321f");
      roundRect(platform.x, platform.y, platform.w, platform.h, 10, bark, "#213426", 3);

      const moss = ctx.createLinearGradient(0, platform.y, 0, platform.y + 18);
      moss.addColorStop(0, "#9ad478");
      moss.addColorStop(1, "#4f9c62");
      roundRect(platform.x + 3, platform.y + 3, platform.w - 6, 15, 8, moss, "rgba(33, 52, 38, 0.3)", 1);

      ctx.strokeStyle = "rgba(255, 220, 148, 0.25)";
      ctx.lineWidth = 3;
      for (let x = platform.x + 26; x < platform.x + platform.w - 20; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, platform.y + 28);
        ctx.quadraticCurveTo(x + 20, platform.y + 34, x + 38, platform.y + 26);
        ctx.stroke();
      }

      if (platform.w > 180) {
        for (let x = platform.x + 32; x < platform.x + platform.w - 24; x += 138) {
          drawTinyMushroom(x, platform.y + 2, 0.75);
        }
      }
    });
  }

  function drawForestFriends() {
    const friends = [
      { x: 720, y: world.ground + 5, type: "round", scale: 0.78 },
      { x: 1540, y: world.ground + 4, type: "rabbit", scale: 0.72 },
      { x: 3120, y: world.ground + 2, type: "deer", scale: 0.7 },
      { x: 4930, y: world.ground + 5, type: "fox", scale: 0.76 },
      { x: 7120, y: world.ground + 5, type: "round", scale: 0.74 },
      { x: 9560, y: world.ground + 3, type: "rabbit", scale: 0.7 },
      { x: 11840, y: world.ground + 5, type: "fox", scale: 0.72 },
    ];

    friends.forEach((friend, index) => {
      const bob = Math.sin(performance.now() / 800 + index) * 2;
      drawPeekingFriend(friend.x, friend.y + bob, friend.type, friend.scale);
    });
  }

  function drawHazards() {
    hazards.forEach((hazard) => {
      if (hazard.spikes) {
        ctx.fillStyle = "#273725";
        for (let x = hazard.x; x < hazard.x + hazard.w; x += 18) {
          ctx.beginPath();
          ctx.moveTo(x, hazard.y + hazard.h);
          ctx.quadraticCurveTo(x + 8, hazard.y + 8, x + 9, hazard.y);
          ctx.lineTo(x + 18, hazard.y + hazard.h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = "#b9574a";
        ctx.fillRect(hazard.x, hazard.y + hazard.h - 5, hazard.w, 5);
        ctx.strokeStyle = "rgba(255, 236, 170, 0.38)";
        ctx.lineWidth = 2;
        for (let x = hazard.x + 8; x < hazard.x + hazard.w; x += 40) {
          drawSparkle(x, hazard.y + 6, 3);
        }
        return;
      }
      const lava = ctx.createLinearGradient(0, hazard.y, 0, hazard.y + hazard.h);
      lava.addColorStop(0, "#ffd36d");
      lava.addColorStop(0.55, "#f08a54");
      lava.addColorStop(1, "#a44738");
      roundRect(hazard.x, hazard.y, hazard.w, hazard.h, 8, lava, "#213426", 3);
      ctx.fillStyle = "rgba(255, 244, 184, 0.5)";
      for (let x = hazard.x + 10; x < hazard.x + hazard.w; x += 30) {
        ctx.beginPath();
        ctx.arc(x, hazard.y + 12, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawSprings() {
    springs.forEach((spring) => {
      roundRect(spring.x + 4, spring.y + 14, spring.w - 8, 23, 10, "#f1e4b8", "#213426", 3);
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(spring.x + 9, spring.y + 24);
      ctx.lineTo(spring.x + 17, spring.y + 10);
      ctx.lineTo(spring.x + 25, spring.y + 24);
      ctx.stroke();
      ctx.fillStyle = "#d9655b";
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(spring.x + spring.w / 2, spring.y + 10, spring.w / 2, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 242, 190, 0.78)";
      ctx.beginPath();
      ctx.arc(spring.x + 12, spring.y + 8, 3, 0, Math.PI * 2);
      ctx.arc(spring.x + 24, spring.y + 12, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawShards() {
    shards.forEach((shard, index) => {
      if (state.collectedShards.has(index)) return;
      drawCollectibleStar(shard.x, shard.y, index);
    });
  }

  function drawCollectibleStar(x, y, index) {
    const time = performance.now() / 1000;
    const spin = time * 0.55 + index;
    const pulse = 1 + Math.sin(time * 4.6 + index) * 0.08;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
    aura.addColorStop(0, "rgba(255, 255, 221, 0.95)");
    aura.addColorStop(0.32, "rgba(255, 229, 113, 0.55)");
    aura.addColorStop(1, "rgba(255, 229, 113, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(spin);
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.beginPath();
    ctx.ellipse(-9, 0, 10, 5, -0.55, 0, Math.PI * 2);
    ctx.ellipse(9, 0, 10, 5, 0.55, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createLinearGradient(-8, -11, 8, 12);
    body.addColorStop(0, "#fff8bd");
    body.addColorStop(0.55, "#f4ca5b");
    body.addColorStop(1, "#d78542");
    drawCrystalStar(0, 0, 15, body, "#213426", 2.4);

    ctx.rotate(-spin);
    ctx.strokeStyle = "rgba(255, 248, 190, 0.92)";
    ctx.lineWidth = 2;
    drawSparkle(-20, -15, 4);
    drawSparkle(21, 10, 4);
    ctx.restore();
  }

  function drawCrystalStar(x, y, radius, fill, stroke, lineWidth) {
    const points = [
      [0, -radius],
      [radius * 0.27, -radius * 0.3],
      [radius * 0.96, -radius * 0.25],
      [radius * 0.36, radius * 0.12],
      [radius * 0.62, radius * 0.86],
      [0, radius * 0.42],
      [-radius * 0.62, radius * 0.86],
      [-radius * 0.36, radius * 0.12],
      [-radius * 0.96, -radius * 0.25],
      [-radius * 0.27, -radius * 0.3],
    ];
    ctx.beginPath();
    points.forEach(([px, py], pointIndex) => {
      if (pointIndex === 0) ctx.moveTo(x + px, y + py);
      else ctx.lineTo(x + px, y + py);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (lineWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawSparkle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }

  function drawBadges() {
    values.forEach((badge, index) => {
      if (state.collectedBadges.has(badge.id)) return;
      const bob = Math.sin(performance.now() / 380 + index) * 5;
      ctx.save();
      ctx.translate(badge.x, badge.y + bob);
      ctx.fillStyle = "rgba(23, 32, 51, 0.18)";
      ctx.beginPath();
      ctx.ellipse(0, 42, 44, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      drawBadgeImage(badge, 0, 0, 112);
      ctx.restore();
    });
  }

  function drawBadgeImage(badge, x, y, size) {
    const image = badgeImages.get(badge.id);
    if (image?.complete && image.naturalWidth) {
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    } else {
      ctx.fillStyle = badge.color;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${Math.round(size * 0.34)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badge.short, x, y + 1);
    }
  }

  function drawEnemies() {
    enemies.forEach((enemy) => {
      if (enemy.sleep > 0) {
        ctx.globalAlpha = 0.45;
      }
      const body = ctx.createLinearGradient(0, enemy.y, 0, enemy.y + enemy.h);
      body.addColorStop(0, "#f8f4db");
      body.addColorStop(1, "#d7dfc6");
      roundRect(enemy.x, enemy.y, enemy.w, enemy.h, 18, body, "#213426", 3);
      ctx.fillStyle = "#87b66f";
      ctx.beginPath();
      ctx.ellipse(enemy.x + 24, enemy.y - 2, 15, 7, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#213426";
      ctx.beginPath();
      ctx.arc(enemy.x + 14, enemy.y + 15, 3, 0, Math.PI * 2);
      ctx.arc(enemy.x + 30, enemy.y + 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x + 22, enemy.y + 25, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  function drawFinish() {
    const x = finishX + 28;
    const poleTop = 22;
    const poleBottom = world.ground;
    const flagTop = 42;
    const flagWave = Math.sin(performance.now() / 420) * 4;

    ctx.fillStyle = "rgba(33, 52, 38, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x + 10, poleBottom + 4, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const pole = ctx.createLinearGradient(x, poleTop, x + 10, poleBottom);
    pole.addColorStop(0, "#efe2b8");
    pole.addColorStop(1, "#8c6a42");
    ctx.fillStyle = pole;
    ctx.fillRect(x, poleTop, 10, poleBottom - poleTop);
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, poleTop, 10, poleBottom - poleTop);
    roundRect(x - 14, poleBottom - 14, 48, 20, 8, "#fff7de", "#213426", 3);

    ctx.fillStyle = "#f2c85b";
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 5, poleTop - 7, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 10, flagTop);
    ctx.quadraticCurveTo(x + 88, flagTop - 18 + flagWave, x + 170, flagTop + 2);
    ctx.lineTo(x + 148, flagTop + 92 + flagWave);
    ctx.quadraticCurveTo(x + 82, flagTop + 74 - flagWave, x + 10, flagTop + 90);
    ctx.closePath();
    ctx.fillStyle = "#4d9ed0";
    ctx.fill();
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x + 26, flagTop + 14);
    ctx.quadraticCurveTo(x + 88, flagTop + 2 + flagWave, x + 148, flagTop + 17);
    ctx.lineTo(x + 143, flagTop + 31);
    ctx.quadraticCurveTo(x + 88, flagTop + 18 + flagWave, x + 26, flagTop + 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font = "900 27px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#213426";
    ctx.strokeText("启航", x + 86, flagTop + 48);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("启航", x + 86, flagTop + 48);
    drawFlagStreamers(x + 18, flagTop + 108);
  }

  function drawPlayer() {
    const player = state.player;
    const flicker = player.invulnerable > 0 && Math.floor(performance.now() / 90) % 2 === 0;
    if (flicker) ctx.globalAlpha = 0.45;
    const x = player.x;
    const y = player.y;
    const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) > 20 && player.onGround ? 4 : 1);
    const hop = player.onGround ? Math.abs(stride) * 0.35 : Math.sin(performance.now() / 120) * 1.2;

    ctx.save();
    ctx.translate(x + player.w / 2, y + player.h / 2);

    ctx.fillStyle = "rgba(23, 32, 51, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(player.face, 1);
    if (playerImage.complete && playerImage.naturalWidth) {
      const spriteH = 90;
      const spriteW = Math.min(48, spriteH * (playerImage.naturalWidth / playerImage.naturalHeight));
      ctx.drawImage(playerImage, -spriteW / 2, 28 - spriteH + hop, spriteW, spriteH);
    } else {
      ctx.fillStyle = "#7d8793";
      ctx.strokeStyle = "#172033";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 29, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(13, -20, 16, 9, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "#d7dce3";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f0a6b1";
      ctx.beginPath();
      ctx.arc(27, -18, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function buildBadgeUi() {
    badgeRack.innerHTML = values
      .map(
        (badge) => `
          <span class="badge-chip" data-badge="${badge.id}" style="--badge-color:${badge.color}">
            <b><img src="${badge.image}" alt="${badge.name}" /></b>
          </span>
        `,
      )
      .join("");
  }

  function renderOverlayBadges() {
    overlayBadges.innerHTML = values
      .map(
        (badge) => `
          <span style="--badge-color:${badge.color}">
            <b><img src="${badge.image}" alt="${badge.name}" /></b>
          </span>
        `,
      )
      .join("");
  }

  function renderCompletionContent(run, isNewBest) {
    overlayBadges.innerHTML = values
      .map(
        (badge) => `
          <span class="is-earned" style="--badge-color:${badge.color}">
            <b><img src="${badge.image}" alt="${badge.name}" /></b>
          </span>
        `,
      )
      .join("");

    overlayMeaning.hidden = false;
    overlayMeaning.innerHTML = `
      <section class="achievement-card" aria-label="通关成就">
        <div class="achievement-card__seal" aria-hidden="true">✓</div>
        <div>
          <p class="achievement-card__label">${isNewBest ? "NEW RECORD" : "MISSION COMPLETE"}</p>
          <h2>你已经点亮完整的价值观地图</h2>
          <p>
            价值观不是墙上的一句话，而是我们面对目标、协作、风险和交付时的共同准则。
            希望在今后的工作中，你能把客户放在第一位，和伙伴主动协作，遇到挑战继续拼搏进取，
            持续学习升级能力，也用创新创业的精神把想法变成真正的成果。
          </p>
        </div>
      </section>
      <div class="completion-stats" aria-label="通关成绩">
        <span><b>${run.score}</b><small>本次得分</small></span>
        <span><b>${formatTime(run.seconds)}</b><small>通关用时</small></span>
        <span><b>${formatBest(state.best).replace("。", "")}</b><small>最佳成绩</small></span>
      </div>
      <div class="value-actions" aria-label="带走的行动">
        <p>下一站：真实工作现场</p>
        <ul>
          <li>先问清客户和业务真正要解决的问题。</li>
          <li>遇到挑战主动补位，和团队一起把事情向前推。</li>
          <li>每次交付后做一次小复盘，把经验变成下一次创新的能力。</li>
        </ul>
      </div>
    `;
  }

  function updateHud() {
    heartMeter.textContent = "♥".repeat(state.hearts) + "♡".repeat(3 - state.hearts);
    scoreMeter.textContent = String(state.score);
    timeMeter.textContent = formatTime(state.elapsed);
    toast.textContent = state.toastTimer > 0 ? state.toastText : "";
    toast.classList.toggle("is-visible", state.toastTimer > 0);
    document.querySelectorAll(".badge-chip").forEach((chip) => {
      chip.classList.toggle("is-collected", state.collectedBadges.has(chip.dataset.badge));
    });
  }

  function showToast(text) {
    state.toastText = text;
    state.toastTimer = 1.8;
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 230;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 3 + Math.random() * 4,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9,
        color,
      });
    }
  }

  function createShards() {
    const points = [];
    const rows = [
      [270, 405, 5],
      [470, 315, 4],
      [1090, 342, 4],
      [1348, 286, 5],
      [1948, 330, 5],
      [2230, 278, 4],
      [2498, 230, 5],
      [2898, 278, 5],
      [3248, 332, 4],
      [3780, 340, 5],
      [4100, 288, 5],
      [4388, 244, 4],
      [4710, 332, 5],
      [5010, 282, 5],
      [5330, 236, 5],
      [5820, 260, 6],
      [6430, 334, 5],
      [6740, 286, 5],
      [7040, 244, 5],
      [7350, 352, 4],
      [7610, 300, 4],
      [8190, 334, 5],
      [8660, 280, 5],
      [8960, 266, 6],
      [9420, 336, 5],
      [10090, 334, 5],
      [10420, 278, 5],
      [11090, 332, 5],
      [11410, 280, 5],
      [11720, 230, 4],
      [12130, 215, 7],
      [12560, 302, 5],
      [12850, 416, 6],
    ];
    rows.forEach(([x, y, count]) => {
      for (let i = 0; i < count; i += 1) points.push({ x: x + i * 36, y: y + Math.sin(i) * 8 });
    });
    return points;
  }

  function queueResizeCanvas() {
    requestAnimationFrame(resizeCanvas);
  }

  function resizeCanvas() {
    const rect = getCanvasLayoutSize();
    if (rect.width < 10 || rect.height < 10) {
      window.setTimeout(resizeCanvas, 80);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const scale = Math.min(canvas.width / view.width, canvas.height / view.height);
    render.scale = scale;
    render.width = view.width * scale;
    render.height = view.height * scale;
    render.offsetX = (canvas.width - render.width) / 2;
    render.offsetY = (canvas.height - render.height) / 2;
    ctx.setTransform(scale, 0, 0, scale, render.offsetX, render.offsetY);
    draw();
  }

  function getCanvasLayoutSize() {
    if (document.body.classList.contains("is-forced-landscape")) {
      return {
        width: canvas.clientWidth || canvas.offsetWidth || 0,
        height: canvas.clientHeight || canvas.offsetHeight || 0,
      };
    }
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function loadBest() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Number.isFinite(saved.score) && Number.isFinite(saved.seconds)) return saved;
    } catch {
      localStorage.removeItem(storageKey);
    }
    return null;
  }

  function formatBest(best) {
    if (!best) return "新的记录已经点亮。";
    return `最佳 ${best.score} 分，${formatTime(best.seconds)}。`;
  }

  function formatTime(value) {
    const total = Math.max(0, Math.round(value));
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function approach(value, target, step) {
    if (value < target) return Math.min(value + step, target);
    if (value > target) return Math.max(value - step, target);
    return value;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function drawScreenFireflies() {
    const time = performance.now() / 1000;
    for (let i = 0; i < 42; i += 1) {
      const x = ((i * 83 + Math.sin(time * 0.55 + i) * 18 - state.cameraX * 0.035) % (view.width + 80)) - 40;
      const y = 86 + ((i * 47) % 320) + Math.cos(time * 0.7 + i) * 12;
      drawFirefly(x, y, i, 0.52);
    }
  }

  function drawFirefly(x, y, index, alpha = 1) {
    const time = performance.now() / 1000;
    const pulse = 0.55 + Math.sin(time * 2.2 + index) * 0.24;
    ctx.save();
    ctx.globalAlpha = alpha * (0.72 + pulse * 0.28);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 17 + pulse * 7);
    glow.addColorStop(0, "rgba(255, 246, 160, 0.9)");
    glow.addColorStop(0.38, "rgba(255, 211, 94, 0.38)");
    glow.addColorStop(1, "rgba(255, 211, 94, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 22 + pulse * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4a7";
    ctx.beginPath();
    ctx.arc(x, y, 2.2 + pulse * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFarTree(x, baseY, scale, color) {
    ctx.fillStyle = "#6b5132";
    ctx.fillRect(x + 20 * scale, baseY - 95 * scale, 18 * scale, 98 * scale);
    drawLeafCluster(x + 28 * scale, baseY - 106 * scale, 58 * scale, color, 0.88);
    drawLeafCluster(x - 6 * scale, baseY - 78 * scale, 42 * scale, color, 0.78);
    drawLeafCluster(x + 58 * scale, baseY - 72 * scale, 40 * scale, color, 0.72);
  }

  function drawLeafCluster(x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x - size * 0.36, y + size * 0.16, size * 0.36, 0, Math.PI * 2);
    ctx.arc(x + size * 0.38, y + size * 0.14, size * 0.36, 0, Math.PI * 2);
    ctx.arc(x + size * 0.05, y - size * 0.32, size * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawForestCottage(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(33, 52, 38, 0.16)";
    ctx.beginPath();
    ctx.ellipse(58, 78, 74, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    roundRect(0, 24, 116, 62, 8, "#d8b579", "#213426", 3);
    ctx.fillStyle = "#8d5135";
    ctx.beginPath();
    ctx.moveTo(-12, 31);
    ctx.quadraticCurveTo(58, -34, 128, 31);
    ctx.lineTo(114, 47);
    ctx.quadraticCurveTo(58, 4, 2, 47);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 3;
    ctx.stroke();

    roundRect(46, 49, 26, 37, 8, "#5d3c2b", "#213426", 2.5);
    ctx.fillStyle = "#ffe6a8";
    ctx.fillRect(16, 44, 18, 16);
    ctx.fillRect(84, 44, 18, 16);
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 44, 18, 16);
    ctx.strokeRect(84, 44, 18, 16);

    ctx.fillStyle = "#7ab66f";
    ctx.beginPath();
    ctx.ellipse(6, 82, 20, 10, -0.15, 0, Math.PI * 2);
    ctx.ellipse(112, 82, 24, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawForestWatcher(x, y, type) {
    ctx.save();
    ctx.translate(x, y);
    if (type === "deer") {
      ctx.strokeStyle = "#6a4b2e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(-20, -36);
      ctx.moveTo(-10, -22);
      ctx.lineTo(-2, -36);
      ctx.moveTo(10, -22);
      ctx.lineTo(2, -36);
      ctx.moveTo(10, -22);
      ctx.lineTo(20, -36);
      ctx.stroke();
      ctx.fillStyle = "#b8895e";
      ctx.beginPath();
      ctx.ellipse(0, -10, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "fox") {
      ctx.fillStyle = "#ce7d48";
      ctx.beginPath();
      ctx.moveTo(-24, -5);
      ctx.lineTo(-6, -28);
      ctx.lineTo(0, -8);
      ctx.lineTo(8, -28);
      ctx.lineTo(26, -5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f7dfb6";
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#8fa093";
      ctx.beginPath();
      ctx.arc(-16, -21, 11, 0, Math.PI * 2);
      ctx.arc(16, -21, 11, 0, Math.PI * 2);
      ctx.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f2edda";
      ctx.beginPath();
      ctx.ellipse(0, 4, 13, 17, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#213426";
    ctx.beginPath();
    ctx.arc(-7, -7, 2.8, 0, Math.PI * 2);
    ctx.arc(7, -7, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPeekingFriend(x, y, type, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#6f9d69";
    ctx.beginPath();
    ctx.ellipse(-18, 4, 28, 14, -0.18, 0, Math.PI * 2);
    ctx.ellipse(18, 5, 30, 15, 0.2, 0, Math.PI * 2);
    ctx.ellipse(0, 8, 34, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === "rabbit") {
      ctx.fillStyle = "#e9dfc7";
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-9, -27, 6, 20, -0.25, 0, Math.PI * 2);
      ctx.ellipse(9, -27, 6, 20, 0.25, 0, Math.PI * 2);
      ctx.ellipse(0, -5, 18, 21, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === "deer") {
      ctx.strokeStyle = "#6a4b2e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(-19, -34);
      ctx.moveTo(-10, -22);
      ctx.lineTo(-2, -34);
      ctx.moveTo(10, -22);
      ctx.lineTo(2, -34);
      ctx.moveTo(10, -22);
      ctx.lineTo(19, -34);
      ctx.stroke();
      ctx.fillStyle = "#bf9064";
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, -5, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f4dfb7";
      ctx.beginPath();
      ctx.ellipse(0, 4, 9, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "fox") {
      ctx.fillStyle = "#cf7e49";
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-24, -4);
      ctx.lineTo(-9, -28);
      ctx.lineTo(0, -12);
      ctx.lineTo(9, -28);
      ctx.lineTo(24, -4);
      ctx.quadraticCurveTo(0, 16, -24, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8dfb8";
      ctx.beginPath();
      ctx.ellipse(0, -1, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#88988f";
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-14, -22, 10, 0, Math.PI * 2);
      ctx.arc(14, -22, 10, 0, Math.PI * 2);
      ctx.ellipse(0, -3, 25, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#eee5cf";
      ctx.beginPath();
      ctx.ellipse(0, 1, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#213426";
    ctx.beginPath();
    ctx.arc(-7, -9, 2.8, 0, Math.PI * 2);
    ctx.arc(7, -9, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#213426";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -2, 6, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function drawGrassTuft(x, y, scale = 1) {
    ctx.strokeStyle = "#4f8c59";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 3 * scale, y - 12 * scale, x + 10 * scale, y - 19 * scale);
    ctx.moveTo(x + 8 * scale, y);
    ctx.quadraticCurveTo(x + 11 * scale, y - 10 * scale, x + 19 * scale, y - 14 * scale);
    ctx.moveTo(x + 15 * scale, y + 1);
    ctx.quadraticCurveTo(x + 9 * scale, y - 8 * scale, x + 2 * scale, y - 13 * scale);
    ctx.stroke();
  }

  function drawTinyMushroom(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#f5e4b7";
    roundRect(-3, -1, 7, 12, 3, "#f5e4b7", "rgba(33, 52, 38, 0.5)", 1);
    ctx.fillStyle = "#d86f5a";
    ctx.beginPath();
    ctx.ellipse(0, -2, 11, 6, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y + size * 0.25, size * 0.24, 0, Math.PI * 2);
    ctx.arc(x + size * 0.24, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.58, y + size * 0.2, size * 0.26, 0, Math.PI * 2);
    ctx.arc(x + size * 0.86, y + size * 0.28, size * 0.2, 0, Math.PI * 2);
    ctx.rect(x, y + size * 0.22, size * 0.92, size * 0.3);
    ctx.fill();
  }

  function drawFlagStreamers(x, y) {
    const colors = ["#d96c55", "#f2c85b", "#72bf8f", "#5ea6bf", "#7b6aa7"];
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + index * 18, y);
      ctx.lineTo(x + 14 + index * 18, y);
      ctx.lineTo(x + 7 + index * 18, y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#213426";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function drawStar(x, y, radius, points, fill, stroke, lineWidth = 2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI) / points;
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (lineWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, radius, fill, stroke, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }
})();
