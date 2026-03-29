import { clampToCanvas, tickTimer } from "./game-utils.js";

const PLAYER_COLOR = "#ffcc00";
const SWORD_HANDLE_COLOR = "#7a4f24";
const SWORD_BLADE_COLOR = "#fff1e8";

export function createPlayer() {
  return {
    x: 40,
    y: 40,
    width: 8,
    height: 8,
    speed: 60,
    facing: "right",
    health: 3,
    maxHealth: 3,
    invulnerableTimer: 0,
    invulnerableDuration: 1.8,
    flashInterval: 0.2,
    alive: true
  };
}

export function createSword() {
  return {
    active: false,
    timer: 0,
    duration: 0.12,
    width: 10,
    height: 3,
    handleSize: 4
  };
}

export function updatePlayer(player, sword, input, deltaTime, canvas) {
  tickTimer(player, "invulnerableTimer", deltaTime);

  if (!player.alive) {
    sword.active = false;
    return;
  }

  if (input.left) {
    player.x -= player.speed * deltaTime;
    player.facing = "left";
  }

  if (input.right) {
    player.x += player.speed * deltaTime;
    player.facing = "right";
  }

  if (input.up) {
    player.y -= player.speed * deltaTime;
    player.facing = "up";
  }

  if (input.down) {
    player.y += player.speed * deltaTime;
    player.facing = "down";
  }

  startSwordAttack(player, sword, input);
  updateSword(sword, deltaTime);
  clampToCanvas(player, canvas);
}

export function renderPlayer(ctx, player, sword) {
  if (!player.alive) {
    return;
  }

  const drawPlayer = getDrawPlayer(player);

  if (isPlayerHiddenDuringFlash(player)) {
    return;
  }

  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(drawPlayer.x, drawPlayer.y, drawPlayer.width, drawPlayer.height);

  if (sword.active) {
    const hitbox = getSwordHitbox(drawPlayer, sword);
    renderSword(ctx, drawPlayer, sword, hitbox);
  }
}

export function getAttackHitbox(player, sword) {
  if (!player.alive || !sword.active) {
    return null;
  }

  return getSwordHitbox(getDrawPlayer(player), sword);
}

export function getPlayerHitbox(player) {
  if (!player.alive) {
    return null;
  }

  const drawPlayer = getDrawPlayer(player);

  return {
    x: drawPlayer.x,
    y: drawPlayer.y,
    width: drawPlayer.width,
    height: drawPlayer.height
  };
}

export function damagePlayer(player) {
  if (!player.alive || player.invulnerableTimer > 0) {
    return;
  }

  player.health -= 1;
  player.invulnerableTimer = player.invulnerableDuration;

  if (player.health <= 0) {
    player.health = 0;
    player.alive = false;
  }
}

export function renderPlayerHealth(ctx, player) {
  const healthSquareSize = 4;
  const healthSquareGap = 2;
  const hudX = 4;
  const hudY = 4;

  for (let i = 0; i < player.health; i += 1) {
    const x = hudX + i * (healthSquareSize + healthSquareGap);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(x, hudY, healthSquareSize, healthSquareSize);
  }
}

function isPlayerHiddenDuringFlash(player) {
  if (player.invulnerableTimer <= 0) {
    return false;
  }

  const elapsedFlashTime = player.invulnerableDuration - player.invulnerableTimer;
  const flashPhase = Math.floor(elapsedFlashTime / player.flashInterval);

  return flashPhase % 2 === 0;
}

function getDrawPlayer(player) {
  return {
    x: Math.round(player.x),
    y: Math.round(player.y),
    width: player.width,
    height: player.height,
    facing: player.facing
  };
}

function getSwordHitbox(player, sword) {
  if (player.facing === "left") {
    return {
      x: player.x - sword.width,
      y: player.y + 1,
      width: sword.width,
      height: sword.height
    };
  }

  if (player.facing === "right") {
    return {
      x: player.x + player.width,
      y: player.y + player.height - sword.height - 1,
      width: sword.width,
      height: sword.height
    };
  }

  if (player.facing === "up") {
    return {
      x: player.x + player.width - sword.height - 1,
      y: player.y - sword.width,
      width: sword.height,
      height: sword.width
    };
  }

  return {
    x: player.x + 1,
    y: player.y + player.height,
    width: sword.height,
    height: sword.width
  };
}

function renderSword(ctx, player, sword, hitbox) {
  ctx.fillStyle = SWORD_HANDLE_COLOR;

  if (player.facing === "left") {
    ctx.fillRect(hitbox.x + hitbox.width - sword.handleSize, hitbox.y, sword.handleSize, hitbox.height);
  } else if (player.facing === "right") {
    ctx.fillRect(hitbox.x, hitbox.y, sword.handleSize, hitbox.height);
  } else if (player.facing === "up") {
    ctx.fillRect(hitbox.x, hitbox.y + hitbox.height - sword.handleSize, hitbox.width, sword.handleSize);
  } else {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, sword.handleSize);
  }

  ctx.fillStyle = SWORD_BLADE_COLOR;

  if (player.facing === "left") {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width - sword.handleSize, hitbox.height);
  } else if (player.facing === "right") {
    ctx.fillRect(hitbox.x + sword.handleSize, hitbox.y, hitbox.width - sword.handleSize, hitbox.height);
  } else if (player.facing === "up") {
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height - sword.handleSize);
  } else {
    ctx.fillRect(hitbox.x, hitbox.y + sword.handleSize, hitbox.width, hitbox.height - sword.handleSize);
  }
}

function startSwordAttack(player, sword, input) {
  if (!player.alive || !input.attack || sword.active) {
    return;
  }

  sword.active = true;
  sword.timer = sword.duration;
  input.attack = false;
}

function updateSword(sword, deltaTime) {
  if (!sword.active) {
    return;
  }

  tickTimer(sword, "timer", deltaTime);

  if (sword.timer === 0) {
    sword.active = false;
  }
}
