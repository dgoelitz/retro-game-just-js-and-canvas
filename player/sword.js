import { tickTimer, ZERO_OFFSET } from "../game-utils.js";

const SWORD_HANDLE_COLOR = "#7a4f24";
const SWORD_BLADE_COLOR = "#fff1e8";

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

export function updateSword(player, sword, input, deltaTime) {
  startSwordAttack(sword, input);

  if (!sword.active) {
    return;
  }

  tickTimer(sword, "timer", deltaTime);

  if (sword.timer === 0) {
    sword.active = false;
  }
}

export function renderSword(ctx, player, sword, offset = ZERO_OFFSET) {
  if (!sword.active) {
    return;
  }

  const hitbox = getAttackHitbox(player, sword);
  const swordParts = getSwordParts(player, sword, hitbox, offset);

  ctx.fillStyle = SWORD_HANDLE_COLOR;
  ctx.fillRect(swordParts.handle.x, swordParts.handle.y, swordParts.handle.width, swordParts.handle.height);

  ctx.fillStyle = SWORD_BLADE_COLOR;
  ctx.fillRect(swordParts.blade.x, swordParts.blade.y, swordParts.blade.width, swordParts.blade.height);
}

export function getAttackHitbox(player, sword) {
  if (!sword.active) {
    return null;
  }

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

function startSwordAttack(sword, input) {
  if (!input.attack || sword.active) {
    return;
  }

  sword.active = true;
  sword.timer = sword.duration;
  input.attack = false;
}

function getSwordParts(player, sword, hitbox, offset) {
  const drawX = hitbox.x + offset.x;
  const drawY = hitbox.y + offset.y;
  const bladeLength = hitbox.width - sword.handleSize;
  const bladeHeight = hitbox.height - sword.handleSize;

  if (player.facing === "left") {
    return {
      handle: {
        x: drawX + hitbox.width - sword.handleSize,
        y: drawY,
        width: sword.handleSize,
        height: hitbox.height
      },
      blade: {
        x: drawX,
        y: drawY,
        width: bladeLength,
        height: hitbox.height
      }
    };
  }

  if (player.facing === "right") {
    return {
      handle: {
        x: drawX,
        y: drawY,
        width: sword.handleSize,
        height: hitbox.height
      },
      blade: {
        x: drawX + sword.handleSize,
        y: drawY,
        width: bladeLength,
        height: hitbox.height
      }
    };
  }

  if (player.facing === "up") {
    return {
      handle: {
        x: drawX,
        y: drawY + hitbox.height - sword.handleSize,
        width: hitbox.width,
        height: sword.handleSize
      },
      blade: {
        x: drawX,
        y: drawY,
        width: hitbox.width,
        height: bladeHeight
      }
    };
  }

  return {
    handle: {
      x: drawX,
      y: drawY,
      width: hitbox.width,
      height: sword.handleSize
    },
    blade: {
      x: drawX,
      y: drawY + sword.handleSize,
      width: hitbox.width,
      height: bladeHeight
    }
  };
}
