(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const ticketCountEl = document.getElementById("ticket-count");
  const ticketTotalEl = document.getElementById("ticket-total");
  const statusEl = document.getElementById("status");
  const restartButton = document.getElementById("restart-button");
  const mainMenu = document.getElementById("main-menu");
  const playButton = document.getElementById("play-button");
  const characterButton = document.getElementById("character-button");
  const levelButton = document.getElementById("level-button");
  const characterPanel = document.getElementById("character-panel");
  const characterOptionsEl = document.getElementById("character-options");
  const levelPanel = document.getElementById("level-panel");
  const levelListEl = document.getElementById("level-list");
  const leaderboardListEl = document.getElementById("leaderboard-list");
  const leaderboardEmptyEl = document.getElementById("leaderboard-empty");
  const lastRunSummaryEl = document.getElementById("last-run-summary");
  const lastRunListEl = document.getElementById("last-run-list");
  const levelTimerEl = document.getElementById("level-timer");
  const totalTimerEl = document.getElementById("total-timer");
  const currentLevelNameEl = document.getElementById("current-level-name");
  const hudEl = document.querySelector(".hud");
  const gameAreaEl = document.querySelector(".game-area");

  const keys = {
    left: false,
    right: false,
  };

  const STORAGE_KEY = "sambaVoltigeurProgress";

  const GAME_STATES = {
    MENU: "menu",
    PLAYING: "playing",
    CELEBRATING: "celebrating",
  };

  const skins = [
    {
      id: "samba",
      name: "Samba",
      body: "#c67c48",
      spots: "#d89a64",
      outline: "#6f3a1b",
    },
    {
      id: "neige",
      name: "Neige",
      body: "#f2f2f2",
      spots: "#dcdcdc",
      outline: "#7f7f7f",
    },
    {
      id: "cacao",
      name: "Cacao",
      body: "#5c3115",
      spots: "#7a4520",
      outline: "#2f1708",
    },
    {
      id: "soleil",
      name: "Soleil",
      body: "#f7c873",
      spots: "#f2a65c",
      outline: "#9c6428",
    },
  ];

  const levels = [
    {
      id: "carnaval",
      index: 0,
      name: "Carnaval",
      theme: "carnaval",
      intro: "Collecte tous les tickets pour déclencher la fête.",
      spawn: { x: 80, y: 360 },
      createPlatforms: () => [
        { x: 0, y: 470, width: canvas.width, height: 70, color: "#ffcf4a", accent: "#ffe9a3", label: "Scène Samba" },
        { x: 110, y: 360, width: 170, height: 26, color: "#ff5ea3", accent: "#ffd2ec", label: "Char Tambours" },
        { x: 330, y: 305, width: 150, height: 26, color: "#2ddf7c", accent: "#b8ffde", label: "Stand Limonade" },
        { x: 530, y: 245, width: 190, height: 28, color: "#6a00f4", accent: "#d9c7ff", label: "Char Confettis" },
        { x: 770, y: 340, width: 140, height: 26, color: "#ff7f50", accent: "#ffd1c2", label: "Float Bonbons" },
        { x: 660, y: 430, width: 120, height: 22, color: "#00c2ff", accent: "#c6f3ff", label: "Chariot Glaces" },
        { x: 420, y: 410, width: 120, height: 22, color: "#ffd447", accent: "#fff2a6", label: "Tambours" },
      ],
      tickets: [
        { x: 180, y: 320, phase: 0.1 },
        { x: 375, y: 265, phase: 0.5 },
        { x: 600, y: 205, phase: 0.9 },
        { x: 810, y: 300, phase: 1.4 },
        { x: 700, y: 390, phase: 1.9 },
        { x: 480, y: 370, phase: 2.2 },
        { x: 260, y: 350, phase: 2.8 },
      ],
    },
    {
      id: "pirate",
      index: 1,
      name: "Bateau pirate",
      theme: "pirate",
      intro: "Récupère les billets avant que le capitaine ne revienne !",
      spawn: { x: 90, y: 360 },
      createPlatforms: () => [
        { x: 0, y: 470, width: canvas.width, height: 70, color: "#13334c", accent: "#0f4c75", label: "Océan" },
        { x: 120, y: 340, width: 200, height: 28, color: "#8c5a2b", accent: "#c7894f", label: "Pont principal" },
        { x: 360, y: 280, width: 180, height: 26, color: "#8c5a2b", accent: "#c7894f", label: "Mât central" },
        { x: 620, y: 320, width: 190, height: 26, color: "#8c5a2b", accent: "#c7894f", label: "Quartier des canons" },
        { x: 780, y: 260, width: 150, height: 24, color: "#8c5a2b", accent: "#c7894f", label: "Barre du capitaine" },
        { x: 500, y: 400, width: 150, height: 24, color: "#8c5a2b", accent: "#c7894f", label: "Pont inférieur" },
        { x: 300, y: 420, width: 130, height: 24, color: "#8c5a2b", accent: "#c7894f", label: "Quartier arrière" },
      ],
      tickets: [
        { x: 160, y: 300, phase: 0.3 },
        { x: 420, y: 240, phase: 0.6 },
        { x: 690, y: 270, phase: 0.9 },
        { x: 840, y: 220, phase: 1.3 },
        { x: 560, y: 360, phase: 1.8 },
        { x: 360, y: 380, phase: 2.1 },
        { x: 220, y: 330, phase: 2.4 },
      ],
    },
    {
      id: "jouets",
      index: 2,
      name: "Magasin de jouets",
      theme: "jouets",
      intro: "Bondis de rayon en rayon pour attraper chaque ticket surprise !",
      spawn: { x: 90, y: 360 },
      createPlatforms: () => [
        { x: 0, y: 470, width: canvas.width, height: 70, color: "#f4a261", accent: "#ffd5a1", label: "Allée principale" },
        { x: 120, y: 360, width: 150, height: 24, color: "#ff85a1", accent: "#ffc1d8", label: "Rayon peluches" },
        { x: 320, y: 310, width: 140, height: 24, color: "#66d0ff", accent: "#b9ecff", label: "Briques géantes" },
        { x: 520, y: 250, width: 180, height: 26, color: "#2ddf7c", accent: "#9ef7c1", label: "Circuit voitures" },
        { x: 740, y: 200, width: 160, height: 24, color: "#ffe066", accent: "#fff2a6", label: "Château jouet" },
        { x: 640, y: 360, width: 160, height: 24, color: "#d38eff", accent: "#f0d5ff", label: "Rayon robots" },
        { x: 420, y: 420, width: 160, height: 24, color: "#ffb347", accent: "#ffd9a3", label: "Trampoline pop" },
      ],
      tickets: [
        { x: 160, y: 320, phase: 0.3 },
        { x: 360, y: 270, phase: 0.7 },
        { x: 540, y: 220, phase: 1.1 },
        { x: 760, y: 170, phase: 1.5 },
        { x: 680, y: 320, phase: 1.9 },
        { x: 460, y: 380, phase: 2.3 },
        { x: 260, y: 350, phase: 2.6 },
      ],
    },
  ];

  const defaultProgress = {
    unlockedLevels: 1,
    bestLevelTimes: {},
    leaderboard: [],
    selectedSkinId: skins[0].id,
  };

  let progress = loadProgress();
  progress = {
    ...defaultProgress,
    ...progress,
    unlockedLevels: Math.max(1, Math.min(levels.length, progress?.unlockedLevels ?? 1)),
  };

  let currentSkin = skins.find((skin) => skin.id === progress.selectedSkinId) ?? skins[0];
  let selectedLevelIndex = Math.min(progress.unlockedLevels - 1, levels.length - 1);
  let currentLevelIndex = selectedLevelIndex;
  let currentLevel = levels[currentLevelIndex];
  let gameState = GAME_STATES.MENU;

  let levelTimer = 0;
  let score = 0;
  let celebration = false;
  let celebrationTimer = 0;
  let nextCelebrationBurst = 0;
  let ferrisRotation = 0;
  let time = 0;
  let jumpBuffer = 0;
  let coyoteTimer = 0;

  let currentRun = createEmptyRun(selectedLevelIndex);
  let lastRunResults = null;
  let pendingMenuTimeout = null;

  const skinButtons = new Map();
  const levelButtonRefs = [];

  const confettiPieces = [];
  const collectibles = [];
  let platforms = [];
  let dog;

  const gravity = 0.65;
  const terminalVelocity = 17;

  const confettiColors = ["#ffe066", "#ff5ea3", "#2ddf7c", "#66d0ff", "#ffffff"];

  restartButton.addEventListener("click", () => {
    restartCurrentLevel();
    restartButton.blur();
  });

  playButton.addEventListener("click", handlePlayClick);
  characterButton.addEventListener("click", () => togglePanel(characterButton, characterPanel));
  levelButton.addEventListener("click", () => togglePanel(levelButton, levelPanel));

  const gameplayKeyCodes = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "Space",
    "KeyA",
    "KeyD",
    "KeyQ",
    "KeyW",
    "KeyZ",
  ];

  function isMenuControl(target) {
    if (!target || target === canvas || target === document.body || target === document.documentElement) {
      return false;
    }

    if (target instanceof Element) {
      if (target instanceof HTMLElement && target.isContentEditable) {
        return true;
      }

      const interactive = target.closest(
        "button, [role='button'], [role='menuitem'], a[href], input, select, textarea, summary, [tabindex]:not([tabindex='-1'])"
      );

      if (interactive && interactive !== canvas) {
        return true;
      }
    }

    return false;
  }

  window.addEventListener("keydown", (event) => {
    const code = event.code;
    const isGameplayKey = gameplayKeyCodes.includes(code);

    if (isGameplayKey && gameState === GAME_STATES.PLAYING) {
      if (!isMenuControl(event.target) && !isMenuControl(document.activeElement)) {
        event.preventDefault();
      }
    }

    if (gameState !== GAME_STATES.PLAYING) {
      if (code === "Escape") {
        closePanels();
      }
      return;
    }

    switch (code) {
      case "ArrowLeft":
      case "KeyA":
      case "KeyQ":
        keys.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        keys.right = true;
        break;
      case "ArrowUp":
      case "Space":
      case "KeyW":
      case "KeyZ":
        jumpBuffer = 6;
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", (event) => {
    if (gameState !== GAME_STATES.PLAYING) {
      return;
    }

    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
      case "KeyQ":
        keys.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        keys.right = false;
        break;
      default:
        break;
    }
  });

  function startLevel(levelIndex, { continueRun = false } = {}) {
    clearPendingMenuTimeout();

    const level = levels[levelIndex];
    const canContinue =
      continueRun &&
      currentRun.active &&
      currentRun.completedLevelTimes[levelIndex] == null &&
      levelIndex >= currentRun.startedIndex;

    if (!canContinue) {
      currentRun = createEmptyRun(levelIndex);
    }

    currentRun.startedIndex = canContinue ? currentRun.startedIndex : levelIndex;
    currentRun.active = true;

    selectedLevelIndex = levelIndex;
    currentLevelIndex = levelIndex;

    prepareLevel(levelIndex);

    gameState = GAME_STATES.PLAYING;
    updateUIForState();
    updateLevelButtonStates();
    updateTimerDisplays();
    closePanels();
  }

  function restartCurrentLevel() {
    if (typeof currentLevelIndex !== "number") {
      return;
    }
    startLevel(currentLevelIndex, { continueRun: true });
  }

  function prepareLevel(levelIndex) {
    const level = levels[levelIndex];
    currentLevel = level;

    dog = {
      x: level.spawn.x,
      y: level.spawn.y,
      width: 48,
      height: 46,
      vx: 0,
      vy: 0,
      maxSpeed: 6,
      acceleration: 0.8,
      jumpStrength: 12.5,
      onGround: false,
      facing: 1,
      runCycle: 0,
      bob: 0,
      tailSwing: 0,
      earWiggle: 0,
    };

    platforms = level.createPlatforms().map((platform) => ({ ...platform }));

    collectibles.length = 0;
    for (const ticketData of level.tickets) {
      collectibles.push(createTicket(ticketData.x, ticketData.y, ticketData.phase));
    }

    score = 0;
    celebration = false;
    celebrationTimer = 0;
    nextCelebrationBurst = 0;
    ferrisRotation = 0;
    time = 0;
    jumpBuffer = 0;
    coyoteTimer = 0;
    confettiPieces.length = 0;
    keys.left = false;
    keys.right = false;

    ticketCountEl.textContent = "0";
    ticketTotalEl.textContent = String(collectibles.length);
    statusEl.textContent = level.intro;
    currentLevelNameEl.textContent = level.name;
    levelTimer = 0;

    updateTimerDisplays();
  }

  function createTicket(x, y, phase = 0) {
    return {
      x,
      y,
      baseY: y,
      size: 34,
      rotation: Math.random() * Math.PI,
      rotationSpeed: 0.02 + Math.random() * 0.02,
      floatPhase: phase,
      currentY: y,
      collected: false,
    };
  }

  function update(delta, seconds) {
    time += delta;
    ferrisRotation = (ferrisRotation + 0.0045 * delta) % (Math.PI * 2);

    if (!dog) {
      updateConfetti(delta);
      if (celebration) {
        updateCelebration(delta);
      }
      return;
    }

    if (gameState === GAME_STATES.PLAYING) {
      if (jumpBuffer > 0) {
        jumpBuffer = Math.max(0, jumpBuffer - delta);
      }

      const wasOnGround = dog.onGround;
      if (wasOnGround) {
        coyoteTimer = 6;
      } else {
        coyoteTimer = Math.max(0, coyoteTimer - delta);
      }

      if (jumpBuffer > 0 && coyoteTimer > 0) {
        dog.vy = -dog.jumpStrength;
        dog.onGround = false;
        coyoteTimer = 0;
        jumpBuffer = 0;
      }

      const moveAcceleration = dog.acceleration * delta * (wasOnGround ? 1 : 0.55);
      const friction = wasOnGround ? 0.78 : 0.93;

      if (keys.left) {
        dog.vx = Math.max(dog.vx - moveAcceleration, -dog.maxSpeed);
        dog.facing = -1;
      }

      if (keys.right) {
        dog.vx = Math.min(dog.vx + moveAcceleration, dog.maxSpeed);
        dog.facing = 1;
      }

      if (!keys.left && !keys.right) {
        dog.vx *= friction;
        if (Math.abs(dog.vx) < 0.05) {
          dog.vx = 0;
        }
      }

      dog.vy = Math.min(dog.vy + gravity * delta, terminalVelocity);

      dog.x += dog.vx * delta;
      resolveCollisions(dog, "x");

      dog.y += dog.vy * delta;
      dog.onGround = false;
      resolveCollisions(dog, "y");

      applyWorldBounds(dog);

      const speedRatio = Math.min(Math.abs(dog.vx) / dog.maxSpeed, 1);
      dog.runCycle += speedRatio * delta * 0.28;
      if (dog.runCycle > Math.PI * 2) {
        dog.runCycle -= Math.PI * 2;
      }

      dog.bob = dog.onGround
        ? Math.abs(Math.sin(dog.runCycle * 2)) * speedRatio * 6
        : Math.max(0, dog.bob - 0.8 * delta);
      dog.tailSwing = Math.sin(time * 0.5 + dog.runCycle * 1.6) * (0.6 + speedRatio * 0.9);
      dog.earWiggle = Math.sin(time * 0.7 + dog.runCycle) * (0.2 + speedRatio * 0.25);

      updateCollectibles(delta);

      levelTimer += seconds;
      updateTimerDisplays();
    } else if (gameState === GAME_STATES.CELEBRATING) {
      keys.left = false;
      keys.right = false;
      jumpBuffer = 0;
    }

    updateConfetti(delta);
    if (celebration) {
      updateCelebration(delta);
    }
  }

  function updateCollectibles(delta) {
    for (const ticket of collectibles) {
      if (ticket.collected) {
        continue;
      }

      ticket.floatPhase += 0.06 * delta;
      ticket.currentY = ticket.baseY + Math.sin(ticket.floatPhase) * 12;
      ticket.rotation += ticket.rotationSpeed * delta;

      const ticketRect = {
        x: ticket.x - ticket.size / 2,
        y: ticket.currentY - ticket.size * 0.3,
        width: ticket.size,
        height: ticket.size * 0.6,
      };

      if (rectsOverlap(dog, ticketRect)) {
        ticket.collected = true;
        score += 1;
        ticketCountEl.textContent = String(score);
        const remaining = collectibles.length - score;
        if (remaining > 1) {
          statusEl.textContent = `Encore ${remaining} tickets scintillants avant le grand final !`;
        } else if (remaining === 1) {
          statusEl.textContent = "Plus qu'un ticket scintillant avant le feu d'artifice !";
        }

        spawnConfettiBurst(ticket.x, ticket.currentY, 26);

        if (remaining === 0) {
          completeLevel();
        }
      }
    }
  }

  function completeLevel() {
    if (celebration) {
      return;
    }

    const levelTime = levelTimer;
    const message = `Bravo ! ${currentLevel.name} terminé en ${formatTime(levelTime)} — feu d'artifice !`;

    startCelebration(message);
    gameState = GAME_STATES.CELEBRATING;

    currentRun.completedLevelTimes[currentLevelIndex] = levelTime;
    currentRun.totalTime += levelTime;
    lastRunResults = {
      times: [...currentRun.completedLevelTimes],
      total: currentRun.totalTime,
      startedIndex: currentRun.startedIndex,
      timestamp: Date.now(),
    };

    const best = progress.bestLevelTimes[currentLevel.id];
    if (best == null || levelTime < best) {
      progress.bestLevelTimes[currentLevel.id] = levelTime;
    }

    const newlyUnlocked = Math.min(levels.length, currentLevelIndex + 2);
    if (newlyUnlocked > progress.unlockedLevels) {
      progress.unlockedLevels = newlyUnlocked;
    }

    saveProgress();
    updateLevelButtonStates();
    updateLastRunSummary();
    updateTimerDisplays();

    const finishedAllLevels =
      currentRun.startedIndex === 0 &&
      currentRun.completedLevelTimes.slice(0, levels.length).every((time) => time != null);

    if (finishedAllLevels) {
      currentRun.active = false;
      handleRunFinished();
    }

    const nextLevelIndex = Math.min(progress.unlockedLevels - 1, currentLevelIndex + 1);
    pendingMenuTimeout = window.setTimeout(() => {
      enterMenu({ focusLevel: nextLevelIndex });
    }, 2600);
  }

  function startCelebration(message) {
    celebration = true;
    celebrationTimer = 0;
    nextCelebrationBurst = 0;
    statusEl.textContent = message || "Bravo ! Samba a récolté tous les tickets : place au feu d'artifice !";
    spawnConfettiBurst(canvas.width / 2, canvas.height / 4, 70);
  }

  function updateCelebration(delta) {
    if (!celebration) {
      return;
    }

    celebrationTimer += delta;
    if (celebrationTimer >= nextCelebrationBurst) {
      const burstX = canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
      const burstY = 100 + Math.random() * 120;
      spawnConfettiBurst(burstX, burstY, 42);
      nextCelebrationBurst = celebrationTimer + 5 + Math.random() * 4;
    }
  }

  function spawnConfettiBurst(x, y, count = 24) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      confettiPieces.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.35,
        size: 4 + Math.random() * 6,
        life: 90 + Math.random() * 40,
        color: confettiColors[i % confettiColors.length],
      });
    }
  }

  function updateConfetti(delta) {
    for (let i = confettiPieces.length - 1; i >= 0; i -= 1) {
      const piece = confettiPieces[i];
      piece.vy += 0.12 * delta;
      piece.x += piece.vx * delta;
      piece.y += piece.vy * delta;
      piece.rotation += piece.rotationSpeed * delta;
      piece.life -= delta;

      if (piece.life <= 0 || piece.y > canvas.height + 50) {
        confettiPieces.splice(i, 1);
      }
    }
  }

  function resolveCollisions(body, axis) {
    for (const platform of platforms) {
      if (!rectsOverlap(body, platform)) {
        continue;
      }

      if (axis === "x") {
        if (body.vx > 0) {
          body.x = platform.x - body.width;
        } else if (body.vx < 0) {
          body.x = platform.x + platform.width;
        }
        body.vx = 0;
      } else if (axis === "y") {
        if (body.vy > 0) {
          body.y = platform.y - body.height;
          body.vy = 0;
          body.onGround = true;
        } else if (body.vy < 0) {
          body.y = platform.y + platform.height;
          body.vy = 0;
        }
      }
    }
  }

  function applyWorldBounds(body) {
    if (body.x < 0) {
      body.x = 0;
      body.vx = 0;
    }
    if (body.x + body.width > canvas.width) {
      body.x = canvas.width - body.width;
      body.vx = 0;
    }
    if (body.y + body.height > canvas.height) {
      body.y = canvas.height - body.height;
      body.vy = 0;
      body.onGround = true;
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function draw() {
    drawBackground();

    if (gameState !== GAME_STATES.MENU && dog) {
      drawPlatforms();
      drawCollectibles();
      drawDog();
    }

    drawConfetti();
  }

  function drawBackground() {
    const theme = currentLevel?.theme ?? "carnaval";

    switch (theme) {
      case "pirate":
        drawPirateBackground();
        break;
      case "jouets":
        drawToyBackground();
        break;
      default:
        drawCarnivalBackground();
        break;
    }
  }

  function drawCarnivalBackground() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#07072b");
    skyGradient.addColorStop(0.45, "#102e73");
    skyGradient.addColorStop(1, "#174f91");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGarlands();
    drawFerrisWheel(160, 280, 120);
    drawTent(560, 360, 220, 110);
    drawBalloonCluster(860, 180);
    drawSpotlights();
    drawCrowd();
  }

  function drawPirateBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#010b19");
    sky.addColorStop(0.5, "#04223a");
    sky.addColorStop(1, "#0f4c75");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 210, 0.85)";
    ctx.beginPath();
    ctx.arc(140, 110, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(15, 76, 117, 0.35)";
    ctx.beginPath();
    ctx.arc(160, 108, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (let i = 0; i < 60; i += 1) {
      const x = (i * 173) % canvas.width;
      const y = 40 + ((i * 97) % 200);
      const pulse = (Math.sin(time * 0.4 + i) + 1.4) * 0.3;
      ctx.globalAlpha = 0.4 + pulse * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const ocean = ctx.createLinearGradient(0, canvas.height * 0.58, 0, canvas.height);
    ocean.addColorStop(0, "#0b3d59");
    ocean.addColorStop(1, "#021c2c");
    ctx.fillStyle = ocean;
    ctx.fillRect(0, canvas.height * 0.58, canvas.width, canvas.height * 0.42);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const waveY = canvas.height * 0.6 + i * 22;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 12) {
        const y = waveY + Math.sin((x / canvas.width) * Math.PI * 2 + time * 0.18 + i) * 6;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width * 0.5, canvas.height * 0.6);

    ctx.fillStyle = "#8c5a2b";
    ctx.beginPath();
    ctx.moveTo(-220, 0);
    ctx.lineTo(190, 0);
    ctx.lineTo(130, 90);
    ctx.lineTo(-170, 90);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#c7894f";
    ctx.fillRect(-150, -20, 300, 20);

    ctx.fillStyle = "#f2e9d0";
    ctx.fillRect(-12, -210, 12, 210);
    ctx.fillRect(90, -170, 10, 170);

    const sailSway = Math.sin(time * 0.35) * 16;

    ctx.save();
    ctx.translate(-12, -200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(150 + sailSway, 50, 0, 200);
    ctx.lineTo(0, 0);
    ctx.fillStyle = "rgba(242, 233, 208, 0.95)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(88, -150);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(130 + sailSway * 0.5, 40, 0, 150);
    ctx.lineTo(0, 0);
    ctx.fillStyle = "rgba(230, 229, 240, 0.92)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(-6, -210);
    const flagWave = Math.sin(time * 0.8) * 14;
    ctx.fillStyle = "#102a43";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -60);
    ctx.lineTo(90 + flagWave, -44);
    ctx.lineTo(0, -20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(46 + flagWave * 0.3, -42, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(-120 + i * 80, 25, 12, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawToyBackground() {
    const wall = ctx.createLinearGradient(0, 0, 0, canvas.height);
    wall.addColorStop(0, "#fff7ff");
    wall.addColorStop(0.5, "#ffe3f1");
    wall.addColorStop(1, "#ffd7a8");
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    const stripeWidth = 60;
    for (let i = -2; i < canvas.width / stripeWidth + 2; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 182, 193, 0.25)" : "rgba(102, 208, 255, 0.2)";
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height * 0.55);
    }
    ctx.restore();

    ctx.save();
    const lightY = 90;
    for (let i = 0; i < 5; i += 1) {
      const x = 120 + i * 180;
      const pulse = Math.sin(time * 0.6 + i) * 0.35 + 0.9;
      ctx.fillStyle = `rgba(255, 224, 102, ${0.18 + pulse * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, lightY, 80 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.arc(x, lightY, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(244, 162, 97, 0.88)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 214, 160, 0.7)";
    for (let i = 0; i <= canvas.width; i += 90) {
      ctx.fillRect(i, canvas.height * 0.55 + (i % 180 === 0 ? 8 : 0), 60, canvas.height * 0.45);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(0, canvas.height * 0.55);
    const shelfColors = ["#ff85a1", "#66d0ff", "#2ddf7c", "#ffe066", "#d38eff", "#ffb347"];
    for (let row = 0; row < 3; row += 1) {
      const shelfY = -row * 90 - 40;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(80, shelfY, canvas.width - 160, 18);
      for (let i = 0; i < 6; i += 1) {
        const color = shelfColors[(row + i) % shelfColors.length];
        const boxX = 120 + i * 120 + Math.sin(time * 0.45 + row + i) * 4;
        ctx.fillStyle = color;
        ctx.fillRect(boxX, shelfY - 70, 70, 60);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(boxX, shelfY - 70, 70, 12);
      }
    }
    ctx.restore();

    ctx.save();
    const balloonColors = ["#ff5ea3", "#66d0ff", "#2ddf7c", "#ffe066"];
    for (let i = 0; i < 4; i += 1) {
      const baseX = 140 + i * 220;
      const offsetX = Math.sin(time * 0.5 + i) * 10;
      const offsetY = Math.cos(time * 0.6 + i) * 10;
      ctx.fillStyle = balloonColors[i % balloonColors.length];
      ctx.beginPath();
      ctx.ellipse(baseX + offsetX, 220 + offsetY, 24, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 40, 80, 0.25)";
      ctx.beginPath();
      ctx.moveTo(baseX + offsetX, 252 + offsetY);
      ctx.lineTo(baseX + offsetX - 6, 300 + offsetY * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCrowd() {
    ctx.save();
    const baseY = canvas.height - 110;
    ctx.fillStyle = "rgba(8, 19, 58, 0.85)";
    for (let i = 0; i < 18; i += 1) {
      const crowdWidth = 70;
      const x = i * 55 - 40;
      const wave = Math.sin(time * 0.3 + i * 0.5) * 6;
      ctx.beginPath();
      ctx.ellipse(x + 60, baseY + wave, crowdWidth, 32, 0, Math.PI, 0, true);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSpotlights() {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.moveTo(280, canvas.height - 40);
    ctx.lineTo(450, 160);
    ctx.lineTo(620, canvas.height - 40);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(500, canvas.height - 40);
    ctx.lineTo(690, 180);
    ctx.lineTo(860, canvas.height - 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGarlands() {
    const garlands = [
      {
        start: { x: 70, y: 120 },
        control: { x: 260, y: 190 + Math.sin(time * 0.4) * 12 },
        end: { x: 460, y: 120 },
        lights: 11,
      },
      {
        start: { x: 380, y: 130 },
        control: { x: 640, y: 200 + Math.cos(time * 0.45) * 10 },
        end: { x: 880, y: 140 },
        lights: 13,
      },
    ];

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const bulbPalette = ["#ffe066", "#ff5ea3", "#2ddf7c", "#66d0ff"];

    for (const garland of garlands) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      ctx.moveTo(garland.start.x, garland.start.y);
      ctx.quadraticCurveTo(garland.control.x, garland.control.y, garland.end.x, garland.end.y);
      ctx.stroke();

      for (let i = 0; i <= garland.lights; i += 1) {
        const t = i / garland.lights;
        const point = quadraticPoint(garland.start, garland.control, garland.end, t);
        const flicker = 0.7 + Math.sin(time * 0.6 + i) * 0.3;
        const coreAlpha = Math.max(0.4, Math.min(1, 0.7 + Math.sin(time * 0.8 + i) * 0.3));
        ctx.fillStyle = applyAlpha(bulbPalette[i % bulbPalette.length], coreAlpha);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6 + Math.sin(time + i) * 0.6, 0, Math.PI * 2);
        ctx.fill();
        const glowAlpha = Math.max(0.1, Math.min(0.45, 0.2 + flicker * 0.2));
        ctx.fillStyle = applyAlpha("#ffffff", glowAlpha);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10 * flicker, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawFerrisWheel(cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-radius * 0.4, radius * 1.2);
    ctx.lineTo(radius * 0.4, radius * 1.2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fill();

    ctx.save();
    ctx.rotate(ferrisRotation);
    for (let i = 0; i < 8; i += 1) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radius);
      ctx.stroke();
      ctx.fillStyle = confettiColors[i % confettiColors.length];
      ctx.beginPath();
      ctx.arc(0, -radius, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.restore();
  }

  function drawTent(centerX, baseY, width, height) {
    ctx.save();
    ctx.translate(centerX, baseY);

    ctx.fillStyle = "#13255c";
    ctx.fillRect(-width / 2 - 20, -height * 0.35, width + 40, height * 0.35);

    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(0, -height);
    ctx.lineTo(width / 2, 0);
    ctx.closePath();
    ctx.fillStyle = "#ff5ea3";
    ctx.fill();

    ctx.fillStyle = "#ffe066";
    for (let i = -width / 2; i < width / 2; i += width / 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + width / 12, -height * 0.55);
      ctx.lineTo(i + width / 6, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#66d0ff";
    ctx.fillRect(-width / 2, -height * 0.15, width, height * 0.15);

    ctx.fillStyle = "#6a00f4";
    ctx.beginPath();
    ctx.moveTo(0, -height - 20);
    ctx.lineTo(12, -height - 4);
    ctx.lineTo(-12, -height - 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawBalloonCluster(x, y) {
    ctx.save();
    ctx.translate(x, y);
    const balloonColors = ["#ff5ea3", "#66d0ff", "#2ddf7c", "#ffe066"];
    for (let i = 0; i < 5; i += 1) {
      const offsetX = Math.sin(time * 0.6 + i) * 6 + (i - 2) * 14;
      const offsetY = Math.cos(time * 0.4 + i) * 6 + (i % 2 === 0 ? -20 : 0);
      ctx.fillStyle = balloonColors[i % balloonColors.length];
      ctx.beginPath();
      ctx.ellipse(offsetX, offsetY, 22, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + 30);
      ctx.lineTo(offsetX - 4, offsetY + 70);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlatforms() {
    ctx.save();
    for (const platform of platforms) {
      drawRoundedRect(platform.x, platform.y, platform.width, platform.height, 12);
      ctx.fillStyle = platform.color;
      ctx.fill();

      ctx.save();
      drawRoundedRect(platform.x, platform.y, platform.width, platform.height, 12);
      ctx.clip();
      ctx.fillStyle = platform.accent;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height * 0.3);
      ctx.globalAlpha = 0.4;
      ctx.fillRect(platform.x, platform.y + platform.height * 0.3, platform.width, platform.height * 0.25);
      ctx.restore();

      ctx.save();
      drawRoundedRect(platform.x, platform.y, platform.width, platform.height, 12);
      ctx.strokeStyle = "rgba(20, 40, 80, 0.25)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      if (platform.label && platform.height > 24) {
        ctx.fillStyle = "rgba(10, 24, 60, 0.8)";
        ctx.font = "16px 'Trebuchet MS', 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(platform.label, platform.x + platform.width / 2, platform.y - 8);
      }
    }
    ctx.restore();
  }

  function drawCollectibles() {
    for (const ticket of collectibles) {
      if (ticket.collected) {
        continue;
      }
      drawTicket(ticket);
    }
  }

  function drawTicket(ticket) {
    ctx.save();
    ctx.translate(ticket.x, ticket.currentY);
    ctx.rotate(ticket.rotation);
    ctx.fillStyle = "#ffe066";
    drawRoundedRect(-ticket.size / 2, -ticket.size / 4, ticket.size, ticket.size / 2, 6);
    ctx.fill();

    ctx.strokeStyle = "#ff5ea3";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ff5ea3";
    ctx.font = "bold 12px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VIP", 0, 0);

    ctx.restore();
  }

  function drawDog() {
    drawShadow();

    ctx.save();
    const baseX = dog.x + dog.width / 2;
    const baseY = dog.y + dog.height - dog.bob;
    ctx.translate(baseX, baseY);
    ctx.scale(dog.facing, 1);
    ctx.translate(-dog.width / 2, -dog.height);

    const skin = currentSkin ?? skins[0];
    const bodyColor = skin.body;
    const spotColor = skin.spots;
    const outline = skin.outline;

    // Tail
    ctx.save();
    ctx.translate(10, dog.height - 22);
    ctx.rotate(0.6 + dog.tailSwing * 0.35);
    ctx.fillStyle = bodyColor;
    drawRoundedRect(-4, -4, 26, 10, 5);
    ctx.fill();
    ctx.restore();

    // Back leg
    ctx.fillStyle = bodyColor;
    drawRoundedRect(8, dog.height - 18, 12, 18, 4);
    ctx.fill();

    // Front leg
    drawRoundedRect(24, dog.height - 18, 12, 18, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = bodyColor;
    drawRoundedRect(6, 14, 34, 28, 12);
    ctx.fill();

    ctx.fillStyle = spotColor;
    drawRoundedRect(14, 22, 18, 14, 6);
    ctx.fill();

    // Collar
    ctx.fillStyle = "#ff5ea3";
    drawRoundedRect(18, 10, 18, 10, 4);
    ctx.fill();

    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.moveTo(18, 20);
    ctx.lineTo(26, 26);
    ctx.lineTo(34, 20);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.save();
    ctx.translate(36, 12);
    ctx.rotate(-0.06 + dog.earWiggle * 0.3);
    drawRoundedRect(-16, -10, 28, 24, 10);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.restore();

    // Snout
    ctx.fillStyle = spotColor;
    drawRoundedRect(34, 22, 16, 12, 6);
    ctx.fill();

    // Nose
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(46, 26, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(40, 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(39.2, 19.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(43, 28, 4, 0, Math.PI / 2);
    ctx.stroke();

    // Ear
    ctx.save();
    ctx.translate(30, 8);
    ctx.rotate(-0.8 - dog.earWiggle * 0.4);
    ctx.fillStyle = bodyColor;
    drawRoundedRect(-4, -16, 10, 20, 6);
    ctx.fill();
    ctx.restore();

    // Party hat
    ctx.save();
    ctx.translate(40, 6);
    ctx.rotate(-0.2);
    ctx.fillStyle = "#6a00f4";
    drawRoundedRect(-6, -18, 12, 18, 6);
    ctx.fill();
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.arc(0, -18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawShadow() {
    ctx.save();
    ctx.fillStyle = "rgba(10, 24, 60, 0.35)";
    ctx.beginPath();
    ctx.ellipse(dog.x + dog.width / 2, dog.y + dog.height + 6, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRoundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawConfetti() {
    ctx.save();
    for (const piece of confettiPieces) {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, piece.life / 60));
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      ctx.restore();
    }
    ctx.restore();
  }

  function quadraticPoint(p0, p1, p2, t) {
    const inv = 1 - t;
    return {
      x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
      y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y,
    };
  }

  function applyAlpha(color, alpha) {
    const safeAlpha = Math.max(0, Math.min(1, alpha));
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((char) => char + char).join("");
      } else if (hex.length >= 6) {
        hex = hex.slice(0, 6);
      }
      const int = parseInt(hex, 16);
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
    if (color.startsWith("rgba")) {
      const parts = color.replace("rgba(", "").replace(")", "").split(",");
      const [r, g, b] = parts;
      return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${safeAlpha})`;
    }
    if (color.startsWith("rgb")) {
      const parts = color.replace("rgb(", "").replace(")", "").split(",");
      const [r, g, b] = parts;
      return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${safeAlpha})`;
    }
    return color;
  }

  function handlePlayClick() {
    if (selectedLevelIndex >= progress.unlockedLevels) {
      return;
    }
    const continueRun = shouldContinueRun(selectedLevelIndex);
    startLevel(selectedLevelIndex, { continueRun });
  }

  function togglePanel(button, panel) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      button.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    } else {
      closePanels(button);
      button.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
  }

  function closePanels(exceptButton) {
    const panels = [
      { button: characterButton, panel: characterPanel },
      { button: levelButton, panel: levelPanel },
    ];
    for (const { button, panel } of panels) {
      if (button === exceptButton) {
        continue;
      }
      button.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  }

  function updateUIForState() {
    const inMenu = gameState === GAME_STATES.MENU;
    mainMenu.hidden = !inMenu;
    hudEl.hidden = inMenu;
    gameAreaEl.hidden = inMenu;
    restartButton.hidden = gameState !== GAME_STATES.PLAYING;
    restartButton.disabled = gameState !== GAME_STATES.PLAYING;
  }

  function clearPendingMenuTimeout() {
    if (pendingMenuTimeout !== null) {
      clearTimeout(pendingMenuTimeout);
      pendingMenuTimeout = null;
    }
  }

  function createEmptyRun(startIndex = 0) {
    return {
      startedIndex: startIndex,
      completedLevelTimes: new Array(levels.length).fill(null),
      totalTime: 0,
      active: false,
    };
  }

  function updateTimerDisplays() {
    levelTimerEl.textContent = formatTime(levelTimer);
    const total = currentRun.totalTime + (gameState === GAME_STATES.PLAYING ? levelTimer : 0);
    totalTimerEl.textContent = formatTime(total);
  }

  function formatTime(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
      return "0:00.000";
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  }

  function buildSkinOptions() {
    skinButtons.clear();
    characterOptionsEl.textContent = "";
    skins.forEach((skin) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skin-option";
      button.setAttribute("role", "listitem");

      const preview = document.createElement("span");
      preview.className = "skin-option__preview";
      preview.style.background = skin.body;
      preview.style.boxShadow = `inset 0 0 0.5rem ${skin.spots}`;

      const label = document.createElement("span");
      label.textContent = skin.name;

      button.append(preview, label);
      button.addEventListener("click", () => {
        selectSkin(skin);
      });

      characterOptionsEl.append(button);
      skinButtons.set(skin.id, button);
    });

    updateSkinSelection();
  }

  function selectSkin(skin) {
    currentSkin = skin;
    progress.selectedSkinId = skin.id;
    saveProgress();
    updateSkinSelection();
  }

  function updateSkinSelection() {
    skinButtons.forEach((button, id) => {
      if (id === currentSkin.id) {
        button.classList.add("is-selected");
      } else {
        button.classList.remove("is-selected");
      }
    });
    characterButton.textContent = `Sélection de personnage — ${currentSkin.name}`;
  }

  function buildLevelOptions() {
    levelButtonRefs.length = 0;
    levelListEl.textContent = "";

    levels.forEach((level, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-option";
      button.dataset.levelIndex = String(index);

      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${level.name}`;

      const meta = document.createElement("span");
      meta.className = "level-option__meta";

      button.append(label, meta);
      button.addEventListener("click", () => {
        if (index >= progress.unlockedLevels) {
          return;
        }
        setSelectedLevel(index);
      });

      item.append(button);
      levelListEl.append(item);
      levelButtonRefs.push({ button, meta, index });
    });

    updateLevelButtonStates();
  }

  function updateLevelButtonStates() {
    for (const { button, meta, index } of levelButtonRefs) {
      const level = levels[index];
      const isUnlocked = index < progress.unlockedLevels;
      const best = progress.bestLevelTimes[level.id];

      button.disabled = !isUnlocked;
      button.classList.toggle("is-selected", isUnlocked && index === selectedLevelIndex);
      if (!isUnlocked) {
        meta.textContent = "🔒 Termine le niveau précédent";
      } else if (best != null) {
        meta.textContent = `Meilleur : ${formatTime(best)}`;
      } else {
        meta.textContent = "Aucun temps enregistré";
      }
    }

    updatePlayButtonText();
  }

  function setSelectedLevel(index) {
    if (index < 0 || index >= levels.length) {
      return;
    }
    if (index >= progress.unlockedLevels) {
      return;
    }
    selectedLevelIndex = index;
    updateLevelButtonStates();
  }

  function updatePlayButtonText() {
    const level = levels[selectedLevelIndex];
    const continuing = shouldContinueRun(selectedLevelIndex);
    playButton.textContent = `${continuing ? "Continuer" : "Jouer"} — ${level.name}`;
    playButton.disabled = selectedLevelIndex >= progress.unlockedLevels;
  }

  function shouldContinueRun(levelIndex) {
    if (!currentRun.active) {
      return false;
    }
    const nextIndex = currentRun.completedLevelTimes.findIndex(
      (time, idx) => idx >= currentRun.startedIndex && time == null
    );
    if (nextIndex === -1) {
      return false;
    }
    return nextIndex === levelIndex;
  }

  function enterMenu({ focusLevel, skipFocus } = {}) {
    clearPendingMenuTimeout();

    const maxSelectable = Math.max(0, progress.unlockedLevels - 1);
    if (typeof focusLevel === "number") {
      selectedLevelIndex = Math.min(maxSelectable, Math.max(0, focusLevel));
    } else {
      selectedLevelIndex = Math.min(selectedLevelIndex, maxSelectable);
    }

    gameState = GAME_STATES.MENU;
    updateLevelButtonStates();
    updateUIForState();
    closePanels();
    updateTimerDisplays();
    updateLeaderboardDisplay();
    updateLastRunSummary();

    if (!skipFocus) {
      playButton.focus();
    }
  }

  function handleRunFinished() {
    if (!lastRunResults) {
      return;
    }

    let enteredName = "";
    if (typeof window !== "undefined" && typeof window.prompt === "function") {
      enteredName = window.prompt(
        "Bravo ! Tu as terminé tous les niveaux. Entre ton nom pour le classement :",
        currentSkin?.name ?? "Samba"
      );
    }

    const sanitized = (enteredName ?? "").trim().slice(0, 24);
    const entryName = sanitized || currentSkin?.name || "Samba";

    progress.leaderboard.push({
      name: entryName,
      totalTime: currentRun.totalTime,
      timestamp: Date.now(),
    });

    progress.leaderboard.sort((a, b) => a.totalTime - b.totalTime);
    progress.leaderboard = progress.leaderboard.slice(0, 5);
    saveProgress();
    updateLeaderboardDisplay();
  }

  function updateLeaderboardDisplay() {
    if (!Array.isArray(progress.leaderboard) || progress.leaderboard.length === 0) {
      leaderboardEmptyEl.hidden = false;
      leaderboardListEl.hidden = true;
      leaderboardListEl.textContent = "";
      return;
    }

    leaderboardEmptyEl.hidden = true;
    leaderboardListEl.hidden = false;
    leaderboardListEl.textContent = "";

    progress.leaderboard.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} — ${formatTime(entry.totalTime)}`;
      leaderboardListEl.append(li);
    });
  }

  function updateLastRunSummary() {
    if (!lastRunResults || !lastRunResults.times.some((time) => time != null)) {
      lastRunSummaryEl.hidden = true;
      lastRunListEl.textContent = "";
      return;
    }

    lastRunSummaryEl.hidden = false;
    lastRunListEl.textContent = "";

    lastRunResults.times.forEach((time, index) => {
      if (time == null) {
        return;
      }
      const item = document.createElement("li");
      item.textContent = `${index + 1}. ${levels[index].name} — ${formatTime(time)}`;
      lastRunListEl.append(item);
    });

    const totalItem = document.createElement("li");
    totalItem.textContent = `Total : ${formatTime(lastRunResults.total)}`;
    totalItem.style.fontWeight = "700";
    lastRunListEl.append(totalItem);
  }

  function saveProgress() {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      const payload = JSON.stringify(progress);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }

  function loadProgress() {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  }

  function initialize() {
    currentLevelNameEl.textContent = levels[currentLevelIndex].name;
    buildSkinOptions();
    buildLevelOptions();
    updateTimerDisplays();
    updateLeaderboardDisplay();
    updateLastRunSummary();
    enterMenu({ focusLevel: selectedLevelIndex, skipFocus: true });
  }

  function gameLoop(timestamp) {
    if (!gameLoop.lastTime) {
      gameLoop.lastTime = timestamp;
    }
    const elapsed = timestamp - gameLoop.lastTime;
    const delta = Math.min(elapsed / 16.6667, 2.5);
    const seconds = elapsed / 1000;
    gameLoop.lastTime = timestamp;

    update(delta, seconds);
    draw();

    requestAnimationFrame(gameLoop);
  }

  initialize();
  requestAnimationFrame(gameLoop);
})();
