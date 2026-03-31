import { clampToCanvas, tickTimer, ZERO_OFFSET } from "../game-utils.js";

const ENEMY_COLOR = "#e43636";
const ENEMY_MODE_PATROL = "patrol";
const ENEMY_MODE_CHASE = "chase";
const ENEMY_MODE_RETURN = "return";

export function createEnemy(overrides = {}) {
  return {
    x: 100,
    y: 48,
    homeX: 100,
    homeY: 48,
    width: 8,
    height: 8,
    health: 2,
    invulnerableTimer: 0,
    invulnerableDuration: 0.6,
    flashInterval: 0.2,
    patrolSpeed: 12,
    chaseSpeed: 22,
    patrolMinX: 88,
    patrolMaxX: 112,
    directionX: 1,
    chaseRange: 36,
    mode: ENEMY_MODE_PATROL,
    alive: true,
    ...overrides
  };
}

export function updateEnemy(enemy, player, deltaTime, canvas) {
  tickTimer(enemy, "invulnerableTimer", deltaTime);

  if (!enemy.alive) {
    return;
  }

  if (isPlayerInChaseRange(enemy, player)) {
    enemy.mode = ENEMY_MODE_CHASE;
  } else if (enemy.mode === ENEMY_MODE_CHASE) {
    enemy.mode = ENEMY_MODE_RETURN;
  }

  if (enemy.mode === ENEMY_MODE_CHASE) {
    chasePlayer(enemy, player, deltaTime);
  } else if (enemy.mode === ENEMY_MODE_RETURN) {
    returnHome(enemy, deltaTime);
  } else {
    patrol(enemy, deltaTime);
  }

  clampToCanvas(enemy, canvas);
}

export function hitEnemy(enemy, attackHitbox) {
  if (!enemy.alive || !attackHitbox) {
    return;
  }

  if (enemy.invulnerableTimer > 0) {
    return;
  }

  if (overlapsEnemy(enemy, attackHitbox)) {
    enemy.health -= 1;
    enemy.invulnerableTimer = enemy.invulnerableDuration;

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.alive = false;
    }
  }
}

export function touchesEnemy(enemy, hitbox) {
  if (!enemy.alive || !hitbox) {
    return false;
  }

  return overlapsEnemy(enemy, hitbox);
}

export function renderEnemy(ctx, enemy, offset = ZERO_OFFSET) {
  if (!enemy.alive) {
    return;
  }

  if (isEnemyHiddenDuringFlash(enemy)) {
    return;
  }

  const drawEnemy = getDrawEnemy(enemy);

  ctx.fillStyle = ENEMY_COLOR;
  ctx.fillRect(drawEnemy.x + offset.x, drawEnemy.y + offset.y, drawEnemy.width, drawEnemy.height);
}

function isEnemyHiddenDuringFlash(enemy) {
  if (enemy.invulnerableTimer <= 0) {
    return false;
  }

  const elapsedFlashTime = enemy.invulnerableDuration - enemy.invulnerableTimer;
  const flashPhase = Math.floor(elapsedFlashTime / enemy.flashInterval);

  return flashPhase % 2 === 0;
}

function isPlayerInChaseRange(enemy, player) {
  const enemyCenter = getCenter(enemy);
  const playerCenter = getCenter(player);
  const distanceX = playerCenter.x - enemyCenter.x;
  const distanceY = playerCenter.y - enemyCenter.y;
  const distanceToPlayer = Math.hypot(distanceX, distanceY);

  return distanceToPlayer <= enemy.chaseRange;
}

function chasePlayer(enemy, player, deltaTime) {
  moveToward(enemy, getCenter(player), enemy.chaseSpeed * deltaTime);
}

function patrol(enemy, deltaTime) {
  enemy.x += enemy.directionX * enemy.patrolSpeed * deltaTime;

  if (enemy.x <= enemy.patrolMinX) {
    enemy.x = enemy.patrolMinX;
    enemy.directionX = 1;
  }

  if (enemy.x >= enemy.patrolMaxX) {
    enemy.x = enemy.patrolMaxX;
    enemy.directionX = -1;
  }
}

function returnHome(enemy, deltaTime) {
  const distanceX = enemy.homeX - enemy.x;
  const distanceY = enemy.homeY - enemy.y;
  const distanceToHome = Math.hypot(distanceX, distanceY);

  if (distanceToHome === 0) {
    return;
  }

  const returnStep = enemy.patrolSpeed * deltaTime;

  if (returnStep >= distanceToHome) {
    enemy.x = enemy.homeX;
    enemy.y = enemy.homeY;
    enemy.directionX = 1;
    enemy.mode = ENEMY_MODE_PATROL;
    return;
  }

  enemy.x += (distanceX / distanceToHome) * returnStep;
  enemy.y += (distanceY / distanceToHome) * returnStep;
}

function overlapsEnemy(enemy, hitbox) {
  return (
    hitbox.x < enemy.x + enemy.width &&
    hitbox.x + hitbox.width > enemy.x &&
    hitbox.y < enemy.y + enemy.height &&
    hitbox.y + hitbox.height > enemy.y
  );
}

function getDrawEnemy(enemy) {
  return {
    x: Math.round(enemy.x),
    y: Math.round(enemy.y),
    width: enemy.width,
    height: enemy.height
  };
}

function getCenter(entity) {
  return {
    x: entity.x + entity.width / 2,
    y: entity.y + entity.height / 2
  };
}

function moveToward(enemy, target, step) {
  const enemyCenter = getCenter(enemy);
  const distanceX = target.x - enemyCenter.x;
  const distanceY = target.y - enemyCenter.y;
  const distanceToTarget = Math.hypot(distanceX, distanceY);

  if (distanceToTarget === 0) {
    return;
  }

  enemy.x += (distanceX / distanceToTarget) * step;
  enemy.y += (distanceY / distanceToTarget) * step;
}
