import { rectanglesOverlap, ZERO_OFFSET } from "../utils.js";

const BULLET_COLOR = "#94b0c2";
const SWORD_PROJECTILE_COLOR = "#fff1e8";
const SWORD_PROJECTILE_HANDLE_COLOR = "#7a4f24";
const SWORD_PROJECTILE_HANDLE_SIZE = 5;

export function createProjectile(overrides = {}) {
  return {
    kind: "bullet",
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    width: 4,
    height: 4,
    velocityX: 0,
    velocityY: 0,
    deflected: false,
    harmsPlayer: true,
    active: true,
    ...overrides
  };
}

export function updateProjectiles(projectiles, deltaTime, canvas) {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.previousX = projectile.x;
    projectile.previousY = projectile.y;
    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;

    if (isOutsideCanvas(projectile, canvas)) {
      projectile.active = false;
    }
  }
}

export function removeInactiveProjectiles(projectiles) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) {
      projectiles.splice(i, 1);
    }
  }
}

export function destroyProjectilesOnWalls(projectiles, walls) {
  if (walls.length === 0) {
    return;
  }

  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    if (walls.some((wall) => projectilePathOverlaps(projectile, wall))) {
      projectile.active = false;
    }
  }
}

export function projectilePathOverlaps(projectile, hitbox) {
  return rectanglesOverlap(getProjectileSweep(projectile), hitbox);
}

export function renderProjectiles(ctx, projectiles, offset = ZERO_OFFSET) {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    if (projectile.kind === "sword-projectile") {
      renderSwordProjectile(ctx, projectile, offset);
      continue;
    }

    ctx.fillStyle = BULLET_COLOR;
    ctx.fillRect(
      Math.round(projectile.x) + offset.x,
      Math.round(projectile.y) + offset.y,
      projectile.width,
      projectile.height
    );
  }
}

function renderSwordProjectile(ctx, projectile, offset) {
  const drawX = Math.round(projectile.x) + offset.x;
  const drawY = Math.round(projectile.y) + offset.y;
  const drawWidth = Math.round(projectile.width);
  const drawHeight = Math.round(projectile.height);
  const handleHeight = Math.min(SWORD_PROJECTILE_HANDLE_SIZE, drawHeight);
  const bladeHeight = drawHeight - handleHeight;

  ctx.fillStyle = SWORD_PROJECTILE_HANDLE_COLOR;
  ctx.fillRect(drawX, drawY, drawWidth, handleHeight);

  if (bladeHeight <= 0) {
    return;
  }

  ctx.fillStyle = SWORD_PROJECTILE_COLOR;
  ctx.fillRect(drawX, drawY + handleHeight, drawWidth, bladeHeight);
}

export function damagePlayerFromProjectiles(projectiles, playerHitbox, shieldMovement) {
  let damagedPlayer = false;

  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const projectileSweep = getProjectileSweep(projectile);
    const shieldCollisionHitbox = shieldMovement?.sweep;

    if (
      projectile.kind === "bullet" &&
      !projectile.deflected &&
      shieldCollisionHitbox &&
      rectanglesOverlap(projectileSweep, shieldCollisionHitbox)
    ) {
      deflectProjectile(projectile, shieldMovement);
      continue;
    }

    if (projectile.harmsPlayer && rectanglesOverlap(projectileSweep, playerHitbox)) {
      projectile.active = false;
      damagedPlayer = true;
    }
  }

  return damagedPlayer;
}

function deflectProjectile(projectile, shieldMovement) {
  projectile.deflected = true;
  projectile.harmsPlayer = false;

  const collisionSide = getShieldCollisionSide(projectile, shieldMovement);
  bounceProjectileAwayFromShield(projectile, shieldMovement.currentHitbox, collisionSide);

  projectile.previousX = projectile.x;
  projectile.previousY = projectile.y;
}

function getShieldCollisionSide(projectile, shieldMovement) {
  const sweptCollisionSide = getSweptCollisionSide(projectile, shieldMovement);

  if (sweptCollisionSide) {
    return sweptCollisionSide;
  }

  return getNearestShieldSide(projectile, shieldMovement.currentHitbox);
}

function getSweptCollisionSide(projectile, shieldMovement) {
  const projectileStart = getProjectilePreviousHitbox(projectile);
  const shieldStart = shieldMovement.previousHitbox;
  const relativeVelocity = getProjectileVelocityRelativeToShield(projectile, shieldMovement);
  const horizontalCollision = getSweptAxisCollision(
    projectileStart.x,
    projectileStart.width,
    shieldStart.x,
    shieldStart.width,
    relativeVelocity.x,
    "left",
    "right"
  );
  const verticalCollision = getSweptAxisCollision(
    projectileStart.y,
    projectileStart.height,
    shieldStart.y,
    shieldStart.height,
    relativeVelocity.y,
    "top",
    "bottom"
  );
  const entryTime = Math.max(horizontalCollision.entryTime, verticalCollision.entryTime);
  const exitTime = Math.min(horizontalCollision.exitTime, verticalCollision.exitTime);

  if (entryTime > exitTime || entryTime < 0 || entryTime > 1) {
    return null;
  }

  if (horizontalCollision.entryTime > verticalCollision.entryTime) {
    return horizontalCollision.entrySide;
  }

  return verticalCollision.entrySide;
}

