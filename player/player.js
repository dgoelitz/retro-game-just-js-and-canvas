import { tickTimer, ZERO_OFFSET } from "../game-utils.js";
import { renderShield, updateShield } from "./shield.js";
import { renderSword, updateSword } from "./sword.js";

const PLAYER_COLOR = "#ffcc00";
const PLAYER_FACING_COLOR = "#1a1c2c";

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
    invulnerableDuration: 2.2,
    flashInterval: 0.2
  };
}

export function updatePlayer(player, sword, shield, input, deltaTime, canAttack = true, canUseShield = false) {
  tickTimer(player, "invulnerableTimer", deltaTime);
  const movementStep = player.speed * deltaTime;
  updateShield(shield, input, canUseShield);

  if (shield.active) {
    sword.active = false;
  }

  const canChangeFacing = !shield.active;

  if (input.left) {
    player.x -= movementStep;
    if (canChangeFacing) {
      player.facing = "left";
    }
  }

  if (input.right) {
    player.x += movementStep;
    if (canChangeFacing) {
      player.facing = "right";
    }
  }

  if (input.up) {
    player.y -= movementStep;
    if (canChangeFacing) {
      player.facing = "up";
    }
  }

  if (input.down) {
    player.y += movementStep;
    if (canChangeFacing) {
      player.facing = "down";
    }
  }

  updateSword(player, sword, input, deltaTime, canAttack && !shield.active);
}

export function renderPlayer(ctx, player, sword, shield, offset = ZERO_OFFSET) {
  const drawPlayer = getDrawPlayer(player);

  ctx.save();
  ctx.globalAlpha = getPlayerAlpha(player);
  renderShield(ctx, drawPlayer, shield, offset);
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(drawPlayer.x + offset.x, drawPlayer.y + offset.y, drawPlayer.width, drawPlayer.height);
  renderFacingIndicator(ctx, drawPlayer, offset);
  renderSword(ctx, drawPlayer, sword, offset);
  ctx.restore();
}

export function getPlayerHitbox(player) {
  const drawPlayer = getDrawPlayer(player);

  return {
    x: drawPlayer.x,
    y: drawPlayer.y,
    width: drawPlayer.width,
    height: drawPlayer.height
  };
}

export function getPlayerPosition(player) {
  return {
    x: player.x,
    y: player.y
  };
}

export function setPlayerPosition(player, position) {
  player.x = position.x;
  player.y = position.y;
}

export function damagePlayer(player) {
  if (player.health <= 0 || player.invulnerableTimer > 0) {
    return;
  }

  player.health -= 1;
  player.invulnerableTimer = player.invulnerableDuration;
  if (player.health < 0) player.health = 0;
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

function getPlayerAlpha(player) {
  if (player.invulnerableTimer <= 0) {
    return 1;
  }

  const elapsedFlashTime = player.invulnerableDuration - player.invulnerableTimer;
  const flashPhase = Math.floor(elapsedFlashTime / player.flashInterval);

  return flashPhase % 2 === 0 ? 0.45 : 1;
}

function renderFacingIndicator(ctx, player, offset) {
  const indicator = getFacingIndicator(player, offset);

  ctx.fillStyle = PLAYER_FACING_COLOR;
  ctx.fillRect(indicator.x, indicator.y, indicator.width, indicator.height);
}

function getFacingIndicator(player, offset) {
  const drawX = player.x + offset.x;
  const drawY = player.y + offset.y;
  const centerX = drawX + Math.floor(player.width / 2) - 1;
  const centerY = drawY + Math.floor(player.height / 2) - 1;

  if (player.facing === "left") {
    return {
      x: drawX,
      y: centerY,
      width: 2,
      height: 2
    };
  }

  if (player.facing === "right") {
    return {
      x: drawX + player.width - 2,
      y: centerY,
      width: 2,
      height: 2
    };
  }

  if (player.facing === "up") {
    return {
      x: centerX,
      y: drawY,
      width: 2,
      height: 2
    };
  }

  return {
    x: centerX,
    y: drawY + player.height - 2,
    width: 2,
    height: 2
  };
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
