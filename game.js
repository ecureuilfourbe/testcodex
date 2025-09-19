(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const ticketCountEl = document.getElementById("ticket-count");
  const ticketTotalEl = document.getElementById("ticket-total");
  const statusEl = document.getElementById("status");
  const restartButton = document.getElementById("restart-button");

  const keys = {
    left: false,
    right: false,
  };

  const confettiPieces = [];
  const collectibles = [];
  let platforms = [];
  let dog;

  const gravity = 0.65;
  const terminalVelocity = 17;

  let score = 0;
  let celebration = false;
  let celebrationTimer = 0;
  let nextCelebrationBurst = 0;
  let ferrisRotation = 0;
  let time = 0;
  let jumpBuffer = 0;
  let coyoteTimer = 0;

  const confettiColors = ["#ffe066", "#ff5ea3", "#2ddf7c", "#66d0ff", "#ffffff"];

  restartButton.addEventListener("click", () => {
    resetGame();
    restartButton.blur();
  });

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
    if (gameplayKeyCodes.includes(code)) {
      if (!isMenuControl(event.target) && !isMenuControl(document.activeElement)) {
        event.preventDefault();
      }
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

  function resetGame() {
    dog = {
      x: 80,
      y: 360,
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

    platforms = [
      { x: 0, y: 470, width: canvas.width, height: 70, color: "#ffcf4a", accent: "#ffe9a3", label: "Scène Samba" },
      { x: 110, y: 360, width: 170, height: 26, color: "#ff5ea3", accent: "#ffd2ec", label: "Char Tambours" },
      { x: 330, y: 305, width: 150, height: 26, color: "#2ddf7c", accent: "#b8ffde", label: "Stand Limonade" },
      { x: 530, y: 245, width: 190, height: 28, color: "#6a00f4", accent: "#d9c7ff", label: "Char Confettis" },
      { x: 770, y: 340, width: 140, height: 26, color: "#ff7f50", accent: "#ffd1c2", label: "Float Bonbons" },
      { x: 660, y: 430, width: 120, height: 22, color: "#00c2ff", accent: "#c6f3ff", label: "Chariot Glaces" },
      { x: 420, y: 410, width: 120, height: 22, color: "#ffd447", accent: "#fff2a6", label: "Tambours" },
    ];

    collectibles.length = 0;
    collectibles.push(
      createTicket(180, 320, 0.1),
      createTicket(375, 265, 0.5),
      createTicket(600, 205, 0.9),
      createTicket(810, 300, 1.4),
      createTicket(700, 390, 1.9),
      createTicket(480, 370, 2.2),
      createTicket(260, 350, 2.8)
    );

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
    statusEl.textContent = "Collecte tous les tickets pour déclencher la fête.";
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

  function update(delta) {
    time += delta;
    ferrisRotation = (ferrisRotation + 0.0045 * delta) % (Math.PI * 2);

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

    dog.bob = dog.onGround ? Math.abs(Math.sin(dog.runCycle * 2)) * speedRatio * 6 : Math.max(0, dog.bob - 0.8 * delta);
    dog.tailSwing = Math.sin(time * 0.5 + dog.runCycle * 1.6) * (0.6 + speedRatio * 0.9);
    dog.earWiggle = Math.sin(time * 0.7 + dog.runCycle) * (0.2 + speedRatio * 0.25);

    updateCollectibles(delta);
    updateConfetti(delta);
    updateCelebration(delta);
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
          startCelebration();
        }
      }
    }
  }

  function startCelebration() {
    celebration = true;
    celebrationTimer = 0;
    nextCelebrationBurst = 0;
    statusEl.textContent = "Bravo ! Samba a récolté tous les tickets : place au feu d'artifice !";
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
    drawCrowd();
    drawPlatforms();
    drawCollectibles();
    drawDog();
    drawConfetti();
  }

  function drawBackground() {
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

    const bodyColor = "#c67c48";
    const spotColor = "#d89a64";
    const outline = "#6f3a1b";

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

  function gameLoop(timestamp) {
    if (!gameLoop.lastTime) {
      gameLoop.lastTime = timestamp;
    }
    const delta = Math.min((timestamp - gameLoop.lastTime) / 16.6667, 2.5);
    gameLoop.lastTime = timestamp;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
  }

  resetGame();
  requestAnimationFrame(gameLoop);
})();
