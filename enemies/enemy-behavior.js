import { clampToCanvas, rectanglesOverlap, tickTimer } from "../game-utils.js";
import { createProjectile } from "../combat/projectiles.js";
import { ENEMY_COMBAT } from "./enemy-constants.js";
import { getRectangularPathPosition } from "./enemy-paths.js";
import {
  ENEMY_MODE_CHASE,
  ENEMY_MODE_PATROL,
  ENEMY_MODE_RETURN,
  isEnemyStunned
} from "./enemy-state.js";
import {
  getCenter,
  getDirectionVelocity,
  getSnakeSegments,
  getVelocityTowardPlayer,
  moveToward
} from "./enemy-geometry.js";
import {
  applyBossDamageEffects as applyFinalBossDamageEffects,
  canHitBoss,
  stunBossFromProjectile,
  updateBoss
} from "./bosses/final-boss.js";
import {
  applyMinibossDamageEffects as applyMinibossStunDamageEffects,
  canHitMiniboss,
  updateMiniboss
} from "./bosses/miniboss.js";

export { createEnemy } from "./enemy-base.js";

export function updateEnemy(enemy, player, deltaTime, canvas, projectiles, roomEnemies) {
  tickTimer(enemy, "invulnerableTimer", deltaTime);
  tickTimer(enemy, "hitPauseTimer", deltaTime);

  if (!enemy.alive) {
    return;
  }

  switch (enemy.type) {
    case "patrol":
      updatePatrolEnemy(enemy, player, deltaTime, canvas);
      return;
    case "turret":
      updateTurretEnemy(enemy, player, deltaTime, projectiles);
      return;
    case "fixed-turret":
      updateFixedTurretEnemy(enemy, deltaTime, projectiles);
      return;
    case "stone":
      updateOrbitEnemy(enemy, deltaTime, 0.9);
      return;
    case "snake":
      updateSnakeEnemy(enemy, deltaTime);
      return;
    case "miniboss":
      updateMiniboss(enemy, player, deltaTime, canvas, projectiles);
      return;
    case "boss":
      updateBoss(enemy, deltaTime, canvas, roomEnemies);
      return;
    default:
      return;
  }
}

export function hitEnemy(enemy, attackHitbox) {
  if (!canEnemyTakeAttackDamage(enemy, attackHitbox)) {
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
      if (!canProjectileHitEnemy(projectile, enemy)) {
        continue;
      }

      if (destroyFixedTurretFromProjectile(enemy, projectile)) {
        break;
      }

      if (destroyStoneFromProjectile(enemy, projectile)) {
        break;
      }

      if (stunBossFromProjectile(roomEnemies, enemy, projectile)) {
        break;
      }
    }
  }
}

export function touchesEnemy(enemy, hitbox) {
  if (!enemy.alive || !hitbox || isEnemyStunned(enemy) || enemy.hitPauseTimer > 0) {
    return false;
  }

  if (enemy.type === "snake") {
    return getSnakeSegments(enemy).some((segment) => rectanglesOverlap(segment, hitbox));
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
  const velocity = getVelocityTowardPlayer(enemy, player, ENEMY_COMBAT.turretProjectileSpeed);

  spawnBulletProjectile(projectiles, enemy, velocity);
}

function updateFixedTurretEnemy(enemy, deltaTime, projectiles) {
  tickTimer(enemy, "shootTimer", deltaTime);

  if (enemy.shootTimer > 0) {
    return;
  }

  enemy.shootTimer = enemy.shotCooldown;
  const projectileSpeed = enemy.projectileSpeed ?? ENEMY_COMBAT.fixedTurretProjectileSpeed;
  const velocity = getDirectionVelocity(enemy.fixedDirection, projectileSpeed);

  spawnBulletProjectile(projectiles, enemy, velocity);
}

function spawnBulletProjectile(projectiles, enemy, velocity) {
  projectiles.push(createProjectile({
    kind: "bullet",
    x: enemy.x + ENEMY_COMBAT.bulletSpawnOffset,
    y: enemy.y + ENEMY_COMBAT.bulletSpawnOffset,
    velocityX: velocity.x,
    velocityY: velocity.y
  }));
}

function updateOrbitEnemy(enemy, deltaTime, speedMultiplier) {
  enemy.orbitAngle += enemy.orbitSpeed * speedMultiplier * deltaTime;
  enemy.x = enemy.homeX + Math.cos(enemy.orbitAngle) * enemy.orbitRadiusX;
  enemy.y = enemy.homeY + Math.sin(enemy.orbitAngle) * enemy.orbitRadiusY;
}

function updateSnakeEnemy(enemy, deltaTime) {
  if (!enemy.pathRect) {
    updateOrbitEnemy(enemy, deltaTime, 0.5);
    return;
  }

  enemy.pathProgress += enemy.pathSpeed * enemy.pathDirection * deltaTime;

  const headPosition = getRectangularPathPosition(enemy.pathRect, enemy.pathProgress);
  enemy.x = headPosition.x;
  enemy.y = headPosition.y;
}

function canEnemyTakeAttackDamage(enemy, attackHitbox) {
  if (!enemy.alive || !attackHitbox || enemy.invulnerableTimer > 0) {
    return false;
  }

  if (!rectanglesOverlap(enemy, attackHitbox)) {
    return false;
  }

  if (isMeleeImmuneEnemyType(enemy.type)) {
    return false;
  }

  if (enemy.type === "miniboss" && !canHitMiniboss(enemy)) {
    return false;
  }

  if (enemy.type === "boss" && !canHitBoss(enemy)) {
    return false;
  }

  return true;
}

function isMeleeImmuneEnemyType(enemyType) {
  return enemyType === "turret"
    || enemyType === "fixed-turret"
    || enemyType === "stone"
    || enemyType === "snake";
}

function canProjectileHitEnemy(projectile, enemy) {
  return projectile.active && enemy.alive && rectanglesOverlap(enemy, projectile);
}

function destroyFixedTurretFromProjectile(enemy, projectile) {
  if (enemy.type !== "fixed-turret" || !projectile.deflected) {
    return false;
  }

  enemy.alive = false;
  projectile.active = false;
  return true;
}

function destroyStoneFromProjectile(enemy, projectile) {
  if (enemy.type !== "stone") {
    return false;
  }

  enemy.alive = false;
  projectile.active = false;
  return true;
}

function applyEnemyDamage(enemy, amount) {
  enemy.health -= amount;
  enemy.invulnerableTimer = enemy.invulnerableDuration;

  if (enemy.type === "miniboss") {
    applyMinibossStunDamageEffects(enemy);
  }

  if (enemy.type === "boss") {
    applyFinalBossDamageEffects(enemy);
  }

  if (enemy.health <= 0) {
    enemy.health = 0;
    enemy.alive = false;
  }
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
