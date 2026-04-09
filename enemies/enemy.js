import { clampToCanvas, rectanglesOverlap, tickTimer, ZERO_OFFSET } from "../game-utils.js";
import { createProjectile } from "../combat/projectiles.js";

const ENEMY_COLOR_BY_TYPE = {
  patrol: "#e43636",
  turret: "#94b0c2",
  "fixed-turret": "#c2c3c7",
  stone: "#7e7f82",
  snake: "#00a84f",
  miniboss: "#ff77a8",
  boss: "#ff004d"
};

const ENEMY_MODE_PATROL = "patrol";
const ENEMY_MODE_CHASE = "chase";
const ENEMY_MODE_RETURN = "return";
const MINIBOSS_MODE_THROW = "throw";
const MINIBOSS_MODE_SPIN = "spin";
const MINIBOSS_MODE_REST = "rest";
const BOSS_MODE_SLAM = "slam";
const BOSS_MODE_IMPACT = "impact";
const BOSS_MODE_STUNNED = "stunned";

export function createEnemy(overrides = {}) {
  return {
    type: "patrol",
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
    directionY: 1,
    chaseRange: 36,
    mode: ENEMY_MODE_PATROL,
    orbitAngle: 0,
    orbitSpeed: 1.2,
    orbitRadiusX: 10,
    orbitRadiusY: 10,
    shootTimer: 0,
    shotCooldown: 1.2,
    spawnCooldown: 3,
    fixedDirection: "down",
    abilityTimer: 0,
    phaseDuration: 0,
    bounceCount: 0,
    slamAxis: "horizontal",
    slamWall: "top",
    speed: 66,
    impactPauseDuration: 0.22,
    bossTurretCount: 1,
    bossSummoned: false,
    alive: true,
    invincible: false,
    nonBlocking: false,
    ...overrides
  };
}

export function updateEnemy(enemy, player, deltaTime, canvas, projectiles, roomEnemies) {
  tickTimer(enemy, "invulnerableTimer", deltaTime);

  if (!enemy.alive) {
    return;
  }

  if (enemy.type === "patrol") {
    updatePatrolEnemy(enemy, player, deltaTime, canvas);
    return;
  }

  if (enemy.type === "turret") {
    updateTurretEnemy(enemy, player, deltaTime, projectiles);
    return;
  }

  if (enemy.type === "fixed-turret") {
    updateFixedTurretEnemy(enemy, deltaTime, projectiles);
    return;
  }

  if (enemy.type === "stone") {
    updateOrbitEnemy(enemy, deltaTime, 0.9);
    return;
  }

  if (enemy.type === "snake") {
    updateOrbitEnemy(enemy, deltaTime, 0.5);
    return;
  }

  if (enemy.type === "miniboss") {
    updateMiniboss(enemy, player, deltaTime, canvas, projectiles);
    return;
  }

  if (enemy.type === "boss") {
    updateBoss(enemy, player, deltaTime, canvas, roomEnemies);
  }
}

export function hitEnemy(enemy, attackHitbox) {
  if (!enemy.alive || !attackHitbox || enemy.invulnerableTimer > 0) {
    return;
  }

  if (!rectanglesOverlap(enemy, attackHitbox)) {
    return;
  }

  if (enemy.type === "turret" || enemy.type === "fixed-turret" || enemy.type === "stone" || enemy.type === "snake") {
    return;
  }

  if (enemy.type === "miniboss" && enemy.mode !== MINIBOSS_MODE_REST) {
    return;
  }

  if (enemy.type === "boss" && enemy.mode !== BOSS_MODE_STUNNED) {
    return;
  }

  applyEnemyDamage(enemy, 1);
}

export function resolveProjectileHitsOnEnemies(roomEnemies, projectiles) {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    for (const enemy of roomEnemies) {
      if (!enemy.alive || !rectanglesOverlap(enemy, projectile)) {
        continue;
      }

      if (enemy.type === "fixed-turret" && projectile.deflected) {
        enemy.alive = false;
        projectile.active = false;
        break;
      }

      if (enemy.type === "stone") {
        enemy.alive = false;
        projectile.active = false;
        break;
      }

      if (enemy.type === "boss" && projectile.deflected) {
        projectile.active = false;
        enemy.mode = BOSS_MODE_STUNNED;
        enemy.abilityTimer = 2.1;
        enemy.invulnerableTimer = 0;
        enemy.shootTimer = enemy.spawnCooldown;
        removeBossTurrets(roomEnemies);
        break;
      }
    }
  }
}

