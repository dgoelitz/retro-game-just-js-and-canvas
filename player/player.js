import { tickTimer } from "../utils.js";
import { updateShield } from "./shield.js";
import { updateSword } from "./sword.js";
import { getDrawPlayer, renderPlayer, renderPlayerHealth } from "./rendering.js";

export { renderPlayer, renderPlayerHealth };

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
    flashInterval: 0.2,
    animationTimer: 0,
    moving: false
  };
}

export function updatePlayer(player, sword, shield, input, deltaTime, canAttack = true, canUseShield = false) {
  tickTimer(player, "invulnerableTimer", deltaTime);
  const movementStep = player.speed * deltaTime;
  const previousX = player.x;
  const previousY = player.y;
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

  player.moving = player.x !== previousX || player.y !== previousY;
  player.animationTimer = player.moving
    ? player.animationTimer + deltaTime
    : 0;

  updateSword(player, sword, input, deltaTime, canAttack && !shield.active);
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
