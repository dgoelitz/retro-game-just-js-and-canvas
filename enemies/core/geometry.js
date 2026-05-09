import { getRectangularPathPosition } from "./paths.js";

export function getDrawEnemy(enemy) {
  return {
    x: Math.round(enemy.x),
    y: Math.round(enemy.y),
    width: enemy.width,
    height: enemy.height
  };
}

export function getSnakeSegments(enemy) {
  const segments = [];

  for (let i = 0; i < enemy.bodyLength; i += 1) {
    const segmentProgress = enemy.pathProgress - i * enemy.bodySpacing * enemy.pathDirection;
    const segmentPosition = getRectangularPathPosition(enemy.pathRect, segmentProgress);

    segments.push({
      x: segmentPosition.x,
      y: segmentPosition.y,
      width: enemy.width,
      height: enemy.height
    });
  }

  return segments;
}

export function getCenter(entity) {
  return {
    x: entity.x + entity.width / 2,
    y: entity.y + entity.height / 2
  };
}

export function moveToward(enemy, target, step) {
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

export function getVelocityTowardPlayer(enemy, player, speed) {
  return getVelocityTowardPoint(getCenter(enemy), getCenter(player), speed);
}

export function getVelocityTowardPoint(from, to, speed) {
  const distanceX = to.x - from.x;
  const distanceY = to.y - from.y;
  const distance = Math.hypot(distanceX, distanceY) || 1;

  return {
    x: (distanceX / distance) * speed,
    y: (distanceY / distance) * speed
  };
}

export function getDirectionVelocity(direction, speed) {
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

export function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