export function touchesEnemy(enemy, hitbox) {
  if (!enemy.alive || !hitbox) {
    return false;
  }

  return rectanglesOverlap(enemy, hitbox);
}

export function blockEnemyWithShield(enemy, shieldHitbox, playerFacing) {
  if (!enemy.alive || enemy.type !== "patrol" || !shieldHitbox || !rectanglesOverlap(enemy, shieldHitbox)) {
    return false;
  }

  if (playerFacing === "left") {
    enemy.x = shieldHitbox.x - enemy.width;
  } else if (playerFacing === "right") {
    enemy.x = shieldHitbox.x + shieldHitbox.width;
  } else if (playerFacing === "up") {
    enemy.y = shieldHitbox.y - enemy.height;
  } else {
    enemy.y = shieldHitbox.y + shieldHitbox.height;
  }

  return true;
}

export function renderEnemy(ctx, enemy, offset = ZERO_OFFSET) {
  if (!enemy.alive || isEnemyHiddenDuringFlash(enemy)) {
    return;
  }

  const drawEnemy = getDrawEnemy(enemy);
  const color = ENEMY_COLOR_BY_TYPE[enemy.type] ?? ENEMY_COLOR_BY_TYPE.patrol;

  ctx.fillStyle = color;

  if (enemy.type === "miniboss" && enemy.mode === MINIBOSS_MODE_SPIN) {
    ctx.fillRect(drawEnemy.x + offset.x - 2, drawEnemy.y + offset.y - 2, drawEnemy.width + 4, drawEnemy.height + 4);
    return;
  }

  if (enemy.type === "boss") {
    ctx.fillRect(drawEnemy.x + offset.x, drawEnemy.y + offset.y, drawEnemy.width, drawEnemy.height);
    return;
  }

  ctx.fillRect(drawEnemy.x + offset.x, drawEnemy.y + offset.y, drawEnemy.width, drawEnemy.height);
}

