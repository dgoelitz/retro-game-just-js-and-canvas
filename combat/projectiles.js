import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";

const BULLET_COLOR = "#94b0c2";
const SWORD_PROJECTILE_COLOR = "#fff1e8";

export function createProjectile(overrides = {}) {
  return {
    kind: "bullet",
    x: 0,
    y: 0,
    width: 4,
    height: 4,
    velocityX: 0,
    velocityY: 0,
    deflected: false,
    active: true,
    ...overrides
  };
}

export function updateProjectiles(projectiles, deltaTime, canvas) {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;

    if (isOutsideCanvas(projectile, canvas)) {
      projectile.active = false;
    }
  }
}

export function renderProjectiles(ctx, projectiles, offset = ZERO_OFFSET) {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    const color = projectile.kind === "bullet" ? BULLET_COLOR : SWORD_PROJECTILE_COLOR;

    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(projectile.x) + offset.x,
      Math.round(projectile.y) + offset.y,
      projectile.width,
      projectile.height
    );
  }
}

export function damagePlayerFromProjectiles(projectiles, playerHitbox, shieldHitbox) {
  let damagedPlayer = false;

  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    if (projectile.kind === "bullet" && shieldHitbox && rectanglesOverlap(projectile, shieldHitbox)) {
      deflectProjectile(projectile, shieldHitbox);
      continue;
    }

    if (rectanglesOverlap(projectile, playerHitbox)) {
      projectile.active = false;
      damagedPlayer = true;
    }
  }

  return damagedPlayer;
}

function deflectProjectile(projectile, shieldHitbox) {
  projectile.deflected = true;

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
}

function isOutsideCanvas(projectile, canvas) {
  return (
    projectile.x + projectile.width < 0 ||
    projectile.x > canvas.width ||
    projectile.y + projectile.height < 0 ||
    projectile.y > canvas.height
  );
}
