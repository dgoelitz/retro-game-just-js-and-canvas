import { tickTimer } from "../../game-utils.js";
import { createEnemy } from "../enemy-base.js";
import { clampValue, getCenter } from "../enemy-geometry.js";
import {
  BOSS_MODE_IMPACT,
  BOSS_MODE_SLAM,
  BOSS_MODE_STUNNED
} from "../enemy-state.js";

const ROOM_PADDING = 4;
const SPEED_RAMP = 52;
const TURRET_SIZE = 8;
const TURRET_SPACING = 18;
const TURRET_SHOT_COOLDOWN = 1.1;
const TURRET_SHOT_DELAY = 0.55;
const TURRET_REPOSITION_DELAY = 0.45;
const WALL_SWITCH_BOUNCES = 3;
const STUN_DURATION = 2.1;
const HIT_PAUSE_DURATION = 0.12;

export function createBossEnemy() {
  return createEnemy({
    type: "boss",
    x: 66,
    y: ROOM_PADDING,
    homeX: 66,
    homeY: ROOM_PADDING,
    width: 18,
    height: 18,
    health: 8,
    mode: BOSS_MODE_SLAM,
    slamAxis: "horizontal",
    slamWall: "top",
    directionX: 1,
    directionY: 1,
    speed: 34,
    shotCooldown: 2.4,
    shootTimer: 1.2
  });
}

export function updateBoss(enemy, deltaTime, canvas, roomEnemies) {
  if (enemy.hitPauseTimer > 0) {
    return;
  }

  if (enemy.mode === BOSS_MODE_IMPACT || enemy.mode === BOSS_MODE_STUNNED) {
    tickTimer(enemy, "abilityTimer", deltaTime);

    if (enemy.abilityTimer === 0) {
      enemy.mode = BOSS_MODE_SLAM;
    }

    return;
  }

  updateBossSlam(enemy, deltaTime, canvas);
  updateBossTurretSpawns(enemy, deltaTime, canvas, roomEnemies);

  if (enemy.bounceCount < WALL_SWITCH_BOUNCES) {
    return;
  }

  enemy.bounceCount = 0;
  switchBossWall(enemy, canvas);
  repositionBossTurrets(enemy, roomEnemies, canvas);
}

export function canHitBoss(enemy) {
  return enemy.mode === BOSS_MODE_STUNNED;
}

export function applyBossDamageEffects(enemy) {
  enemy.mode = BOSS_MODE_SLAM;
  enemy.abilityTimer = 0;
  enemy.shootTimer = enemy.spawnCooldown;
  enemy.hitPauseTimer = HIT_PAUSE_DURATION;
}

export function stunBossFromProjectile(roomEnemies, enemy, projectile) {
  if (enemy.type !== "boss" || !projectile.deflected) {
    return false;
  }

  projectile.active = false;
  enemy.mode = BOSS_MODE_STUNNED;
  enemy.abilityTimer = STUN_DURATION;
  enemy.invulnerableTimer = 0;
  enemy.shootTimer = enemy.spawnCooldown;
  enemy.hitPauseTimer = HIT_PAUSE_DURATION;
  removeBossTurrets(roomEnemies);
  return true;
}

function updateBossSlam(enemy, deltaTime, canvas) {
  const slamSpeed = getSlamSpeed(enemy, canvas);

  if (enemy.slamAxis === "horizontal") {
    enemy.x += enemy.directionX * slamSpeed * deltaTime;
    enemy.y = enemy.slamWall === "top"
      ? ROOM_PADDING
      : canvas.height - enemy.height - ROOM_PADDING;

    if (!touchesHorizontalWall(enemy, canvas)) {
      return;
    }

    enemy.x = enemy.directionX < 0
      ? ROOM_PADDING
      : canvas.width - enemy.width - ROOM_PADDING;
    enemy.directionX *= -1;
    enemy.bounceCount += 1;
    startImpactPause(enemy);
    return;
  }

  enemy.y += enemy.directionY * slamSpeed * deltaTime;
  enemy.x = enemy.slamWall === "left"
    ? ROOM_PADDING
    : canvas.width - enemy.width - ROOM_PADDING;

  if (!touchesVerticalWall(enemy, canvas)) {
    return;
  }

  enemy.y = enemy.directionY < 0
    ? ROOM_PADDING
    : canvas.height - enemy.height - ROOM_PADDING;
  enemy.directionY *= -1;
  enemy.bounceCount += 1;
  startImpactPause(enemy);
}

function updateBossTurretSpawns(enemy, deltaTime, canvas, roomEnemies) {
  tickTimer(enemy, "shootTimer", deltaTime);

  if (enemy.shootTimer > 0 || countBossTurrets(roomEnemies) > 0) {
    return;
  }

  const turretCount = getTurretCount(enemy);
  const turretPositions = getTurretPositions(enemy, canvas, turretCount);

  turretPositions.forEach((turretPosition, index) => {
    roomEnemies.push(createEnemy({
      type: "turret",
      x: turretPosition.x,
      y: turretPosition.y,
      width: TURRET_SIZE,
      height: TURRET_SIZE,
      health: 1,
      invincible: true,
      shotCooldown: TURRET_SHOT_COOLDOWN,
      shootTimer: TURRET_SHOT_DELAY + (index * TURRET_SHOT_COOLDOWN) / turretCount,
      bossSummoned: true
    }));
  });

  enemy.shootTimer = enemy.spawnCooldown;
}

