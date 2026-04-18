import { ZERO_OFFSET } from "../game-utils.js";

const SHIELD_COLOR = "#7a4f24";
const SHIELD_BORDER_COLOR = "#4f3422";

export function createShield() {
  return {
    active: false,
    width: 3,
    height: 10
  };
}

export function updateShield(shield, input, canUseShield) {
  shield.active = canUseShield && input.shield;
}

export function renderShield(ctx, player, shield, offset = ZERO_OFFSET) {
  if (!shield.active) {
    return;
  }

  const hitbox = getShieldHitbox(player, shield);

  ctx.fillStyle = SHIELD_COLOR;
  ctx.fillRect(hitbox.x + offset.x, hitbox.y + offset.y, hitbox.width, hitbox.height);

  ctx.fillStyle = SHIELD_BORDER_COLOR;
  if (player.facing === "left" || player.facing === "right") {
    ctx.fillRect(hitbox.x + offset.x, hitbox.y + offset.y, hitbox.width, 1);
    ctx.fillRect(hitbox.x + offset.x, hitbox.y + offset.y + hitbox.height - 1, hitbox.width, 1);
  } else {
    ctx.fillRect(hitbox.x + offset.x, hitbox.y + offset.y, 1, hitbox.height);
    ctx.fillRect(hitbox.x + offset.x + hitbox.width - 1, hitbox.y + offset.y, 1, hitbox.height);
  }
}

export function getShieldHitbox(player, shield) {
  if (!shield.active) {
    return null;
  }

  return getShieldHitboxForPosition(player, shield, {
    x: player.x,
    y: player.y
  });
}

export function getShieldSweep(player, shield, previousPlayerPosition) {
  if (!shield.active) {
    return null;
  }

  const previousShieldHitbox = getShieldHitboxForPosition(player, shield, previousPlayerPosition);
  const currentShieldHitbox = getShieldHitbox(player, shield);
  const minX = Math.min(previousShieldHitbox.x, currentShieldHitbox.x);
  const minY = Math.min(previousShieldHitbox.y, currentShieldHitbox.y);
  const maxX = Math.max(previousShieldHitbox.x + previousShieldHitbox.width, currentShieldHitbox.x + currentShieldHitbox.width);
  const maxY = Math.max(previousShieldHitbox.y + previousShieldHitbox.height, currentShieldHitbox.y + currentShieldHitbox.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function getShieldHitboxForPosition(player, shield, position) {
  if (player.facing === "left") {
    return {
      x: position.x - shield.width,
      y: position.y - 1,
      width: shield.width,
      height: shield.height
    };
  }

  if (player.facing === "right") {
    return {
      x: position.x + player.width,
      y: position.y - 1,
      width: shield.width,
      height: shield.height
    };
  }

  if (player.facing === "up") {
    return {
      x: position.x - 1,
      y: position.y - shield.width,
      width: shield.height,
      height: shield.width
    };
  }

  return {
    x: position.x - 1,
    y: position.y + player.height,
    width: shield.height,
    height: shield.width
  };
}
