import { ZERO_OFFSET } from "../utils.js";
import { renderShield } from "./shield.js";
import { renderSword } from "./sword.js";

const PLAYER_COLOR = "#ffcc00";
const PLAYER_FACING_COLOR = "#1a1c2c";
const PLAYER_FRAME_SIZE = 8;
const PLAYER_WALK_FRAME_DURATION = 0.18;
const PLAYER_SPRITE_FRAME_BY_STATE = {
  down: { idle: 0, walk: 1 },
  up: { idle: 2, walk: 3 },
  left: { idle: 4, walk: 5 },
  right: { idle: 6, walk: 7 }
};

const playerSprite = new Image();
playerSprite.src = "assets/player.png";

export function renderPlayer(ctx, player, sword, shield, offset = ZERO_OFFSET) {
  const drawPlayer = getDrawPlayer(player);

  ctx.save();
  ctx.globalAlpha = getPlayerAlpha(player);
  renderShield(ctx, drawPlayer, shield, offset);
  renderPlayerBody(ctx, drawPlayer, offset);
  renderSword(ctx, drawPlayer, sword, offset);
  ctx.restore();
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

export function getDrawPlayer(player) {
  return {
    x: Math.round(player.x),
    y: Math.round(player.y),
    width: player.width,
    height: player.height,
    facing: player.facing,
    moving: player.moving,
    animationTimer: player.animationTimer,
    invulnerableTimer: player.invulnerableTimer,
    invulnerableDuration: player.invulnerableDuration,
    flashInterval: player.flashInterval
  };
}

function getPlayerAlpha(player) {
  if (player.invulnerableTimer <= 0) {
    return 1;
  }

  const elapsedFlashTime = player.invulnerableDuration - player.invulnerableTimer;
  const flashPhase = Math.floor(elapsedFlashTime / player.flashInterval);

  return flashPhase % 2 === 0 ? 0.45 : 1;
}

function renderPlayerBody(ctx, player, offset) {
  if (isPlayerSpriteReady()) {
    renderPlayerSprite(ctx, player, offset);
    return;
  }

  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x + offset.x, player.y + offset.y, player.width, player.height);
  renderFacingIndicator(ctx, player, offset);
}

function isPlayerSpriteReady() {
  return playerSprite.complete && playerSprite.naturalWidth > 0;
}

function renderPlayerSprite(ctx, player, offset) {
  const frameIndex = getPlayerSpriteFrameIndex(player);
  const sourceX = frameIndex * PLAYER_FRAME_SIZE;

  ctx.drawImage(
    playerSprite,
    sourceX,
    0,
    PLAYER_FRAME_SIZE,
    PLAYER_FRAME_SIZE,
    player.x + offset.x,
    player.y + offset.y,
    player.width,
    player.height
  );
}

function getPlayerSpriteFrameIndex(player) {
  const directionFrames = PLAYER_SPRITE_FRAME_BY_STATE[player.facing];

  if (!player.moving) {
    return directionFrames.idle;
  }

  const walkCycleFrame = Math.floor(player.animationTimer / PLAYER_WALK_FRAME_DURATION) % 2;

  return walkCycleFrame === 0
    ? directionFrames.idle
    : directionFrames.walk;
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
