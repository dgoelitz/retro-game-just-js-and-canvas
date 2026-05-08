export const ZERO_OFFSET = {
  x: 0,
  y: 0
};

export function tickTimer(target, key, deltaTime) {
  if (target[key] <= 0) {
    return;
  }

  target[key] -= deltaTime;

  if (target[key] < 0) {
    target[key] = 0;
  }
}

export function clampToCanvas(entity, canvas) {
  if (entity.x < 0) entity.x = 0;
  if (entity.y < 0) entity.y = 0;
  if (entity.x + entity.width > canvas.width) entity.x = canvas.width - entity.width;
  if (entity.y + entity.height > canvas.height) entity.y = canvas.height - entity.height;
}

export function rectanglesOverlap(a, b) {
  return (
    b.x < a.x + a.width &&
    b.x + b.width > a.x &&
    b.y < a.y + a.height &&
    b.y + b.height > a.y
  );
}

export function rectanglesOverlapAny(rects, hitbox) {
  return rects.some((rect) => rectanglesOverlap(rect, hitbox));
}

export function getRoundedHitbox(entity) {
  return {
    x: Math.round(entity.x),
    y: Math.round(entity.y),
    width: entity.width,
    height: entity.height
  };
}

export function expandRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  };
}

export function resolveAxisSeparatedCollision(entity, previousPosition, collidesWithHitbox) {
  if (!collidesWithHitbox(getRoundedHitbox(entity))) {
    return false;
  }

  const movedPosition = {
    x: entity.x,
    y: entity.y
  };

  entity.x = previousPosition.x;
  entity.y = movedPosition.y;

  if (!collidesWithHitbox(getRoundedHitbox(entity))) {
    return true;
  }

  entity.x = movedPosition.x;
  entity.y = previousPosition.y;

  if (!collidesWithHitbox(getRoundedHitbox(entity))) {
    return true;
  }

  entity.x = previousPosition.x;
  entity.y = previousPosition.y;
  return true;
}
