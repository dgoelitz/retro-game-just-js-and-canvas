import { createEnemy } from "../index.js";
import { getRectangularPathHalfwayPoint, getRectangularPathPosition } from "../core/paths.js";

export function createPatrolEnemy({ x = 100, y = 48, patrolMinX = 88, patrolMaxX = 112 } = {}) {
  return createEnemy({
    type: "patrol",
    x,
    y,
    homeX: x,
    homeY: y,
    health: 1,
    patrolMinX,
    patrolMaxX
  });
}

export function createTurretEnemy(overrides = {}) {
  return createEnemy({
    type: "turret",
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    chaseRange: 0,
    ...overrides
  });
}

export function createFixedTurretEnemy(overrides = {}) {
  return createEnemy({
    type: "fixed-turret",
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    ...overrides
  });
}

export function createStoneEnemy(overrides = {}) {
  const centerX = overrides.x ?? 100;
  const centerY = overrides.y ?? 48;
  const orbitRadiusX = overrides.orbitRadiusX ?? 10;
  const orbitRadiusY = overrides.orbitRadiusY ?? 10;
  const orbitAngle = overrides.orbitAngle ?? 0;

  return createEnemy({
    type: "stone",
    x: centerX + Math.cos(orbitAngle) * orbitRadiusX,
    y: centerY + Math.sin(orbitAngle) * orbitRadiusY,
    homeX: centerX,
    homeY: centerY,
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    orbitAngle,
    orbitRadiusX,
    orbitRadiusY,
    ...overrides
  });
}

export function createRectangularSnakeEnemy(overrides = {}) {
  const pathRect = overrides.pathRect ?? { left: 4, top: 4, right: 148, bottom: 78 };
  const pathProgress = overrides.pathProgress ?? 0;
  const startPosition = getRectangularPathPosition(pathRect, pathProgress);

  return createEnemy({
    type: "snake",
    x: startPosition.x,
    y: startPosition.y,
    width: 8,
    height: 8,
    health: 99,
    invincible: true,
    pathRect,
    pathProgress,
    pathDirection: overrides.pathDirection ?? 1,
    pathSpeed: overrides.pathSpeed ?? 22,
    bodyLength: overrides.bodyLength ?? 5,
    bodySpacing: overrides.bodySpacing ?? 7,
    ...overrides
  });
}

export function createSnakePair(overrides) {
  return [
    createRectangularSnakeEnemy(overrides),
    createRectangularSnakeEnemy({
      ...overrides,
      pathProgress: overrides.pathProgress + getRectangularPathHalfwayPoint(overrides.pathRect)
    })
  ];
}