function updatePatrolEnemy(enemy, player, deltaTime, canvas) {
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

function updateTurretEnemy(enemy, player, deltaTime, projectiles) {
  tickTimer(enemy, "shootTimer", deltaTime);

  if (enemy.shootTimer > 0) {
    return;
  }

  enemy.shootTimer = enemy.shotCooldown;
  const velocity = getVelocityTowardPlayer(enemy, player, 74);

  projectiles.push(createProjectile({
    kind: "bullet",
    x: enemy.x + 2,
    y: enemy.y + 2,
    velocityX: velocity.x,
    velocityY: velocity.y
  }));
}

function updateFixedTurretEnemy(enemy, deltaTime, projectiles) {
  tickTimer(enemy, "shootTimer", deltaTime);

  if (enemy.shootTimer > 0) {
    return;
  }

  enemy.shootTimer = enemy.shotCooldown;
  const velocity = getDirectionVelocity(enemy.fixedDirection, 78);

  projectiles.push(createProjectile({
    kind: "bullet",
    x: enemy.x + 2,
    y: enemy.y + 2,
    velocityX: velocity.x,
    velocityY: velocity.y
  }));
}

function updateOrbitEnemy(enemy, deltaTime, speedMultiplier) {
  enemy.orbitAngle += enemy.orbitSpeed * speedMultiplier * deltaTime;
  enemy.x = enemy.homeX + Math.cos(enemy.orbitAngle) * enemy.orbitRadiusX;
  enemy.y = enemy.homeY + Math.sin(enemy.orbitAngle) * enemy.orbitRadiusY;
}

function updateMiniboss(enemy, player, deltaTime, canvas, projectiles) {
  enemy.abilityTimer += deltaTime;

  if (enemy.mode === MINIBOSS_MODE_THROW) {
    tickTimer(enemy, "shootTimer", deltaTime);

    if (enemy.shootTimer === 0) {
      enemy.shootTimer = enemy.shotCooldown;
      projectiles.push(createProjectile({
        kind: "sword-projectile",
        x: clampValue(player.x + 2, 4, canvas.width - 8),
        y: 4,
        width: 4,
        height: 8,
        velocityX: 0,
        velocityY: 82
      }));
    }

    if (enemy.abilityTimer >= 3.2) {
      enemy.mode = MINIBOSS_MODE_SPIN;
      enemy.abilityTimer = 0;
      enemy.directionX = Math.random() > 0.5 ? 1 : -1;
      enemy.directionY = Math.random() > 0.5 ? 1 : -1;
    }

    return;
  }

  if (enemy.mode === MINIBOSS_MODE_SPIN) {
    enemy.x += enemy.directionX * 24 * deltaTime;
    enemy.y += enemy.directionY * 24 * deltaTime;

    if (enemy.x <= 4 || enemy.x + enemy.width >= canvas.width - 4) {
      enemy.directionX *= -1;
    }

    if (enemy.y <= 4 || enemy.y + enemy.height >= canvas.height - 4) {
      enemy.directionY *= -1;
    }

    if (enemy.abilityTimer >= 2.2) {
      enemy.mode = MINIBOSS_MODE_REST;
      enemy.abilityTimer = 0;
      enemy.x = canvas.width / 2 - enemy.width / 2;
      enemy.y = 18;
    }

    return;
  }

  if (enemy.abilityTimer >= 1.6) {
    enemy.mode = MINIBOSS_MODE_THROW;
    enemy.abilityTimer = 0;
    enemy.shootTimer = 0;
  }
}

function updateBoss(enemy, player, deltaTime, canvas, roomEnemies) {
  if (enemy.mode === BOSS_MODE_IMPACT) {
    tickTimer(enemy, "abilityTimer", deltaTime);

    if (enemy.abilityTimer === 0) {
      enemy.mode = BOSS_MODE_SLAM;
    }

    return;
  }

  if (enemy.mode === BOSS_MODE_STUNNED) {
    tickTimer(enemy, "abilityTimer", deltaTime);

    if (enemy.abilityTimer === 0) {
      enemy.mode = BOSS_MODE_SLAM;
    }

    return;
  }

  const slamSpeed = getBossSlamSpeed(enemy, canvas);

  if (enemy.slamAxis === "horizontal") {
    enemy.x += enemy.directionX * slamSpeed * deltaTime;
    enemy.y = enemy.slamWall === "top" ? 4 : canvas.height - enemy.height - 4;

    if (enemy.x <= 4 || enemy.x + enemy.width >= canvas.width - 4) {
      enemy.x = enemy.directionX < 0 ? 4 : canvas.width - enemy.width - 4;
      enemy.directionX *= -1;
      enemy.bounceCount += 1;
      startBossImpactPause(enemy);
    }
  } else {
    enemy.y += enemy.directionY * slamSpeed * deltaTime;
    enemy.x = enemy.slamWall === "left" ? 4 : canvas.width - enemy.width - 4;

    if (enemy.y <= 4 || enemy.y + enemy.height >= canvas.height - 4) {
      enemy.y = enemy.directionY < 0 ? 4 : canvas.height - enemy.height - 4;
      enemy.directionY *= -1;
      enemy.bounceCount += 1;
      startBossImpactPause(enemy);
    }
  }

  tickTimer(enemy, "shootTimer", deltaTime);

  if (enemy.shootTimer === 0 && countBossTurrets(roomEnemies) === 0) {
    spawnBossTurrets(enemy, roomEnemies, canvas);
    enemy.shootTimer = enemy.spawnCooldown;
  }

  if (enemy.bounceCount >= 3) {
    enemy.bounceCount = 0;
    switchBossWall(enemy, canvas);
    repositionBossTurrets(enemy, roomEnemies, canvas);
  }
}

function spawnBossTurrets(enemy, roomEnemies, canvas) {
  const bossTurretCount = getBossTurretCount(enemy);
  const turretPositions = getBossTurretPositions(enemy, canvas, bossTurretCount);

  turretPositions.forEach((turretPosition, index) => {
    roomEnemies.push(createEnemy({
      type: "turret",
      x: turretPosition.x,
      y: turretPosition.y,
      width: 8,
      height: 8,
      health: 1,
      invincible: true,
      shotCooldown: 1.1,
      shootTimer: 0.55 + (index * 1.1) / bossTurretCount,
      bossSummoned: true
    }));
  });
}

function getBossSlamSpeed(enemy, canvas) {
  const movementBounds = getBossMovementBounds(enemy, canvas);
  const axisProgress = enemy.slamAxis === "horizontal"
    ? getAxisTravelProgress(enemy.x, movementBounds.minX, movementBounds.maxX, enemy.directionX)
    : getAxisTravelProgress(enemy.y, movementBounds.minY, movementBounds.maxY, enemy.directionY);

  return enemy.speed + axisProgress * 52;
}

function switchBossWall(enemy, canvas) {
  const movementBounds = getBossMovementBounds(enemy, canvas);

  if (enemy.slamAxis === "horizontal") {
    const cornerWall = enemy.x <= movementBounds.minX + 0.5 ? "left" : "right";
    enemy.slamAxis = "vertical";
    enemy.slamWall = cornerWall;
    enemy.directionY = enemy.slamWall === "left"
      ? (enemy.y <= 4 ? 1 : -1)
      : (enemy.y <= 4 ? 1 : -1);
    enemy.x = enemy.slamWall === "left" ? movementBounds.minX : movementBounds.maxX;
    enemy.y = enemy.y <= 4 ? 4 : canvas.height - enemy.height - 4;
    return;
  }

  const cornerWall = enemy.y <= 4 + 0.5 ? "top" : "bottom";
  enemy.slamAxis = "horizontal";
  enemy.slamWall = cornerWall;
  enemy.directionX = enemy.x <= 4 ? 1 : -1;
  enemy.y = enemy.slamWall === "top" ? movementBounds.minY : movementBounds.maxY;
  enemy.x = enemy.x <= 4 ? 4 : canvas.width - enemy.width - 4;
}

function applyEnemyDamage(enemy, amount) {
  enemy.health -= amount;
  enemy.invulnerableTimer = enemy.invulnerableDuration;

  if (enemy.health <= 0) {
    enemy.health = 0;
    enemy.alive = false;
  }
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

function getVelocityTowardPlayer(enemy, player, speed) {
  return getVelocityTowardPoint(getCenter(enemy), getCenter(player), speed);
}

function getVelocityTowardPoint(from, to, speed) {
  const distanceX = to.x - from.x;
  const distanceY = to.y - from.y;
  const distance = Math.hypot(distanceX, distanceY) || 1;

  return {
    x: (distanceX / distance) * speed,
    y: (distanceY / distance) * speed
  };
}

function getDirectionVelocity(direction, speed) {
  if (direction === "left") {
    return { x: -speed, y: 0 };
  }

  if (direction === "right") {
    return { x: speed, y: 0 };
  }

  if (direction === "up") {
    return { x: 0, y: -speed };
  }

  return { x: 0, y: speed };
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getBossMovementBounds(enemy, canvas) {
  return {
    minX: 4,
    maxX: canvas.width - enemy.width - 4,
    minY: 4,
    maxY: canvas.height - enemy.height - 4
  };
}

function getAxisTravelProgress(position, min, max, direction) {
  const span = Math.max(max - min, 1);

  if (direction > 0) {
    return (position - min) / span;
  }

  return (max - position) / span;
}

function getBossTurretCount(enemy) {
  if (enemy.health <= 2) {
    return 3;
  }

  if (enemy.health <= 5) {
    return 2;
  }

  return 1;
}

function countBossTurrets(roomEnemies) {
  return roomEnemies.filter((enemy) => enemy.alive && enemy.bossSummoned).length;
}

function removeBossTurrets(roomEnemies) {
  for (const enemy of roomEnemies) {
    if (enemy.bossSummoned) {
      enemy.alive = false;
    }
  }
}

function repositionBossTurrets(boss, roomEnemies, canvas) {
  const bossTurrets = roomEnemies.filter((enemy) => enemy.alive && enemy.bossSummoned);

  if (bossTurrets.length === 0) {
    return;
  }

  const turretPositions = getBossTurretPositions(boss, canvas, bossTurrets.length);

  bossTurrets.forEach((turret, index) => {
    const position = turretPositions[index];
    turret.x = position.x;
    turret.y = position.y;
    turret.shootTimer = Math.max(turret.shootTimer, 0.45);
  });
}

function getBossTurretPositions(boss, canvas, turretCount) {
  const movementBounds = getBossMovementBounds(boss, canvas);
  const turretSpacing = 18;
  const bossCenter = getCenter(boss);
  const positions = [];

  for (let index = 0; index < turretCount; index += 1) {
    const spreadOffset = (index - (turretCount - 1) / 2) * turretSpacing;

    if (boss.slamAxis === "horizontal") {
      positions.push({
        x: clampValue(bossCenter.x - 4 + spreadOffset, movementBounds.minX, movementBounds.maxX),
        y: boss.slamWall === "top" ? 0 : canvas.height - 8
      });
      continue;
    }

    positions.push({
      x: boss.slamWall === "left" ? 0 : canvas.width - 8,
      y: clampValue(bossCenter.y - 4 + spreadOffset, movementBounds.minY, movementBounds.maxY)
    });
  }

  return positions;
}

function startBossImpactPause(enemy) {
  enemy.mode = BOSS_MODE_IMPACT;
  enemy.abilityTimer = enemy.impactPauseDuration;
}
