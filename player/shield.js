import { ZERO_OFFSET } from "../game-utils.js";

const SHIELD_COLOR = "#94b0c2";
const SHIELD_BORDER_COLOR = "#5f6f7a";

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

  if (player.facing === "left") {
    return {
      x: player.x - shield.width,
      y: player.y - 1,
      width: shield.width,
      height: shield.height
    };
  }

  if (player.facing === "right") {
    return {
      x: player.x + player.width,
      y: player.y - 1,
      width: shield.width,
      height: shield.height
    };
  }

  if (player.facing === "up") {
    return {
      x: player.x - 1,
      y: player.y - shield.width,
      width: shield.height,
      height: shield.width
    };
  }

  return {
    x: player.x - 1,
    y: player.y + player.height,
    width: shield.height,
    height: shield.width
  };
}
