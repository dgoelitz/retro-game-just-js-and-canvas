import { createProjectile } from "../../combat/projectiles.js";
import { createEnemy } from "../core/base.js";
import { clampValue } from "../core/geometry.js";
import {
  MINIBOSS_MODE_REST,
  MINIBOSS_MODE_SPIN,
  MINIBOSS_MODE_THROW
} from "../core/state.js";

const ROOM_PADDING = 4;
const THROW_DURATION = 3.2;
const SPIN_DURATION = 4.2;
const REST_DURATION = 2.4;
const SPIN_SPEED = 58;
const SPIN_PADDING = 4;
const REST_Y = 18;
const SWORD_SPAWN_Y = ROOM_PADDING;
const SWORD_X_PADDING = 8;
const SWORD_WIDTH = 4;
const SWORD_HEIGHT = 12;
const THROW_RECOVERY_DELAY = 0.8;
const HIT_PAUSE_DURATION = 0.12;

export function createMinibossEnemy() {
  return createEnemy({
    type: "miniboss",
    x: 76,
    y: 14,
    homeX: 76,
    homeY: 14,
    width: 10,
    height: 10,
    health: 8,
    maxHealth: 8,
    mode: MINIBOSS_MODE_THROW,
    shotCooldown: 0.9,
    shootTimer: 1.6,
    abilityTimer: 0,
    stunHitCount: 0,
    maxHitsPerStun: 3
  });
}

export function updateMiniboss(enemy, player, deltaTime, canvas, projectiles) {
  if (enemy.hitPauseTimer > 0) {
    return;
  }

  enemy.abilityTimer += deltaTime;

  switch (enemy.mode) {
    case MINIBOSS_MODE_THROW:
      updateThrowPhase(enemy, player, deltaTime, canvas, projectiles);
      return;
    case MINIBOSS_MODE_SPIN:
      updateSpinPhase(enemy, deltaTime, canvas);
      return;
    default:
      updateRestPhase(enemy);
  }
}

export function canHitMiniboss(enemy) {
  return enemy.mode === MINIBOSS_MODE_REST;
}

export function applyMinibossDamageEffects(enemy) {
  enemy.stunHitCount += 1;

  if (enemy.health <= 0 || enemy.stunHitCount < enemy.maxHitsPerStun) {
    return;
  }

  enemy.mode = MINIBOSS_MODE_THROW;
  enemy.abilityTimer = 0;
  enemy.shootTimer = THROW_RECOVERY_DELAY;
  enemy.hitPauseTimer = HIT_PAUSE_DURATION;
}

export function getMinibossSpinAuraPadding() {
  return SPIN_PADDING;
}

function updateThrowPhase(enemy, player, deltaTime, canvas, projectiles) {
  enemy.shootTimer = Math.max(0, enemy.shootTimer - deltaTime);

  if (enemy.shootTimer === 0) {
    spawnSwordProjectile(enemy, player, canvas, projectiles);
  }

  if (enemy.abilityTimer < THROW_DURATION) {
    return;
  }

  enemy.mode = MINIBOSS_MODE_SPIN;
  enemy.abilityTimer = 0;
  enemy.directionX = Math.random() > 0.5 ? 1 : -1;
  enemy.directionY = Math.random() > 0.5 ? 1 : -1;
}

function spawnSwordProjectile(enemy, player, canvas, projectiles) {
  const swordSpeed = getSwordSpeed(enemy);
  enemy.shootTimer = enemy.shotCooldown;

  projectiles.push(createProjectile({
    kind: "sword-projectile",
    x: clampValue(player.x + 2, ROOM_PADDING, canvas.width - SWORD_X_PADDING),
    y: SWORD_SPAWN_Y,
    width: SWORD_WIDTH,
    height: SWORD_HEIGHT,
    velocityX: 0,
    velocityY: swordSpeed
  }));
}

function updateSpinPhase(enemy, deltaTime, canvas) {
  const spinBounds = getSpinBounds(enemy, canvas);

  enemy.x += enemy.directionX * SPIN_SPEED * deltaTime;
  enemy.y += enemy.directionY * SPIN_SPEED * deltaTime;

  if (enemy.x <= spinBounds.minX || enemy.x >= spinBounds.maxX) {
    enemy.x = clampValue(enemy.x, spinBounds.minX, spinBounds.maxX);
    enemy.directionX *= -1;
  }

  if (enemy.y <= spinBounds.minY || enemy.y >= spinBounds.maxY) {
    enemy.y = clampValue(enemy.y, spinBounds.minY, spinBounds.maxY);
    enemy.directionY *= -1;
  }

  if (enemy.abilityTimer < SPIN_DURATION) {
    return;
  }

  enemy.mode = MINIBOSS_MODE_REST;
  enemy.abilityTimer = 0;
  enemy.stunHitCount = 0;
  enemy.x = canvas.width / 2 - enemy.width / 2;
  enemy.y = REST_Y;
}

function updateRestPhase(enemy) {
  if (enemy.abilityTimer < REST_DURATION) {
    return;
  }

  enemy.mode = MINIBOSS_MODE_THROW;
  enemy.abilityTimer = 0;
  enemy.shootTimer = 0;
}

function getSwordSpeed(enemy) {
  const maxHealth = enemy.maxHealth ?? enemy.health;
  const damageTaken = maxHealth - enemy.health;
  const damageProgress = damageTaken / Math.max(maxHealth - 1, 1);
  const startingSpeed = 41;
  const endingSpeed = 82;

  return startingSpeed + (endingSpeed - startingSpeed) * damageProgress;
}

function getSpinBounds(enemy, canvas) {
  return {
    minX: ROOM_PADDING + SPIN_PADDING,
    maxX: canvas.width - enemy.width - ROOM_PADDING - SPIN_PADDING,
    minY: ROOM_PADDING + SPIN_PADDING,
    maxY: canvas.height - enemy.height - ROOM_PADDING - SPIN_PADDING
  };
}
