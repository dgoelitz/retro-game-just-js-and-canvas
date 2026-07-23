import { ZERO_OFFSET } from "../utils.js";
import { renderShield } from "./shield.js";
import { renderSword } from "./sword.js";

const HEALTH_ICON_SIZE = 4;
const HEALTH_ICON_GAP = 2;
const HEALTH_HUD_X = 4;
const HEALTH_HUD_Y = 4;
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

const healthIcon = new Image();
healthIcon.src = "assets/health.png";

export function renderPlayer(ctx, player, sword, shield, offset = ZERO_OFFSET) {
  const drawPlayer = getDrawPlayer(player);

  ctx.save();
  ctx.globalAlpha = getPlayerAlpha(player);
  renderShield(ctx, drawPlayer, shield, offset);
  renderPlayerSprite(ctx, drawPlayer, offset);
  renderSword(ctx, drawPlayer, sword, offset);
  ctx.restore();
}

export function renderPlayerHealth(ctx, player) {
  for (let i = 0; i < player.health; i += 1) {
    const x = HEALTH_HUD_X + i * (HEALTH_ICON_SIZE + HEALTH_ICON_GAP);
    ctx.drawImage(healthIcon, x, HEALTH_HUD_Y, HEALTH_ICON_SIZE, HEALTH_ICON_SIZE);
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