function getProjectilePreviousHitbox(projectile) {
  const previousX = projectile.previousX ?? projectile.x;
  const previousY = projectile.previousY ?? projectile.y;

  return {
    x: previousX,
    y: previousY,
    width: projectile.width,
    height: projectile.height
  };
}

function getProjectileVelocityRelativeToShield(projectile, shieldMovement) {
  const projectilePreviousX = projectile.previousX ?? projectile.x;
  const projectilePreviousY = projectile.previousY ?? projectile.y;
  const projectileDeltaX = projectile.x - projectilePreviousX;
  const projectileDeltaY = projectile.y - projectilePreviousY;
  const shieldDeltaX = shieldMovement.currentHitbox.x - shieldMovement.previousHitbox.x;
  const shieldDeltaY = shieldMovement.currentHitbox.y - shieldMovement.previousHitbox.y;

  return {
    x: projectileDeltaX - shieldDeltaX,
    y: projectileDeltaY - shieldDeltaY
  };
}

function getSweptAxisCollision(
  movingStart,
  movingSize,
  solidStart,
  solidSize,
  velocity,
  positiveVelocitySide,
  negativeVelocitySide
) {
  const movingEnd = movingStart + movingSize;
  const solidEnd = solidStart + solidSize;

  if (velocity === 0) {
    const alreadyOverlappingOnThisAxis = movingStart < solidEnd && movingEnd > solidStart;

    return {
      entryTime: alreadyOverlappingOnThisAxis
        ? Number.NEGATIVE_INFINITY
        : Number.POSITIVE_INFINITY,
      exitTime: alreadyOverlappingOnThisAxis
        ? Number.POSITIVE_INFINITY
        : Number.NEGATIVE_INFINITY,
      entrySide: null
    };
  }

  const entryDistance = velocity > 0
    ? solidStart - movingEnd
    : solidEnd - movingStart;
  const exitDistance = velocity > 0
    ? solidEnd - movingStart
    : solidStart - movingEnd;

  return {
    entryTime: entryDistance / velocity,
    exitTime: exitDistance / velocity,
    entrySide: velocity > 0 ? positiveVelocitySide : negativeVelocitySide
  };
}

function getNearestShieldSide(projectile, shieldHitbox) {
  const projectileCenterX = projectile.x + projectile.width / 2;
  const projectileCenterY = projectile.y + projectile.height / 2;
  const distanceToLeft = Math.abs(projectileCenterX - shieldHitbox.x);
  const distanceToRight = Math.abs(projectileCenterX - (shieldHitbox.x + shieldHitbox.width));
  const distanceToTop = Math.abs(projectileCenterY - shieldHitbox.y);
  const distanceToBottom = Math.abs(projectileCenterY - (shieldHitbox.y + shieldHitbox.height));
  const nearestHorizontalSide = distanceToLeft < distanceToRight ? "left" : "right";
  const nearestVerticalSide = distanceToTop < distanceToBottom ? "top" : "bottom";
  const nearestHorizontalDistance = Math.min(distanceToLeft, distanceToRight);
  const nearestVerticalDistance = Math.min(distanceToTop, distanceToBottom);

  return nearestHorizontalDistance < nearestVerticalDistance
    ? nearestHorizontalSide
    : nearestVerticalSide;
}

function bounceProjectileAwayFromShield(projectile, shieldHitbox, collisionSide) {
  if (collisionSide === "left") {
    projectile.velocityX = -getReflectedSpeed(projectile.velocityX, projectile.velocityY);
    projectile.x = shieldHitbox.x - projectile.width;
    return;
  }

  if (collisionSide === "right") {
    projectile.velocityX = getReflectedSpeed(projectile.velocityX, projectile.velocityY);
    projectile.x = shieldHitbox.x + shieldHitbox.width;
    return;
  }

  if (collisionSide === "top") {
    projectile.velocityY = -getReflectedSpeed(projectile.velocityY, projectile.velocityX);
    projectile.y = shieldHitbox.y - projectile.height;
    return;
  }

  projectile.velocityY = getReflectedSpeed(projectile.velocityY, projectile.velocityX);
  projectile.y = shieldHitbox.y + shieldHitbox.height;
}

function getReflectedSpeed(perpendicularVelocity, parallelVelocity) {
  if (perpendicularVelocity !== 0) {
    return Math.abs(perpendicularVelocity);
  }

  return Math.max(Math.abs(parallelVelocity) * 0.25, 1);
}

function isOutsideCanvas(projectile, canvas) {
  return (
    projectile.x + projectile.width < 0 ||
    projectile.x > canvas.width ||
    projectile.y + projectile.height < 0 ||
    projectile.y > canvas.height
  );
}

function getProjectileSweep(projectile) {
  const previousX = projectile.previousX ?? projectile.x;
  const previousY = projectile.previousY ?? projectile.y;
  const minX = Math.min(previousX, projectile.x);
  const minY = Math.min(previousY, projectile.y);
  const maxX = Math.max(previousX + projectile.width, projectile.x + projectile.width);
  const maxY = Math.max(previousY + projectile.height, projectile.y + projectile.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
