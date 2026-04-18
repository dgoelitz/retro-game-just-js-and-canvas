import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";

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

export function destroyProjectilesOnWalls(projectiles, walls) {
  if (walls.length === 0) {
    return;
  }

  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const projectileSweep = getProjectileSweep(projectile);

    if (walls.some((wall) => rectanglesOverlap(projectileSweep, wall))) {
      projectile.active = false;
    }
  }
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

export function damagePlayerFromProjectiles(projectiles, playerHitbox, shieldHitbox, shieldSweep) {
  let damagedPlayer = false;

  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const projectileSweep = getProjectileSweep(projectile);
    const shieldCollisionHitbox = shieldSweep ?? shieldHitbox;

    if (
      projectile.kind === "bullet" &&
      !projectile.deflected &&
      shieldCollisionHitbox &&
      rectanglesOverlap(projectileSweep, shieldCollisionHitbox)
    ) {
      deflectProjectile(projectile, shieldHitbox);
      continue;
    }

    if (projectile.harmsPlayer && rectanglesOverlap(projectileSweep, playerHitbox)) {
      projectile.active = false;
      damagedPlayer = true;
    }
  }

  return damagedPlayer;
}

function deflectProjectile(projectile, shieldHitbox) {
  projectile.deflected = true;
  projectile.harmsPlayer = false;

  if (shieldHitbox.height > shieldHitbox.width) {
    projectile.velocityX *= -1;
    projectile.x = projectile.velocityX > 0
      ? shieldHitbox.x + shieldHitbox.width
      : shieldHitbox.x - projectile.width;
  } else {
    projectile.velocityY *= -1;
    projectile.y = projectile.velocityY > 0
      ? shieldHitbox.y + shieldHitbox.height
      : shieldHitbox.y - projectile.height;
  }

  projectile.previousX = projectile.x;
  projectile.previousY = projectile.y;
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
