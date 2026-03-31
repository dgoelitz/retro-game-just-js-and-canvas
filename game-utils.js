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