function getSlamSpeed(enemy, canvas) {
  const movementBounds = getMovementBounds(enemy, canvas);
  const axisProgress = enemy.slamAxis === "horizontal"
    ? getAxisTravelProgress(enemy.x, movementBounds.minX, movementBounds.maxX, enemy.directionX)
    : getAxisTravelProgress(enemy.y, movementBounds.minY, movementBounds.maxY, enemy.directionY);

  return enemy.speed + axisProgress * SPEED_RAMP;
}

function switchBossWall(enemy, canvas) {
  const movementBounds = getMovementBounds(enemy, canvas);

  if (enemy.slamAxis === "horizontal") {
    const cornerWall = enemy.x <= movementBounds.minX + 0.5 ? "left" : "right";

    enemy.slamAxis = "vertical";
    enemy.slamWall = cornerWall;
    enemy.directionY = enemy.y <= ROOM_PADDING ? 1 : -1;
    enemy.x = enemy.slamWall === "left" ? movementBounds.minX : movementBounds.maxX;
    enemy.y = enemy.y <= ROOM_PADDING
      ? ROOM_PADDING
      : canvas.height - enemy.height - ROOM_PADDING;
    return;
  }

  const cornerWall = enemy.y <= ROOM_PADDING + 0.5 ? "top" : "bottom";
  enemy.slamAxis = "horizontal";
  enemy.slamWall = cornerWall;
  enemy.directionX = enemy.x <= ROOM_PADDING ? 1 : -1;
  enemy.y = enemy.slamWall === "top" ? movementBounds.minY : movementBounds.maxY;
  enemy.x = enemy.x <= ROOM_PADDING
    ? ROOM_PADDING
    : canvas.width - enemy.width - ROOM_PADDING;
}

function getMovementBounds(enemy, canvas) {
  return {
    minX: ROOM_PADDING,
    maxX: canvas.width - enemy.width - ROOM_PADDING,
    minY: ROOM_PADDING,
    maxY: canvas.height - enemy.height - ROOM_PADDING
  };
}

function touchesHorizontalWall(enemy, canvas) {
  return enemy.x <= ROOM_PADDING || enemy.x + enemy.width >= canvas.width - ROOM_PADDING;
}

function touchesVerticalWall(enemy, canvas) {
  return enemy.y <= ROOM_PADDING || enemy.y + enemy.height >= canvas.height - ROOM_PADDING;
}

function getAxisTravelProgress(position, min, max, direction) {
  const span = Math.max(max - min, 1);

  if (direction > 0) {
    return (position - min) / span;
  }

  return (max - position) / span;
}

function getTurretCount(enemy) {
  if (enemy.health <= 2) {
    return 3;
  }

  if (enemy.health <= 5) {
    return 2;
  }

  return 1;
}

function countBossTurrets(roomEnemies) {
  return roomEnemies.filter((roomEnemy) => roomEnemy.alive && roomEnemy.bossSummoned).length;
}

function removeBossTurrets(roomEnemies) {
  for (const roomEnemy of roomEnemies) {
    if (roomEnemy.bossSummoned) {
      roomEnemy.alive = false;
    }
  }
}

function repositionBossTurrets(boss, roomEnemies, canvas) {
  const bossTurrets = roomEnemies.filter((roomEnemy) => roomEnemy.alive && roomEnemy.bossSummoned);

  if (bossTurrets.length === 0) {
    return;
  }

  const turretPositions = getTurretPositions(boss, canvas, bossTurrets.length);

  bossTurrets.forEach((turret, index) => {
    const position = turretPositions[index];
    turret.x = position.x;
    turret.y = position.y;
    turret.shootTimer = Math.max(turret.shootTimer, TURRET_REPOSITION_DELAY);
  });
}

function getTurretPositions(boss, canvas, turretCount) {
  const movementBounds = getMovementBounds(boss, canvas);
  const bossCenter = getCenter(boss);
  const positions = [];

  for (let index = 0; index < turretCount; index += 1) {
    const spreadOffset = (index - (turretCount - 1) / 2) * TURRET_SPACING;

    if (boss.slamAxis === "horizontal") {
      positions.push({
        x: clampValue(bossCenter.x - 4 + spreadOffset, movementBounds.minX, movementBounds.maxX),
        y: boss.slamWall === "top" ? 0 : canvas.height - TURRET_SIZE
      });
      continue;
    }

    positions.push({
      x: boss.slamWall === "left" ? 0 : canvas.width - TURRET_SIZE,
      y: clampValue(bossCenter.y - 4 + spreadOffset, movementBounds.minY, movementBounds.maxY)
    });
  }

  return positions;
}

function startImpactPause(enemy) {
  enemy.mode = BOSS_MODE_IMPACT;
  enemy.abilityTimer = enemy.impactPauseDuration;
}
